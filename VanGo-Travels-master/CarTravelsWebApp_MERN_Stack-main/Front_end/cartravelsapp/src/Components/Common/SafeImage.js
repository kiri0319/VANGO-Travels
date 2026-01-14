import React, { useState } from 'react';

const SafeImage = ({ 
    src, 
    alt = 'Image', 
    fallbackSrc = 'https://via.placeholder.com/300x200?text=Image+Not+Found',
    className = '',
    style = {},
    width,
    height,
    objectFit = 'cover',
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImageSrc(fallbackSrc);
        }
        setIsLoading(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const imageStyle = {
        ...style,
        objectFit: objectFit,
        ...(width && { width }),
        ...(height && { height })
    };

    return (
        <div className={`safe-image-container ${className}`} style={{ position: 'relative' }}>
            {isLoading && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        fontSize: '14px'
                    }}
                >
                    Loading...
                </div>
            )}
            <img
                src={imageSrc}
                alt={alt}
                onError={handleError}
                onLoad={handleLoad}
                style={imageStyle}
                {...props}
            />
            {hasError && (
                <div 
                    style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px'
                    }}
                >
                    Fallback
                </div>
            )}
        </div>
    );
};

export default SafeImage;