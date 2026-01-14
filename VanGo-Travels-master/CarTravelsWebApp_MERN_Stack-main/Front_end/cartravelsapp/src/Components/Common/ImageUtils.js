// Image validation and utility functions
export const ImageUtils = {
    // Validate if URL is a valid image
    isValidImageUrl: (url) => {
        if (!url) return false;
        
        try {
            new URL(url);
        } catch {
            return false;
        }
        
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
        return imageExtensions.test(url);
    },

    // Get placeholder image based on context
    getPlaceholderImage: (context = 'default', width = 300, height = 200) => {
        const placeholders = {
            'tour-package': `https://via.placeholder.com/${width}x${height}?text=Tour+Package`,
            'car-image': `https://via.placeholder.com/${width}x${height}?text=Car+Image`,
            'gallery': `https://via.placeholder.com/${width}x${height}?text=Gallery`,
            'user-avatar': `https://via.placeholder.com/${width}x${height}?text=User`,
            'admin': `https://via.placeholder.com/${width}x${height}?text=Admin`,
            'driver': `https://via.placeholder.com/${width}x${height}?text=Driver`,
            'default': `https://via.placeholder.com/${width}x${height}?text=Image+Not+Found`
        };
        
        return placeholders[context] || placeholders.default;
    },

    // Preload image to check if it exists
    preloadImage: (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject(new Error('Image failed to load'));
            img.src = src;
        });
    },

    // Get image dimensions
    getImageDimensions: (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = src;
        });
    },

    // Resize image URL (for external services)
    resizeImageUrl: (url, width, height) => {
        if (!url) return ImageUtils.getPlaceholderImage('default', width, height);
        
        // For placeholder service
        if (url.includes('via.placeholder.com')) {
            return `https://via.placeholder.com/${width}x${height}?text=Image`;
        }
        
        // For other services, you might want to add specific logic
        return url;
    },

    // Common image error handler
    handleImageError: (e, fallbackContext = 'default') => {
        e.target.src = ImageUtils.getPlaceholderImage(fallbackContext);
        e.target.style.opacity = '0.7';
    }
};

// Default image configurations for different contexts
export const ImageConfigs = {
    tourPackage: {
        width: 340,
        height: 250,
        fallback: 'tour-package',
        objectFit: 'cover'
    },
    carImage: {
        width: 300,
        height: 200,
        fallback: 'car-image',
        objectFit: 'cover'
    },
    gallery: {
        width: 200,
        height: 150,
        fallback: 'gallery',
        objectFit: 'cover'
    },
    carousel: {
        width: 1200,
        height: 400,
        fallback: 'default',
        objectFit: 'cover'
    },
    avatar: {
        width: 100,
        height: 100,
        fallback: 'user-avatar',
        objectFit: 'cover'
    }
};

export default ImageUtils;