import { useState, useCallback, useRef, useEffect } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { agentService } from './agent.service';

export const useAgent = () => {
  const { activeProspect, addAgentMessage } = useStoneStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = activeProspect?.agentHistory || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || !activeProspect) return;

    const userMsg = input.trim();
    setInput('');
    
    addAgentMessage(activeProspect.id, { role: 'user', content: userMsg });
    setLoading(true);

    try {
      const response = await agentService.sendMessage(
        userMsg, 
        messages.slice(-10), 
        activeProspect
      );
      
      addAgentMessage(activeProspect.id, { role: 'assistant', content: response });
    } catch (error) {
      addAgentMessage(activeProspect.id, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré une erreur technique lors du traitement de votre directive." 
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, activeProspect, addAgentMessage]);

  return {
    input,
    setInput,
    loading,
    messages,
    activeProspect,
    scrollRef,
    handleSend
  };
};
