"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCallStore } from './useCallStore';
import { useUIStore } from './useUIStore';

export interface UseVoiceAgentOptions {
  language?: 'fr' | 'ar' | 'en';
}

export function useVoiceAgent(options: UseVoiceAgentOptions = {}) {
  const language = options.language || 'fr';
  const {
    isActive,
    speakerMode,
    prospect,
    selectedOffer,
    isAiSpeaking,
    isListening,
    liveTranscript,
    setIsAiSpeaking,
    setIsListening,
    addTranscriptMessage,
    setSpeakerMode,
  } = useCallStore();

  const { addToast } = useUIStore();
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthSupported, setSynthSupported] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [lastSuggestedText, setLastSuggestedText] = useState<string>('');
  const [lastPivotAdvice, setLastPivotAdvice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Call stage: 'waiting_pickup' (ringing) vs 'in_conversation' (picked up)
  const [callStage, setCallStage] = useState<'waiting_pickup' | 'in_conversation'>('waiting_pickup');

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize browser speech capabilities and load Edge/Chrome voices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasSynthesis = 'speechSynthesis' in window;
      setSpeechSupported(hasRecognition);
      setSynthSupported(hasSynthesis);

      if (hasSynthesis) {
        const updateVoices = () => {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            setAvailableVoices(v);
          }
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Reset call stage when call opens/closes
  useEffect(() => {
    if (isActive) {
      setCallStage('waiting_pickup');
      isManuallyStoppedRef.current = false;
    } else {
      setCallStage('waiting_pickup');
      killCallAudio();
    }
  }, [isActive]);

  // Select the best studio/natural voice (Prioritizing Microsoft Edge Azure Neural voices)
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    if (language === 'fr') {
      // 1. Microsoft Edge Natural Voices (Studio Azure)
      const henri = availableVoices.find((v) => v.name.includes('Henri') && v.name.includes('Natural'));
      if (henri) return henri;

      const denise = availableVoices.find((v) => v.name.includes('Denise') && v.name.includes('Natural'));
      if (denise) return denise;

      // 2. Any other online natural french voice
      const naturalFr = availableVoices.find((v) => v.lang.startsWith('fr') && v.name.includes('Natural'));
      if (naturalFr) return naturalFr;

      // 3. Google français (Chrome)
      const googleFr = availableVoices.find((v) => v.lang.startsWith('fr') && v.name.includes('Google'));
      if (googleFr) return googleFr;

      // 4. Any french voice
      return availableVoices.find((v) => v.lang.startsWith('fr')) || null;
    }

    if (language === 'ar') {
      // Algerian Arabic Natural voices in Edge
      const amina = availableVoices.find((v) => v.name.includes('Amina') && (v.name.includes('Algeria') || v.name.includes('Natural')));
      if (amina) return amina;

      const ismael = availableVoices.find((v) => v.name.includes('Ismael') && (v.name.includes('Algeria') || v.name.includes('Natural')));
      if (ismael) return ismael;

      return availableVoices.find((v) => v.lang.startsWith('ar')) || null;
    }

    // English
    const guy = availableVoices.find((v) => v.name.includes('Guy') && v.name.includes('Natural'));
    if (guy) return guy;

    const jenny = availableVoices.find((v) => v.name.includes('Jenny') && v.name.includes('Natural'));
    if (jenny) return jenny;

    return availableVoices.find((v) => v.lang.startsWith('en')) || null;
  }, [availableVoices, language]);

  // Kill Switch: forcefully cancels all audio, recognitions, and pending network requests
  const killCallAudio = useCallback(() => {
    isManuallyStoppedRef.current = true;

    // 1. Cancel in-flight fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Kill Speech Synthesis queue
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 3. Abort Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setIsAiSpeaking(false);
    setIsListening(false);
    setIsProcessingAi(false);
  }, [setIsAiSpeaking, setIsListening]);

  // Text-To-Speech with strict active call check
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!useCallStore.getState().isActive) return; // Guard: call is already closed

      // Clear any prior speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const bestVoice = getBestVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        if (!useCallStore.getState().isActive) {
          window.speechSynthesis.cancel();
          return;
        }
        setIsAiSpeaking(true);
      };

      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsAiSpeaking(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    [language, getBestVoice, setIsAiSpeaking]
  );

  // Stop speaking immediately
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  }, [setIsAiSpeaking]);

  // Handle incoming prospect text and query Gemini Flash with race condition guards
  const handleProspectSpeech = useCallback(
    async (spokenText: string) => {
      const cleanText = spokenText.trim();
      if (!cleanText || !prospect) return;
      if (!useCallStore.getState().isActive) return; // Guard: Call ended

      // If we were waiting for pickup, this first speech triggers connected state!
      setCallStage('in_conversation');

      addTranscriptMessage('prospect', cleanText);
      setIsProcessingAi(true);

      // Create abort controller for this specific request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortCtrl = new AbortController();
      abortControllerRef.current = abortCtrl;

      try {
        const res = await fetch('/api/call/live-assist', {
          method: 'POST',
          signal: abortCtrl.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prospect: {
              id: prospect.id,
              name: prospect.name,
              company: prospect.company,
              sector: prospect.sector,
              city: (prospect as any).city || 'Algérie',
              url: prospect.url,
              score: prospect.score,
              phone: prospect.phone,
            },
            transcript: liveTranscript.slice(-6).map((t) => ({ sender: t.sender, text: t.text })),
            lastUserSpeech: cleanText,
            speakerMode,
            selectedOffer,
            language,
          }),
        });

        // Guard: check if call was ended while waiting for Gemini
        if (!useCallStore.getState().isActive) {
          setIsProcessingAi(false);
          return;
        }

        const data = await res.json();
        setIsProcessingAi(false);

        if (data.spokenResponse && useCallStore.getState().isActive) {
          setLastSuggestedText(data.spokenResponse);
          setLastPivotAdvice(data.quickPivot || '');

          if (speakerMode === 'ai') {
            // Autonomous AI Agent speaks directly
            addTranscriptMessage('agent', data.spokenResponse);
            speakText(data.spokenResponse);
          } else {
            // Human Copilot mode: only suggest the response visually
            addToast({
              type: 'info',
              message: `Suggestion Copilote : "${data.spokenResponse.slice(0, 60)}..."`,
            });
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Live Assist API error:', err);
        }
        setIsProcessingAi(false);
      }
    },
    [prospect, liveTranscript, speakerMode, selectedOffer, language, addTranscriptMessage, speakText, addToast]
  );

  // Manual trigger when user clicks "Le prospect a décroché"
  const markPickup = useCallback(() => {
    setCallStage('in_conversation');
    addTranscriptMessage('system', '📞 Le prospect a décroché la ligne.');
    // Trigger opening greeting hook immediately
    handleProspectSpeech('Allô ? Bonjour.');
  }, [handleProspectSpeech, addTranscriptMessage]);

  // Start Speech Recognition
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition API non supportée dans ce navigateur.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
        isManuallyStoppedRef.current = false;
      };

      recognition.onresult = (event: any) => {
        if (!useCallStore.getState().isActive) return;

        const lastResultIndex = event.results.length - 1;
        const transcriptText = event.results[lastResultIndex][0].transcript;
        if (transcriptText && transcriptText.trim().length > 1) {
          handleProspectSpeech(transcriptText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech Recognition notice:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart listener only if call is actively ongoing and not stopped
        if (useCallStore.getState().isActive && !isManuallyStoppedRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Impossible de démarrer la reconnaissance vocale:', err);
      setIsListening(false);
    }
  }, [language, handleProspectSpeech, setIsListening]);

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
  }, [setIsListening]);

  // Emergency Human Takeover
  const emergencyTakeover = useCallback(() => {
    stopSpeaking();
    setSpeakerMode('human');
    addTranscriptMessage('system', '🚨 Reprise en main manuelle immédiate par le commercial humain.');
    addToast({
      type: 'info',
      message: 'Agent Vocal interrompu. Vous avez la main complète au micro.',
    });
  }, [stopSpeaking, setSpeakerMode, addTranscriptMessage, addToast]);

  // Start audio session when active call starts
  useEffect(() => {
    if (isActive && speechSupported) {
      startListening();
    } else {
      killCallAudio();
    }

    return () => {
      killCallAudio();
    };
  }, [isActive, speechSupported, startListening, killCallAudio]);

  return {
    speechSupported,
    synthSupported,
    isProcessingAi,
    isAiSpeaking,
    isListening,
    lastSuggestedText,
    lastPivotAdvice,
    callStage,
    markPickup,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    handleProspectSpeech,
    emergencyTakeover,
    killCallAudio,
  };
}
