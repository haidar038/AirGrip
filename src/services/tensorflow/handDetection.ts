import * as tf from '@tensorflow/tfjs';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

let detector: handPoseDetection.HandDetector | null = null;

export async function initializeHandDetector() {
  await tf.setBackend('webgl');
  await tf.ready();

  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'full',
    maxHands: 1,
  } as const;

  detector = await handPoseDetection.createDetector(model, detectorConfig);
  return detector;
}

export async function detectHand(video: HTMLVideoElement) {
  if (!detector) throw new Error('Detector not initialized');
  
  const hands = await detector.estimateHands(video);
  if (!hands.length) return null;

  const landmarks = hands[0].keypoints3D;
  if (!landmarks) return null;

  // Calculate hand gesture based on finger positions
  const isGrabGesture = calculateGrabGesture(landmarks);
  const isReleaseGesture = calculateReleaseGesture(landmarks);

  return {
    isGrabGesture,
    isReleaseGesture,
    landmarks,
  };
}

function calculateGrabGesture(landmarks: handPoseDetection.Keypoint3D[]) {
  // Implement grab gesture detection logic
  // Returns true if fingers are closed (fist)
  return false;
}

function calculateReleaseGesture(landmarks: handPoseDetection.Keypoint3D[]) {
  // Implement release gesture detection logic
  // Returns true if hand is open (palm)
  return false;
}