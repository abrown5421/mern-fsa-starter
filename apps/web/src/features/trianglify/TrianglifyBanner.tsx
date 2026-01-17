import { useEffect, useRef } from "react";
import { TrianglifyBannerProps } from "./types";
import trianglify from "trianglify";

export const TrianglifyBanner: React.FC<TrianglifyBannerProps> = ({ width, height, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const pattern = trianglify({
        width, 
        height,
        ...config,
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(pattern.toCanvas(), 0, 0);
      }
    }
  }, [width, height, config]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};
