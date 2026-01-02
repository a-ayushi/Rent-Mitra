import React, { useState, useRef, useCallback } from 'react';

const MagnifyingGlass = ({ 
  src, 
  alt, 
  width = '100%', 
  height = '100%',
  zoomLevel = 2.5,
  lensSize = 150,
  className = ''
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !imageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the image
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;
    
    // Calculate position as percentage (0-1)
    const xPercent = x / imageRect.width;
    const yPercent = y / imageRect.height;
    
    // Calculate lens position (centered on mouse)
    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;
    
    // Constrain lens within image bounds
    const constrainedLensX = Math.max(0, Math.min(lensX, imageRect.width - lensSize));
    const constrainedLensY = Math.max(0, Math.min(lensY, imageRect.height - lensSize));
    
    setPosition({ x: xPercent, y: yPercent });
    setLensPosition({ x: constrainedLensX, y: constrainedLensY });
  }, [lensSize]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        draggable={false}
      />
      
      {isHovering && (
        <>
          {/* Lens */}
          <div
            className="absolute border-2 border-gray-800 pointer-events-none z-10"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)',
            }}
          />
          
          {/* Magnified view */}
          <div
            className="absolute border-2 border-gray-800 pointer-events-none z-20 bg-white shadow-xl"
            style={{
              width: `${lensSize * 2}px`,
              height: `${lensSize * 2}px`,
              left: `${lensPosition.x - lensSize / 2}px`,
              top: `${lensPosition.y - lensSize / 2}px`,
              backgroundImage: `url(${src})`,
              backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
              backgroundSize: `${zoomLevel * 100}% ${zoomLevel * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        </>
      )}
    </div>
  );
};

export default MagnifyingGlass;