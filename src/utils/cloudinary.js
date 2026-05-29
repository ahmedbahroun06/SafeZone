/**
 * Shared utility for uploading images to Cloudinary.
 * @param {File} file - The image file to upload.
 * @param {Function} t - The translation function (e.g. from useTranslation).
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (file, t) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary configuration missing:", { cloudName, uploadPreset });
    throw new Error(t ? t('report.uploadConfigError') : "Cloudinary configuration missing");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary API error:", errorData);
      throw new Error(errorData.error?.message || (t ? t('report.uploadError') : "Failed to upload image"));
    }

    const data = await response.json();
    return data.secure_url || "";
  } catch (err) {
    console.error("Cloudinary upload catch:", err);
    throw err;
  }
};
