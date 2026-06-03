import { useEffect, useRef } from 'react';
import { Pose } from '@/data/mockData';

interface SkeletonCanvasProps {
  poses: Pose[];
  errors: string[];
  width?: number;
  height?: number;
}

const SKELETON_CONNECTIONS = [
  [0, 1], // head to neck
  [1, 2], // neck to left shoulder
  [1, 3], // neck to right shoulder
  [2, 4], // left shoulder to left elbow
  [3, 5], // right shoulder to right elbow
  [4, 6], // left elbow to left wrist
  [5, 7], // right elbow to right wrist
  [1, 8], // neck to spine
  [8, 9], // spine to left hip
  [8, 10], // spine to right hip
  [9, 11], // left hip to left knee
  [10, 12], // right hip to right knee
  [11, 13], // left knee to left ankle
  [12, 14], // right knee to right ankle
];

const ERROR_JOINTS = [2, 4, 6, 9, 11, 13]; // joints that might have errors

export const SkeletonCanvas = ({ poses, errors, width = 640, height = 480 }: SkeletonCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const hasErrors = errors.length > 0;

    // Draw connections
    ctx.lineWidth = 3;
    SKELETON_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = poses[startIdx];
      const end = poses[endIdx];

      if (start && end) {
        const startX = start.x * width;
        const startY = start.y * height;
        const endX = end.x * width;
        const endY = end.y * height;

        // Determine if this connection has an error
        const connectionHasError = hasErrors && (ERROR_JOINTS.includes(startIdx) || ERROR_JOINTS.includes(endIdx));

        ctx.strokeStyle = connectionHasError 
          ? 'hsl(0 84% 60%)' // error red
          : 'hsl(142 76% 46%)'; // success green
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    // Draw joints
    poses.forEach((pose, idx) => {
      const x = pose.x * width;
      const y = pose.y * height;

      // Determine if this joint has an error
      const jointHasError = hasErrors && ERROR_JOINTS.includes(idx);

      ctx.fillStyle = jointHasError 
        ? 'hsl(0 84% 60%)' // error red
        : 'hsl(142 76% 46%)'; // success green
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Add glow effect for error joints
      if (jointHasError) {
        ctx.shadowColor = 'hsl(0 84% 60%)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }, [poses, errors, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
    />
  );
};
