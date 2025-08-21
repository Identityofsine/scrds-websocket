/**
 * @modules/rcon shared library
 * 
 * This library provides shared functionality for the SRCDS WebSocket application.
 */

export interface RconConfig {
  // Add configuration options here
}

export class Rcon {
  private config: RconConfig;

  constructor(config: RconConfig = {}) {
    this.config = config;
  }

  /**
   * Example method - replace with actual functionality
   */
  public hello(): string {
    return 'Hello from @modules/rcon!';
  }
}

// Export the main class and any utilities
export default Rcon; 