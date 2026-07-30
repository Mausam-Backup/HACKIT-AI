'use client';

import { useEffect, useRef, useState } from 'react';
import { XencruitAI, IBehavioralMetrics, ILandmark } from '@/lib/xencruit-ai';

// Dynamically import MediaPipe to avoid SSR issues
let FaceLandmarker: any;
let PoseLandmarker: any;
let FilesetResolver: any;

if (typeof window !== 'undefined') {
  import('@mediapipe/tasks-vision').then((mp) => {
    FaceLandmarker = mp.FaceLandmarker;
    PoseLandmarker = mp.PoseLandmarker;
    FilesetResolver = mp.FilesetResolver;
  });
}

interface UseAnalyticsOptions {
  enabled?: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onMetricsUpdate?: (metrics: IBehavioralMetrics) => void;
}

export function useXencruitAnalytics({ enabled = true, videoRef, onMetricsUpdate }: UseAnalyticsOptions) {
  const [metrics, setMetrics] = useState<IBehavioralMetrics>({
    posture: 0,
    engagement: 0,
    focus: 0,
    symmetry: 0,
    sentiment: 'Neutral',
    lastUpdateTime: Date.now()
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const xencruitRef = useRef(new XencruitAI());
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize MediaPipe models
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let isMounted = true;

    const initialize = async () => {
      try {
        // Wait for MediaPipe to load
        while (!FaceLandmarker || !PoseLandmarker) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!isMounted) return;

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        // Initialize Face Landmarker
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        // Initialize Pose Landmarker
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1
        });

        if (isMounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to initialize MediaPipe:', err);
        if (isMounted) {
          setError('Failed to initialize AI analytics');
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  // Process video frames
  useEffect(() => {
    if (!enabled || !isInitialized || !videoRef.current || !faceLandmarkerRef.current || !poseLandmarkerRef.current) {
      return;
    }

    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    const xencruit = xencruitRef.current;

    let lastVideoTime = -1;

    const predictWebcam = async () => {
      if (video && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        // Detect face landmarks
        try {
          const faceResults = faceLandmarker.detectForVideo(video, performance.now());
          if (faceResults.faceLandmarks && faceResults.faceLandmarks[0]) {
            const landmarks: ILandmark[] = faceResults.faceLandmarks[0].map((lm: any) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z || 0
            }));
            xencruit.processFace(landmarks);
          }
        } catch (e) {
          // ignore frame error
        }

        // Detect pose landmarks
        try {
          const poseResults = poseLandmarker.detectForVideo(video, performance.now());
          if (poseResults.landmarks && poseResults.landmarks[0]) {
            const landmarks: ILandmark[] = poseResults.landmarks[0].map((lm: any) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z || 0
            }));
            xencruit.processPose(landmarks);
          }
        } catch (e) {
          // ignore frame error
        }

        // Get updated metrics
        const newMetrics = xencruit.getMetrics();
        setMetrics(newMetrics);
        onMetricsUpdate?.(newMetrics);
      }

      animationFrameRef.current = requestAnimationFrame(predictWebcam);
    };

    predictWebcam();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isInitialized, videoRef, onMetricsUpdate]);

  return { metrics, isInitialized, error };
}
