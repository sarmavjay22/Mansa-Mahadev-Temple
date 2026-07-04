/**
 * ImageKit Uploader Helper
 * This helper provides a seamless file upload system.
 * By default, if credentials are not configured in the environment,
 * it converts uploaded files to base64 DataURLs or browser Blob URLs.
 * This ensures the live developer preview is 100% functional and lets the user test
 * uploading custom images and MP3 files immediately, persisting them in LocalStorage.
 */

function compressImage(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve('');
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string || '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as jpeg to drastically reduce size
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string || '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function uploadToImageKit(file: File): Promise<string> {
  // Compress and convert File to base64 Data URL as the source
  const base64String = await compressImage(file).catch(async () => {
    // Fallback if compression fails
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to string"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  });

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64String,
        fileName: file.name,
      }),
    });

    if (!response.ok) {
      console.log("Local fallback activated for media item.");
      return base64String;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.log("Local fallback activated for media item.");
    return base64String;
  }
}

/**
 * Format files for display/storage
 */
export function getOptimizedImageUrl(url: string, width = 600): string {
  // If it's an ImageKit URL, we can append width parameters
  if (url.includes('ik.imagekit.io')) {
    return `${url}?tr=w-${width},q-80`;
  }
  return url; // fallback for local/unsplash images
}
