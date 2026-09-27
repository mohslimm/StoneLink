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

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const isProcessingAiRef = useRef(false);
  const lastProcessedSpeechRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(0);
  const lastSuggestedTextRef = useRef<string>('');
  const lastToastTimeRef = useRef<number>(0);
  const aiFinishedSpeakingTimeRef = useRef(0);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Check browser support and load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasSynthesis = 'speechSynthesis' in window;
      setSpeechSupported(hasRecognition);
      setSynthSupported(hasSynthesis);

      if (hasSynthesis) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            setAvailableVoices(voices);
          }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
          window.speechSynthesis.onvoiceschanged = null;
        };
      }
    }
  }, []);

  // Text-To-Speech function with GC protection and natural voice resolution
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Cancel any previous speech
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;

      const utterance = new SpeechSynthesisUtterance(text);
      // Retain strong root reference to prevent Chromium GC premature cutoff
      currentUtteranceRef.current = utterance;

      utterance.lang = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select most natural voice available
      const pool = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const preferredVoice = pool.find((v) =>
        language === 'fr'
          ? v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Paul') || v.name.includes('Thomas') || v.name.includes('Henri'))
          : language === 'ar'
          ? v.lang.startsWith('ar')
          : v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
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
    [language, availableVoices, setIsAiSpeaking]
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

  const languageRef = useRef(language);
  const handleProspectSpeechRef = useRef<(spokenText: string) => Promise<void>>(async () => {});

  // Keep language and recognition configuration in sync
  useEffect(() => {
    languageRef.current = language;
    if (recognitionRef.current && isActive) {
      try {
        recognitionRef.current.lang = language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR';
      } catch (e) {}
    }
  }, [language, isActive]);

  // Handle incoming prospect text and query Gemini Flash
  const handleProspectSpeech = useCallback(
    async (spokenText: string) => {
      const cleanText = spokenText.trim();
      if (!cleanText || cleanText.length < 3) return;

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

      // Always read fresh state from store to eliminate stale closures
      const currentState = useCallStore.getState();
      const currentProspect = prospect || currentState.prospect;
      if (!currentProspect) return;

      lastProcessedSpeechRef.current = cleanText;
      lastSpeechTimeRef.current = now;

      const currentSpeakerMode = currentState.speakerMode;
      const currentOffer = currentState.selectedOffer;
      const currentTranscript = currentState.liveTranscript;
      const currentLanguage = languageRef.current;

      addTranscriptMessage('prospect', cleanText);
      isProcessingAiRef.current = true;
      setIsProcessingAi(true);

      try {
        const res = await fetch('/api/call/live-assist', {
          method: 'POST',
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

        const data = await res.json();

        if (data.spokenResponse) {
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
      } catch (err) {
        console.warn('Live Assist API error:', err);
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
        if (transcriptText && transcriptText.trim().length >= 3) {
          // Always call via ref to avoid stale closure trap
          handleProspectSpeechRef.current(transcriptText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Erreur Speech Recognition:', event.error);
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
  }, [isActive, setIsListening]);

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
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

  // Auto-listen when active call starts in AI mode
  useEffect(() => {
    if (isActive && speechSupported) {
      startListening();
    } else {
      stopListening();
      stopSpeaking();
    }

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isActive, speechSupported]);

  return {
    speechSupported,
    synthSupported,
    isProcessingAi,
    isAiSpeaking,
    isListening,
    lastSuggestedText,
    lastPivotAdvice,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    handleProspectSpeech,
    emergencyTakeover,
  };
}
