import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { initializeHandDetector, detectHand } from '../../services/tensorflow/handDetection';

export function GestureDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    
    async function setupCamera() {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        
        videoRef.current.srcObject = stream;
        await initializeHandDetector();
        setIsDetecting(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    async function detectGestures() {
      if (!videoRef.current || !canvasRef.current || !isDetecting) return;

      try {
        const result = await detectHand(videoRef.current);
        if (result) {
          drawHandLandmarks(result.landmarks);
        }
      } catch (error) {
        console.error('Error detecting hand:', error);
      }

      animationFrame = requestAnimationFrame(detectGestures);
    }

    setupCamera();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  function drawHandLandmarks(landmarks: any[]) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Draw landmarks...
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-full"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      {!isDetecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <Camera className="w-12 h-12 mx-auto mb-2" />
            <p>Initializing camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}