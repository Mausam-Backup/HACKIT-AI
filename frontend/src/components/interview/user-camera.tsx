'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import { Video, VideoOff, Activity } from 'lucide-react';
import { useXencruitAnalytics } from '@/hooks/use-xencruit-analytics';
import { AnalyticsDisplay } from './analytics-display';

interface UserCameraProps {
  isActive?: boolean;
  enableAnalytics?: boolean;
}

export const UserCamera = forwardRef<HTMLVideoElement, UserCameraProps>(
  function UserCamera({ isActive = true, enableAnalytics = true }, forwardedRef) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasVideo, setHasVideo] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(true);

    useEffect(() => {
      if (forwardedRef && videoRef.current) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(videoRef.current);
        } else {
          (forwardedRef as React.MutableRefObject<HTMLVideoElement | null>).current = videoRef.current;
        }
      }
    }, [forwardedRef]);

    const { metrics, isInitialized, error: analyticsError } = useXencruitAnalytics({
      enabled: enableAnalytics && isEnabled && hasVideo,
      videoRef: videoRef as React.RefObject<HTMLVideoElement>
    });

    useEffect(() => {
      if (!isActive || !isEnabled) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setHasVideo(false);
        return;
      }

      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasVideo(true);
            setError(null);
          }
        } catch (err) {
          setError('Camera access needed for posture & eye tracking.');
          setHasVideo(false);
        }
      };

      startCamera();
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
    }, [isActive, isEnabled]);

    return (
      <div className="h-full w-full rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden relative flex items-center justify-center shadow-sm">

        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* No camera state */}
        {!hasVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              {error
                ? <VideoOff className="w-6 h-6 text-rose-500" />
                : <Video className="w-6 h-6 text-violet-600 animate-pulse" />
              }
            </div>
            <p className="text-xs text-slate-500 text-center max-w-[200px] leading-relaxed">
              {error ?? 'Camera initializing...'}
            </p>
          </div>
        )}

        {/* Analytics HUD — top right */}
        {enableAnalytics && showAnalytics && hasVideo && (
          <div className="absolute top-3 right-3 w-60 z-20">
            <AnalyticsDisplay metrics={metrics} isInitialized={isInitialized} error={analyticsError} />
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute bottom-0 inset-x-0 px-3 py-3 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent z-10">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/[0.08] backdrop-blur-md px-2.5 py-1 rounded-lg">
            <span className="relative flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block absolute inset-0 animate-ping opacity-70" />
            </span>
            <span className="text-[10px] font-semibold text-slate-300">Live · MediaPipe</span>
          </div>

          {/* Camera controls */}
          <div className="flex items-center gap-1.5">
            {enableAnalytics && (
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`h-7 px-2.5 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 backdrop-blur-md ${
                  showAnalytics
                    ? 'bg-violet-600/80 border-violet-500/50 text-white'
                    : 'bg-black/40 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="h-3 w-3" />
                HUD
              </button>
            )}
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className="h-7 w-7 rounded-lg bg-black/40 border border-white/[0.08] backdrop-blur-md text-white hover:bg-white/10 transition-all flex items-center justify-center"
            >
              {isEnabled
                ? <VideoOff className="h-3.5 w-3.5" />
                : <Video className="h-3.5 w-3.5" />
              }
            </button>
          </div>
        </div>
      </div>
    );
  }
);
