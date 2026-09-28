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

  // Echo guard, processing locks, and GC protection refs
  const isAiSpeakingRef = useRef(false);
  const isProcessingAiRef = useRef(false);
  const lastProcessedSpeechRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(0);
  const lastSuggestedTextRef = useRef<string>('');
  const lastToastTimeRef = useRef<number>(0);
  const aiFinishedSpeakingTimeRef = useRef(0);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const languageRef = useRef(language);
  const handleProspectSpeechRef = useRef<(spokenText: string) => Promise<void>>(async () => {});

  // Check browser support and load voices on mount (with Edge/Chrome support)
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
        return () => {
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    }
  }, []);

  // Synchronize language ref with option
  useEffect(() => {
    languageRef.current = language;
    if (recognitionRef.current && isActive) {
      try {
        recognitionRef.current.lang = language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR';
      } catch (e) {}
    }
  }, [language, isActive]);

  // Reset call stage and kill audio when call status changes
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
    const pool = availableVoices.length > 0 ? availableVoices : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
    if (pool.length === 0) return null;

    if (language === 'fr') {
      // 1. Microsoft Edge Natural Voices (Studio Azure)
      const henri = pool.find((v) => v.name.includes('Henri') && v.name.includes('Natural'));
      if (henri) return henri;

      const denise = pool.find((v) => v.name.includes('Denise') && v.name.includes('Natural'));
      if (denise) return denise;

      // 2. Any other online natural french voice
      const naturalFr = pool.find((v) => v.lang.startsWith('fr') && v.name.includes('Natural'));
      if (naturalFr) return naturalFr;

      // 3. Google français (Chrome)
      const googleFr = pool.find((v) => v.lang.startsWith('fr') && v.name.includes('Google'));
      if (googleFr) return googleFr;

      // 4. Any french voice
      return pool.find((v) => v.lang.startsWith('fr')) || null;
    }

    if (language === 'ar') {
      // Algerian Arabic Natural voices in Edge
      const amina = pool.find((v) => v.name.includes('Amina') && (v.name.includes('Algeria') || v.name.includes('Natural')));
      if (amina) return amina;

      const ismael = pool.find((v) => v.name.includes('Ismael') && (v.name.includes('Algeria') || v.name.includes('Natural')));
      if (ismael) return ismael;

      return pool.find((v) => v.lang.startsWith('ar')) || null;
    }

    // English
    const guy = pool.find((v) => v.name.includes('Guy') && v.name.includes('Natural'));
    if (guy) return guy;

    const jenny = pool.find((v) => v.name.includes('Jenny') && v.name.includes('Natural'));
    if (jenny) return jenny;

    return pool.find((v) => v.lang.startsWith('en')) || null;
  }, [availableVoices, language]);

  // Kill Switch: forcefully cancels all audio, recognitions, and pending network requests
  const killCallAudio = useCallback(() => {
    isManuallyStoppedRef.current = true;
    isAiSpeakingRef.current = false;
    isProcessingAiRef.current = false;
    currentUtteranceRef.current = null;

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

  // Text-To-Speech with strict active call check and GC protection
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!useCallStore.getState().isActive) return; // Guard: call is already closed

      // Clear any prior speech
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance; // Retain strong reference against Chromium GC cutoff

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
        isAiSpeakingRef.current = true;
        setIsAiSpeaking(true);

        // Abort speech recognition immediately while AI speaks to prevent acoustic feedback loop
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }
      };

      utterance.onend = () => {
        isAiSpeakingRef.current = false;
        aiFinishedSpeakingTimeRef.current = Date.now();
        currentUtteranceRef.current = null;
        setIsAiSpeaking(false);

        // Grace period (400ms) to ensure speaker echoes have dissipated before resuming recognition
        setTimeout(() => {
          if (useCallStore.getState().isActive && !isManuallyStoppedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }, 400);

        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        isAiSpeakingRef.current = false;
        aiFinishedSpeakingTimeRef.current = Date.now();
        currentUtteranceRef.current = null;
        setIsAiSpeaking(false);

        setTimeout(() => {
          if (useCallStore.getState().isActive && !isManuallyStoppedRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        }, 400);

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
    currentUtteranceRef.current = null;
    isAiSpeakingRef.current = false;
    aiFinishedSpeakingTimeRef.current = Date.now();
    setIsAiSpeaking(false);
  }, [setIsAiSpeaking]);

  // Handle incoming prospect text and query Gemini Flash with race condition and echo guards
  const handleProspectSpeech = useCallback(
    async (spokenText: string) => {
      const cleanText = spokenText.trim();
      if (!cleanText || cleanText.length < 2) return;

      // Guard against AI self-hearing / feedback echo loop or active processing
      if (
        isAiSpeakingRef.current ||
        isProcessingAiRef.current ||
        useCallStore.getState().isAiSpeaking ||
        Date.now() - aiFinishedSpeakingTimeRef.current < 900
      ) {
        return;
      }

      // Ignore duplicate speech recognized within 2 seconds
      const now = Date.now();
      if (
        lastProcessedSpeechRef.current === cleanText &&
        now - lastSpeechTimeRef.current < 2000
      ) {
        return;
      }

      // If we were waiting for pickup, this first speech triggers connected state!
      setCallStage('in_conversation');

      // Always read fresh state from store to eliminate stale closures
      const currentState = useCallStore.getState();
      const currentProspect = prospect || currentState.prospect;
      if (!currentProspect || !currentState.isActive) return;

      lastProcessedSpeechRef.current = cleanText;
      lastSpeechTimeRef.current = now;

      const currentSpeakerMode = currentState.speakerMode;
      const currentOffer = currentState.selectedOffer;
      const currentTranscript = currentState.liveTranscript;
      const currentLanguage = languageRef.current;

      addTranscriptMessage('prospect', cleanText);
      isProcessingAiRef.current = true;
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
              id: currentProspect.id,
              name: currentProspect.name,
              company: currentProspect.company,
              sector: currentProspect.sector,
              city: (currentProspect as any).city || 'Algérie',
              url: currentProspect.url,
              score: currentProspect.score,
              phone: currentProspect.phone,
            },
            transcript: currentTranscript.slice(-6).map((t) => ({ sender: t.sender, text: t.text })),
            lastUserSpeech: cleanText,
            speakerMode: currentSpeakerMode,
            selectedOffer: currentOffer,
            language: currentLanguage,
          }),
        });

        // Guard: check if call was ended while waiting for Gemini
        if (!useCallStore.getState().isActive) {
          setIsProcessingAi(false);
          isProcessingAiRef.current = false;
          return;
        }

        const data = await res.json();

        if (data.spokenResponse && useCallStore.getState().isActive) {
          setLastSuggestedText(data.spokenResponse);
          setLastPivotAdvice(data.quickPivot || '');

          // Check fresh speaker mode directly from the store at completion time
          const freshSpeakerMode = useCallStore.getState().speakerMode;
          if (freshSpeakerMode === 'ai') {
            // Autonomous AI Agent speaks directly
            addTranscriptMessage('agent', data.spokenResponse);
            speakText(data.spokenResponse);
          } else {
            // Human Copilot mode: only show toast if text changed or > 3s since last toast
            const isDifferentResponse = data.spokenResponse !== lastSuggestedTextRef.current;
            const isPastCooldown = Date.now() - lastToastTimeRef.current > 3000;

            if (isDifferentResponse || isPastCooldown) {
              lastSuggestedTextRef.current = data.spokenResponse;
              lastToastTimeRef.current = Date.now();
              addToast({
                type: 'info',
                message: `Suggestion Copilote : "${data.spokenResponse.slice(0, 60)}..."`,
              });
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Live Assist API error:', err);
        }
      } finally {
        isProcessingAiRef.current = false;
        setIsProcessingAi(false);
      }
    },
    [prospect, addTranscriptMessage, speakText, addToast]
  );

  // Keep ref synchronized with the latest callback definition
  useEffect(() => {
    handleProspectSpeechRef.current = handleProspectSpeech;
  }, [handleProspectSpeech]);

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
      recognition.lang = languageRef.current === 'ar' ? 'ar-DZ' : languageRef.current === 'en' ? 'en-US' : 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
        isManuallyStoppedRef.current = false;
      };

      recognition.onresult = (event: any) => {
        if (!useCallStore.getState().isActive) return;

        // Discard any audio if AI is speaking, processing, or just finished speaking (echo guard)
        if (
          isAiSpeakingRef.current ||
          isProcessingAiRef.current ||
          useCallStore.getState().isAiSpeaking ||
          Date.now() - aiFinishedSpeakingTimeRef.current < 900
        ) {
          return;
        }

        const lastResultIndex = event.results.length - 1;
        const transcriptText = event.results[lastResultIndex][0].transcript;
        if (transcriptText && transcriptText.trim().length >= 2) {
          // Always call via ref to avoid stale closure trap
          handleProspectSpeechRef.current(transcriptText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech Recognition notice:', event.error);
        }
      };

      recognition.onend = () => {
        // If AI is currently speaking, do not auto-restart here (utterance.onend will handle restart)
        if (isAiSpeakingRef.current) {
          return;
        }

        // Auto-restart listener if call is still active and not manually stopped
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
  }, [setIsListening]);

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
