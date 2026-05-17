export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentModuleProps {
  // Define props if needed
}

export interface AgentState {
  input: string;
  loading: boolean;
}
