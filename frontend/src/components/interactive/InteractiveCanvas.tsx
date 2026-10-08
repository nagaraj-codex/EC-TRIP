import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color?: string;
}

export const InteractiveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isPaused = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Pointer coordinates & repulsion state
    const mouse = {
      x: width / 2,
      y: height / 2,
      radius: 150,
      isDown: false,
      lastMoveTime: 0,
      lastX: -1000,
      lastY: -1000,
    };

    // Gyroscope tilt state (for mobile)
    const tilt = { x: 0, y: 0 };

    // Active ripples
    const ripples: Ripple[] = [];

    const addRipple = (x: number, y: number, maxRadius = 140, speed = 3.2, color?: string) => {
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius,
        alpha: 0.45,
        speed,
        color: color || 'rgba(24, 119, 242, 0.4)',
      });
      if (ripples.length > 20) ripples.shift();
    };

    // Particle network
    const particles: Particle[] = [];
    const numParticles = Math.min(Math.floor((width * height) / 14000), 75);

    const colors = [
      'rgba(24, 119, 242, 0.45)', // Primary Blue
      'rgba(59, 130, 246, 0.4)',  // Blue accent
      'rgba(99, 102, 241, 0.35)', // Indigo
      'rgba(14, 165, 233, 0.35)', // Sky blue
    ];

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const now = performance.now();
      const dist = Math.hypot(e.clientX - mouse.lastX, e.clientY - mouse.lastY);

      // Create gentle ripple trail on drag or continuous pointer move
      if (mouse.isDown || dist > 60) {
        if (now - mouse.lastMoveTime > 80) {
          addRipple(e.clientX, e.clientY, 90, 2.8);
          mouse.lastMoveTime = now;
          mouse.lastX = e.clientX;
          mouse.lastY = e.clientY;
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouse.isDown = true;
      addRipple(e.clientX, e.clientY, 160, 3.8, 'rgba(24, 119, 242, 0.5)');
    };

    const handleMouseUp = () => {
      mouse.isDown = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.isDown = true;
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        addRipple(touch.clientX, touch.clientY, 140, 3.5, 'rgba(24, 119, 242, 0.5)');
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;

        const now = performance.now();
        if (now - mouse.lastMoveTime > 90) {
          addRipple(touch.clientX, touch.clientY, 85, 2.5);
          mouse.lastMoveTime = now;
        }
      }
    };

    const handleTouchEnd = () => {
      mouse.isDown = false;
    };

    const handleMouseLeave = () => {
      mouse.x = width / 2;
      mouse.y = height / 2;
      mouse.isDown = false;
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        tilt.x = Math.max(-1, Math.min(1, e.gamma / 45));
        tilt.y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
      }
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('deviceorientation', handleOrientation);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Animation render loop
    let tick = 0;
    const render = () => {
      if (isPaused) return;
      tick += 0.012;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle, high-end ambient gradient
      const grad = ctx.createRadialGradient(
        width * 0.38 + Math.sin(tick) * 40,
        height * 0.4 + Math.cos(tick) * 30,
        60,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.9
      );
      grad.addColorStop(0, '#F8FAFD');
      grad.addColorStop(0.5, '#F1F5F9');
      grad.addColorStop(1, '#E2E8F0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color ? r.color.replace(/[\d\.]+\)$/, `${r.alpha})`) : `rgba(24, 119, 242, ${r.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 3. Particle connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(24, 119, 242, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 4. Particle nodes with spring repulsion
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Drift
        p.x += p.vx + tilt.x * 0.3;
        p.y += p.vy + tilt.y * 0.3;

        // Bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Repulsion from pointer
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius && distance > 0) {
          const force = (mouse.radius - distance) / mouse.radius;
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const pushX = forceDirectionX * force * mouse.radius * 0.6;
          const pushY = forceDirectionY * force * mouse.radius * 0.6;

          p.x -= pushX * 0.22;
          p.y -= pushY * 0.22;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('deviceorientation', handleOrientation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
};
