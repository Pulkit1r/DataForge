import React, { useEffect, useRef } from 'react';

interface VectorSphereCanvasProps {
  nVectors?: number;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
}

export const VectorSphereCanvas: React.FC<VectorSphereCanvasProps> = ({
  nVectors = 32,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 500);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 500;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 500;
    };
    window.addEventListener('resize', handleResize);

    // Generate points distributed on 3D sphere using Fibonacci spiral
    const points: Point3D[] = [];
    const count = Math.max(16, Math.min(nVectors, 64));
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1 || 1)) * 2; // from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({ x, y, z, baseX: x, baseY: y, baseZ: z });
    }

    let angleX = 0.2;
    let angleY = 0.4;
    let rotSpeedX = 0.0022;
    let rotSpeedY = 0.0036;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleX += rotSpeedX;
      angleY += rotSpeedY;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const sphereRadius = Math.min(width, height) * 0.36;
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      const projected: { px: number; py: number; pz: number; origIdx: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Rotate Y
        let x1 = p.baseX * cosY - p.baseZ * sinY;
        let z1 = p.baseZ * cosY + p.baseX * sinY;

        // Rotate X
        let y1 = p.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.baseY * sinX;

        // Perspective projection
        const fov = 2.5;
        const scale = fov / (fov + z2 * 0.8);
        const px = centerX + x1 * sphereRadius * scale;
        const py = centerY + y1 * sphereRadius * scale;

        projected.push({ px, py, pz: z2, origIdx: i });
      }

      // Sort by depth (back to front)
      projected.sort((a, b) => a.pz - b.pz);

      // Draw faint collision/interference filaments between close vectors
      ctx.lineWidth = 1 * window.devicePixelRatio;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const distSq = dx * dx + dy * dy;
          const maxDist = sphereRadius * 0.48;

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.28 * Math.max(0.1, (projected[i].pz + 1.2) / 2.2);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw vector points
      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        const depthFactor = (pt.pz + 1.2) / 2.4; // 0 (back) to 1 (front)
        const radius = (2.2 + depthFactor * 3.0) * window.devicePixelRatio;
        const alpha = 0.25 + depthFactor * 0.75;

        // Glow halo
        const gradient = ctx.createRadialGradient(pt.px, pt.py, 0, pt.px, pt.py, radius * 2.5);
        gradient.addColorStop(0, `rgba(167, 139, 250, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = depthFactor > 0.7 ? '#ffffff' : `rgba(221, 214, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nVectors]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Soft gradient overlays easing text contrast */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#08080c] via-[#08080c]/30 to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#08080c] via-transparent to-transparent" />
    </div>
  );
};
