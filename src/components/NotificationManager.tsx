import { useEffect, useRef } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { PushNotificationPayload } from '../types';

export default function NotificationManager() {
  const pageLoadTime = useRef(Date.now());
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    const registerSubscription = async () => {
      let subId = localStorage.getItem('mm_notif_sub_id');
      if (!subId) {
        subId = "sub_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('mm_notif_sub_id', subId);
      }
      try {
        await db.addPushSubscription(subId);
      } catch (error) {
        console.error("Failed to register subscription:", error);
      }
    };

    // Ask for permission immediately on first visit
    if (Notification.permission === 'default' && !hasRequested.current) {
      hasRequested.current = true;
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          registerSubscription();
          // Show a welcome notification
          new Notification("मंसा महादेव मंदिर तितरड़ी", {
            body: "पुश नोटिफिकेशन सेवा में आपका स्वागत है!",
            icon: "/favicon.ico"
          });
        }
      });
    } else if (Notification.permission === 'granted') {
      registerSubscription();
    }

    const showBrowserNotification = (notif: PushNotificationPayload) => {
      if (Notification.permission !== 'granted') return;

      const shownKey = `mm_shown_pnotif_${notif.id}`;
      if (localStorage.getItem(shownKey) === 'true') return;

      localStorage.setItem(shownKey, 'true');

      const options: any = {
        body: notif.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notif.id,
        requireInteraction: true
      };

      if (notif.imageUrl && notif.imageUrl.trim()) {
        options.image = notif.imageUrl.trim();
      }

      const browserNotification = new Notification(notif.title, options);

      browserNotification.onclick = (e) => {
        e.preventDefault();
        if (notif.targetUrl && notif.targetUrl.trim()) {
          window.open(notif.targetUrl.trim(), '_blank');
        } else {
          window.focus();
        }
        browserNotification.close();
      };
    };

    const handleDBChange = () => {
      const list = db.getPushNotifications();
      if (list.length > 0) {
        const latest = list[0];
        const sentTime = new Date(latest.sentAt).getTime();
        
        // If notification is sent after page load (or extremely recently within 10 seconds of page load)
        if (sentTime > pageLoadTime.current - 10000) {
          showBrowserNotification(latest);
        }
      }
    };

    // Listen to real-time changes
    const unsubscribe = subscribeToDBUpdates(handleDBChange);

    // Run once on load for any pending notifications that were sent in the last 15 seconds
    handleDBChange();

    return unsubscribe;
  }, []);

  return null; // This component runs purely in the background
}
