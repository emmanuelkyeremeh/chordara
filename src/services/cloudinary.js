// Cloudinary service for file uploads
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file, folder = 'chordara') => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Check file size (limit to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.size} bytes. Maximum allowed: ${maxSize} bytes`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Determine resource type based on file type
    let resourceType = 'auto';
    if (file.type.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary treats audio as video
    } else if (file.type.startsWith('image/')) {
      resourceType = 'image';
    }

    formData.append('resource_type', resourceType);

    // Add quality settings for audio files
    if (file.type.startsWith('audio/')) {
      formData.append('quality', 'auto:low'); // Compress audio for smaller file size
      // Note: format parameter removed as it's not allowed in upload preset
    }

    console.log('🎵 Uploading to Cloudinary:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      resourceType: resourceType,
      folder: folder
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🎵 Cloudinary upload successful:', {
      publicId: data.public_id,
      url: data.secure_url,
      format: data.format,
      bytes: data.bytes
    });

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
