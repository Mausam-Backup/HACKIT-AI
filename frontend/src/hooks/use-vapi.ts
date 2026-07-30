'use client';

import { useState, useEffect, useCallback, useRef } from "react";

export function useVapi() {
  const vapiRef = useRef<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [lastTranscript, setLastTranscript] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize Vapi instance on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !vapiRef.current) {
      import('@vapi-ai/web').then((mod) => {
        const Vapi = mod.default || mod;
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!publicKey) {
          console.warn("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set in environment");
        }
        vapiRef.current = new Vapi(publicKey || "dummy-vapi-key");
        setupVapiListeners();
      }).catch((err) => {
        console.error("Failed to load Vapi SDK:", err);
      });
    }

    function setupVapiListeners() {
      const vapi = vapiRef.current;
      if (!vapi) return;

      const onCallStart = () => {
        setIsCallActive(true);
        setIsThinking(false);
        setIsSpeaking(false);
        setError(null);
      };

      const onCallEnd = () => {
        setIsCallActive(false);
        setIsThinking(false);
        setIsSpeaking(false);
        setVolumeLevel(0);
      };

      const onSpeechStart = () => {
        setIsSpeaking(true);
        setIsThinking(false);
      };

      const onSpeechEnd = () => {
        setIsSpeaking(false);
      };

      const onVolumeLevel = (level: number) => {
        setVolumeLevel(level);
      };

      const onMessage = (message: any) => {
        if (message.type === "transcript") {
          setLastTranscript(message.transcript);
          if (message.transcriptType === "final") {
            setMessages((prev) => [...prev, message]);
          }
        }
      };

      const onVapiError = (err: any) => {
        console.error("Vapi Error:", err);
        setError(err?.message || 'Vapi call error');
        setIsCallActive(false);
      };

      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("volume-level", onVolumeLevel);
      vapi.on("message", onMessage);
      vapi.on("error", onVapiError);
    }
  }, []);

  const startCall = useCallback(async (assistantOverrides?: any) => {
    const vapi = vapiRef.current;
    if (!vapi) {
      setError("Vapi SDK not initialized yet");
      return;
    }

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      console.warn("NEXT_PUBLIC_VAPI_ASSISTANT_ID not set, running in local simulation mode.");
      setIsCallActive(true);
      return;
    }

    try {
      setError(null);
      await vapi.start(assistantId, assistantOverrides);
    } catch (err: any) {
      console.error('Failed to start Vapi call:', err);
      setError(err.message || 'Failed to start voice call');
    }
  }, []);

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsCallActive(false);
  }, []);

  const toggleCall = useCallback(() => {
    if (isCallActive) {
      endCall();
    } else {
      startCall();
    }
  }, [isCallActive, startCall, endCall]);

  return {
    isCallActive,
    isThinking,
    isSpeaking,
    volumeLevel,
    lastTranscript,
    messages,
    error,
    startCall,
    endCall,
    toggleCall,
  };
}
