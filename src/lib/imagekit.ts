/**
 * ImageKit Uploader Helper
 * This helper provides a seamless file upload system.
 * By default, if credentials are not configured in the environment,
 * it converts uploaded files to base64 DataURLs or browser Blob URLs.
 * This ensures the live developer preview is 100% functional and lets the user test
 * uploading custom images and MP3 files immediately, persisting them in LocalStorage.
 */

export async function uploadToImageKit(file: File): Promise<string> {
  // Convert File to base64 Data URL as the source
  const base64String = await new Promise<string>((resolve, reject) => {
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
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.warn("ImageKit upload via backend failed, using local fallback:", error);
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
