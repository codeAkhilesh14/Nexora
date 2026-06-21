import { useState, useRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Card = ({ className, children, tilt = true, style, ...props }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;
    
    const x = xVal - rect.width / 2;
    const y = yVal - rect.height / 2;
    
    const rx = -(y / (rect.height / 2)) * 4.5;
    const ry = (x / (rect.width / 2)) * 4.5;
    
    setRotation({ x: rx, y: ry });
    setMousePos({
      x: (xVal / rect.width) * 100,
      y: (yVal / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    if (tilt) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const transformStyle = tilt
    ? {
        transform: isHovered 
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
        transformStyle: 'preserve-3d',
      }
    : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...transformStyle,
        ...style,
      }}
      className={cn(
        'glass relative rounded-xl p-4 shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-slate-200/50 dark:border-white/[0.08] transition-shadow duration-300',
        tilt && 'hover:shadow-glow-card',
        className
      )}
      {...props}
    >
      {tilt && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none mix-blend-overlay transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 0.9 : 0,
            background: `radial-gradient(circle 140px at ${mousePos.x}% ${mousePos.y}%, rgba(84, 244, 200, 0.16), transparent 80%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};
