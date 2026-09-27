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

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      const hasSynthesis = 'speechSynthesis' in window;
      setSpeechSupported(hasRecognition);
      setSynthSupported(hasSynthesis);
    }
  }, []);

  // Text-To-Speech function
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Cancel previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) =>
        language === 'fr'
          ? v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Paul') || v.name.includes('Thomas'))
          : v.lang.startsWith(language)
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
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
    [language, setIsAiSpeaking]
  );

  // Stop speaking immediately
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  }, [setIsAiSpeaking]);

  // Handle incoming prospect text and query Gemini Flash
  const handleProspectSpeech = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim() || !prospect) return;

      addTranscriptMessage('prospect', spokenText.trim());
      setIsProcessingAi(true);

      try {
        const res = await fetch('/api/call/live-assist', {
          method: 'POST',
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
            lastUserSpeech: spokenText,
            speakerMode,
            selectedOffer,
            language,
          }),
        });

        const data = await res.json();
        setIsProcessingAi(false);

        if (data.spokenResponse) {
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
      } catch (err) {
        console.warn('Live Assist API error:', err);
        setIsProcessingAi(false);
      }
    },
    [prospect, liveTranscript, speakerMode, selectedOffer, language, addTranscriptMessage, speakText, addToast]
  );

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
        const lastResultIndex = event.results.length - 1;
        const transcriptText = event.results[lastResultIndex][0].transcript;
        if (transcriptText && transcriptText.trim().length > 1) {
          handleProspectSpeech(transcriptText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Erreur Speech Recognition:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart listener if call is still active and not manually stopped
        if (isActive && !isManuallyStoppedRef.current) {
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
  }, [isActive, language, handleProspectSpeech, setIsListening]);

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
