'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

type Circle = {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  speedX: number;
  speedY: number;
  size: number;
  color: string;
  glow: boolean;
};

type MouseCircle = {
  x: number;
  y: number;
  size: number;
  color: string;
};

interface InteractiveBackgroundProps {
  isDarkMode: boolean;
}

export default function InteractiveBackground({ isDarkMode }: InteractiveBackgroundProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [floatingCircles, setFloatingCircles] = useState<Circle[]>([]);
  const [mouseCircle, setMouseCircle] = useState<MouseCircle>({ x: 0, y: 0, size: 100, color: '#FFFFFF' });
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; size: number; color: string } | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Random Color Generator
  const randomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Create Noise Effect (for distortion)
  const noise = (size: number) => {
    return Math.random() * size - size / 2;
  };

  // Mouse Move Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      setMouseCircle({
        x: e.clientX,
        y: e.clientY,
        size: 150,
        color: randomColor(),
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  // Click Ripple Effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setClickRipple({
        x: e.clientX,
        y: e.clientY,
        size: 100,
        color: randomColor(),
      });

      setTimeout(() => {
        setClickRipple(null);
      }, 600);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClick);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleClick);
      }
    };
  }, []);

  // Floating Circles Movement and Parallax Effect
  useEffect(() => {
    setHasMounted(true);

    const createMovement = (): Circle => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      directionX: Math.random() > 0.5 ? 1 : -1,
      directionY: Math.random() > 0.5 ? 1 : -1,
      speedX: Math.random() * 0.5 + 0.3,
      speedY: Math.random() * 0.5 + 0.3,
      size: Math.random() * 100 + 50,
      color: randomColor(),
      glow: Math.random() > 0.5,
    });

    const circles: Circle[] = Array.from({ length: 50 }, createMovement);
    setFloatingCircles(circles);

    const animateCircles = () => {
      setFloatingCircles((prevCircles) =>
        prevCircles.map((circle) => {
          const newX = circle.x + circle.directionX * circle.speedX;
          const newY = circle.y + circle.directionY * circle.speedY;

          // Edge collision logic
          if (newX > window.innerWidth || newX < 0) circle.directionX *= -1;
          if (newY > window.innerHeight || newY < 0) circle.directionY *= -1;

          return {
            ...circle,
            x: newX + noise(10), // Adding noise for distortion effect
            y: newY + noise(10),
          };
        })
      );
      requestAnimationFrame(animateCircles);
    };
    
    animateCircles(); // Start the animation loop

  }, []);

  if (!hasMounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Floating Circles */}
      {floatingCircles.map((circle, index) => (
        <motion.div
          key={index}
          className={`absolute pointer-events-none rounded-full blur-lg ${circle.glow ? 'glow-effect' : ''}`}
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            backgroundColor: circle.color,
            top: circle.y,
            left: circle.x,
            translateX: '-50%',
            translateY: '-50%',
            opacity: 0.5 + Math.random() * 0.3,
            boxShadow: circle.glow ? `0 0 15px ${circle.color}` : 'none',
          }}
        />
      ))}

      {/* Mouse Hover Circle */}
      <motion.div
        className="absolute pointer-events-none rounded-full blur-3xl"
        style={{
          width: `${mouseCircle.size}px`,
          height: `${mouseCircle.size}px`,
          backgroundColor: mouseCircle.color,
          top: mouseCircle.y,
          left: mouseCircle.x,
          translateX: '-50%',
          translateY: '-50%',
          opacity: 0.7,
        }}
      />

      {/* Click Ripple Effect */}
      {clickRipple && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: `${clickRipple.size}px`,
            height: `${clickRipple.size}px`,
            backgroundColor: clickRipple.color,
            top: clickRipple.y,
            left: clickRipple.x,
            translateX: '-50%',
            translateY: '-50%',
            opacity: 0.5,
            scale: 0,
            animation: 'rippleAnimation 0.6s forwards',
          }}
        />
      )}

      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r"
        style={{
          background: isDarkMode
            ? 'linear-gradient(90deg, #4b6cb7, #182848)'
            : 'linear-gradient(90deg, #090808FF, #020101FF)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
