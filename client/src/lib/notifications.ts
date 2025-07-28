// Comprehensive notification system with sound support
export class NotificationSystem {
  private static instance: NotificationSystem;
  private audioContext: AudioContext | null = null;

  private constructor() {
    this.initializeAudioContext();
    this.requestNotificationPermission();
  }

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem();
    }
    return NotificationSystem.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.log('Web Audio API not supported:', error);
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Message notification sound (chat)
  playMessageNotification() {
    this.playTone([440, 660], [0.1, 0.1], 0.3);
  }

  // Event notification sound (calendar)
  playEventNotification() {
    this.playTone([523, 659, 784], [0.15, 0.15, 0.2], 0.2);
  }

  // Contact invitation sound
  playInvitationNotification() {
    this.playTone([698, 880, 698], [0.1, 0.2, 0.1], 0.25);
  }

  // Meeting reminder sound
  playMeetingReminder() {
    this.playTone([349, 440, 523, 440], [0.1, 0.1, 0.1, 0.1], 0.4);
  }

  // Success notification sound
  playSuccessNotification() {
    this.playTone([523, 659, 784, 1047], [0.08, 0.08, 0.08, 0.16], 0.2);
  }

  // Error notification sound
  playErrorNotification() {
    this.playTone([220, 185, 165], [0.2, 0.2, 0.3], 0.3);
  }

  private playTone(frequencies: number[], durations: number[], volume: number = 0.2) {
    if (!this.audioContext) return;

    try {
      let startTime = this.audioContext.currentTime;
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[index]);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + durations[index]);
        
        startTime += durations[index];
      });
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  // Browser notification with custom options
  showBrowserNotification(title: string, options: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
  } = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        badge: '/favicon.ico'
      });
    }
    return null;
  }

  // Comprehensive notification for different event types
  notify(type: 'message' | 'event' | 'invitation' | 'meeting' | 'success' | 'error', 
         title: string, 
         body?: string, 
         options: { 
           playSound?: boolean, 
           showBrowser?: boolean,
           requireInteraction?: boolean 
         } = {}) {
    
    const { playSound = true, showBrowser = true, requireInteraction = false } = options;

    // Play appropriate sound
    if (playSound) {
      switch (type) {
        case 'message':
          this.playMessageNotification();
          break;
        case 'event':
          this.playEventNotification();
          break;
        case 'invitation':
          this.playInvitationNotification();
          break;
        case 'meeting':
          this.playMeetingReminder();
          break;
        case 'success':
          this.playSuccessNotification();
          break;
        case 'error':
          this.playErrorNotification();
          break;
      }
    }

    // Show browser notification
    if (showBrowser) {
      this.showBrowserNotification(title, {
        body,
        tag: type,
        requireInteraction
      });
    }
  }

  // Check for upcoming events and notify
  checkUpcomingEvents(events: Array<{ title: string; startTime: string }>) {
    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
    const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
    
    events.forEach(event => {
      const eventStart = new Date(event.startTime);
      
      if (eventStart > now && eventStart <= in5Minutes) {
        this.notify('meeting', 'Meeting Starting Soon!', 
          `${event.title} starts in 5 minutes`, 
          { requireInteraction: true });
      } else if (eventStart > now && eventStart <= in15Minutes) {
        this.notify('event', 'Upcoming Event', 
          `${event.title} starts in 15 minutes`);
      }
    });
  }
}

// Export singleton instance
export const notifications = NotificationSystem.getInstance();