import { useState, useEffect, useRef, useCallback } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import { terminalService } from './terminal.service';

export const useTerminal = () => {
  const { terminalEvents } = useStoneStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalEvents]);

  const handleCommand = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setInput('');
    await terminalService.executeCommand(cmd);
  }, [input]);

  return {
    terminalEvents,
    input,
    setInput,
    scrollRef,
    handleCommand
  };
};
