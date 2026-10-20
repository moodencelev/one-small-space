/**
 * Web Vibration API utility for subtle tactile feedback
 * Gives physical tactile confirmation on mobile devices when completing tasks or interacting with the timer.
 */

class HapticsController {
  /**
   * Check if the Vibration API is supported in this browser/device
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Subtle tactile confirmation when a user marks a task Done
   * A satisfying double pulse: 25ms, brief pause, then a reassuring 45ms buzz
   */
  vibrateTaskComplete(enabled = true): boolean {
    if (!enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate([25, 40, 45]);
    } catch {
      return false;
    }
  }

  /**
   * Gentle celebration pulse when all tasks in a space are completed
   */
  vibrateSessionComplete(enabled = true): boolean {
    if (!enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate([40, 60, 40, 60, 80]);
    } catch {
      return false;
    }
  }

  /**
   * Subtle micro-tap for timer play/pause and +1 min actions
   */
  vibrateSoftTap(enabled = true): boolean {
    if (!enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate(12);
    } catch {
      return false;
    }
  }

  /**
   * Gentle pulse when breaking a step down with "Make easier"
   */
  vibrateMakeEasier(enabled = true): boolean {
    if (!enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate([18, 30, 20]);
    } catch {
      return false;
    }
  }

  /**
   * Quiet feedback when skipping a task
   */
  vibrateSkip(enabled = true): boolean {
    if (!enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate(15);
    } catch {
      return false;
    }
  }

  /**
   * Gentle reminder / timer finish alert
   */
  vibrateTimerExpire(enabled = true): boolean {
    if (!enabled || !this.isSupported()) return false;
    try {
      return navigator.vibrate([50, 80, 50, 80, 100]);
    } catch {
      return false;
    }
  }
}

export const haptics = new HapticsController();
