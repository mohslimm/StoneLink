import { useStoneStore } from '@/stores/useStoneStore';
import { eventBus } from '@/core/events/events';

/**
 * Terminal Module Service
 * Handles shell command interpretation and system-wide action dispatching
 */
export const terminalService = {
  /**
   * Executes a terminal command
   */
  async executeCommand(fullCmd: string): Promise<void> {
    const store = useStoneStore.getState();
    const args = fullCmd.trim().split(' ');
    const cmd = args[0].toLowerCase();
    
    // Log user input
    store.addTerminalEvent({ message: `> ${fullCmd}`, type: 'info', module: 'terminal' });

    switch (cmd) {
      case 'clear':
        // The UI handles clearing by viewing the store, but we can emit a signal
        store.addTerminalEvent({ message: 'Console cleared.', type: 'success', module: 'terminal' });
        break;

      case 'purge':
      case 'reset':
        store.purgeSystem();
        eventBus.dispatch('TERMINAL_LOG', 'SYSTEM', { message: 'Full system purge executed.', type: 'warning', module: 'terminal' });
        break;

      case 'scan':
        if (args[1]) {
          store.addTerminalEvent({ message: `[RADAR] Scanning market footprint for ${args[1]}...`, type: 'info', module: 'market-link' });
          setTimeout(() => {
            store.addTerminalEvent({ message: `[RADAR] Detection complete: 3 high-intent signals found.`, type: 'success', module: 'market-link' });
          }, 2000);
        }
        break;

      case 'prospect':
        if (args[1]) {
          const p = store.prospects.find(p => p.id === args[1] || p.companyName.toLowerCase().includes(args[1].toLowerCase()));
          if (p) {
            store.navigateTo('pipeline', p.id, 'profile');
            store.addTerminalEvent({ message: `Navigating to prospect: ${p.companyName}...`, type: 'info', module: 'pipeline', prospectId: p.id });
          } else {
            store.addTerminalEvent({ message: `Prospect not found: ${args[1]}`, type: 'error', module: 'pipeline' });
          }
        }
        break;

      case 'stats':
        const stats = store.getStats();
        store.addTerminalEvent({ 
          message: `[BI] Pipeline Value: ${stats.weightedPipelineValue}€ | Active Prospects: ${stats.totalProspects}`, 
          type: 'success', 
          module: 'analytics' 
        });
        break;

      case 'help':
        store.addTerminalEvent({ 
          message: "Available protocols: clear, purge, reset, scan [target], prospect [id/name], stats, agent", 
          type: 'info', 
          module: 'terminal' 
        });
        break;

      case 'agent':
        store.navigateTo('agent');
        break;

      default:
        store.addTerminalEvent({ message: `[SYSTEM] Command unrecognized: '${cmd}'. Transferring context to Agent...`, type: 'error', module: 'agent' });
        store.navigateTo('agent');
        break;
    }
  }
};
