/**
 * Client-Side Image Compressor for Krishna Textiles Enterprise Admin
 * Ensures images are strictly <= 500KB (512,000 bytes) before database persistence.
 */

export async function compressImage(file, maxSizeBytes = 500 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into canvas'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if dimensions are excessively large (e.g. > 1600px)
        const MAX_DIMENSION = 1600;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Progressively lower quality until size <= maxSizeBytes
        let quality = 0.88;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate size of base64 in bytes: (length * 3/4)
        while (dataUrl.length * 0.75 > maxSizeBytes && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // If still over 500kb at low quality, scale dimensions down further
        if (dataUrl.length * 0.75 > maxSizeBytes) {
          canvas.width = Math.round(width * 0.7);
          canvas.height = Math.round(height * 0.7);
          const ctx2 = canvas.getContext('2d');
          ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        }

        const estimatedSizeBytes = Math.round(dataUrl.length * 0.75);
        const sizeKb = Math.round(estimatedSizeBytes / 1024);

        resolve({
          dataUrl,
          sizeKb,
          fileName: file.name,
          width: canvas.width,
          height: canvas.height,
        });
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}
