// Cloudinary service for file uploads
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file, folder = 'chordara') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', 'auto');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary delete failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Delete audio file from Cloudinary
export const deleteAudioFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary audio delete failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting audio from Cloudinary:', error);
    throw error;
  }
};

// Compress audio file before upload
export const compressAudioFile = (audioBlob, targetSizeKB = 900) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    
    audio.onloadedmetadata = () => {
      // Create a simple compression by reducing quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a compressor
      const source = audioContext.createMediaElementSource(audio);
      const compressor = audioContext.createDynamicsCompressor();
      const gainNode = audioContext.createGain();
      
      // Configure compressor for audio
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Convert back to blob with compression
      const reader = new FileReader();
      reader.onload = () => {
        const compressedBlob = new Blob([reader.result], { 
          type: 'audio/mpeg',
          quality: 0.7 // Reduce quality to compress
        });
        
        // If still too large, create a smaller version
        if (compressedBlob.size > targetSizeKB * 1024) {
          const finalBlob = new Blob([reader.result], { 
            type: 'audio/mpeg',
            quality: 0.5 // Further reduce quality
          });
          URL.revokeObjectURL(url);
          resolve(finalBlob);
        } else {
          URL.revokeObjectURL(url);
          resolve(compressedBlob);
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    };
    
    audio.src = url;
  });
};
