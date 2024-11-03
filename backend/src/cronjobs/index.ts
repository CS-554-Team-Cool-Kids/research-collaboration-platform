import cleanupResets from "./cleanupresets.js";

class SimpleScheduler {
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMinutes: number): void {
    if (this.intervalId) {
      console.log("Scheduler is already running.");
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000; // Convert minutes to milliseconds

    this.intervalId = setInterval(async () => {
      try {
        const result = await cleanupResets();
        console.log(result);
      } catch (err) {
        console.log(
          "Failed to perform deletion of expired password reset requests"
        );
        console.log(err);
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Scheduler stopped.");
    } else {
      console.log("Scheduler is not running.");
    }
  }
}

// Usage
const scheduler = new SimpleScheduler();
scheduler.start(30); // Starts the cleanup every 30 minutes

// To stop the scheduler when needed, call scheduler.stop();
export default scheduler;
