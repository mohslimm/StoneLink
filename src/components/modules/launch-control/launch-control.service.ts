import { eventBus } from '@/core/events/events';

/**
 * Launch Control Module Service
 * Handles system lifecycle, seeding, and purging
 */
export const launchControlService = {
  /**
   * Seeds the system with demo data
   */
  seedSystem: async (data?: any): Promise<void> => {
    await fetch("/api/seed", {
      method: "POST",
      body: JSON.stringify(data)
    })
    try {
      eventBus.dispatch('TERMINAL_LOG', 'LAUNCH_CONTROL_SERVICE', { 
        message: 'Initiating global data seeding protocol...', 
        type: 'info',
        module: 'launch-control'
      });

      eventBus.dispatch('TERMINAL_LOG', 'LAUNCH_CONTROL_SERVICE', { 
        message: 'Core dataset synchronized successfully.', 
        type: 'success',
        module: 'launch-control'
      });
    } catch (error: any) {
      eventBus.dispatch('SYSTEM_ERROR', 'LAUNCH_CONTROL_SERVICE', { 
        error: 'SEED_FAILED', 
        message: error.message 
      });
      throw error;
    }
  },

  /**
   * Purges all system data
   */
purgeSystem: async (): Promise<void> => {
  
    try {
      eventBus.dispatch('TERMINAL_LOG', 'LAUNCH_CONTROL_SERVICE', { 
        message: 'DANGER: Initiating full system purge...', 
        type: 'alert',
        module: 'launch-control'
      });

      eventBus.dispatch('TERMINAL_LOG', 'LAUNCH_CONTROL_SERVICE', { 
        message: 'System purged. Idle state restored.', 
        type: 'info',
        module: 'launch-control'
      });
    } catch (error: any) {
      eventBus.dispatch('SYSTEM_ERROR', 'LAUNCH_CONTROL_SERVICE', { 
        error: 'PURGE_FAILED', 
        message: error.message 
      });
      throw error;
    }
  }
};
