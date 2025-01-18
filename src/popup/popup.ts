import { playNotificationSound } from '../utils/sound';

declare global {
  interface ProcessEnv {
    APP_VERSION: string;
  }
}

interface Settings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  waitTime: number;
  completionDelay: number;
}

// DOM elements
const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
const desktopEnabledCheckbox = document.getElementById('desktopEnabled') as HTMLInputElement;
const waitTimeInput = document.getElementById('waitTime') as HTMLInputElement;
const completionDelayInput = document.getElementById('completionDelay') as HTMLInputElement;
const testSoundButton = document.getElementById('testSound') as HTMLButtonElement;
const testNotificationButton = document.getElementById('testNotification') as HTMLButtonElement;
const statusElement = document.getElementById('status') as HTMLElement;
const versionElement = document.getElementById('version') as HTMLElement;

if (!soundEnabledCheckbox || !desktopEnabledCheckbox || !waitTimeInput || 
    !completionDelayInput || !testSoundButton || !testNotificationButton || 
    !statusElement || !versionElement) {
  throw new Error('Required DOM elements not found');
}

// Display version number
versionElement.textContent = process.env.APP_VERSION || '';

// Save settings
function saveSettings(): void {
  const waitTime = parseInt(waitTimeInput.value, 10);
  const completionDelay = parseInt(completionDelayInput.value, 10);

  if (waitTime < 1 || waitTime > 60) {
    showStatus('⚠️ Notification duration must be between 1-60 seconds');
    waitTimeInput.value = Math.min(Math.max(waitTime, 1), 60).toString();
    return;
  }

  if (completionDelay < 1 || completionDelay > 10) {
    showStatus('⚠️ Completion delay must be between 1-10 seconds');
    completionDelayInput.value = Math.min(Math.max(completionDelay, 1), 10).toString();
    return;
  }

  const settings: Settings = {
    soundEnabled: soundEnabledCheckbox.checked,
    desktopEnabled: desktopEnabledCheckbox.checked,
    waitTime: waitTime,
    completionDelay: completionDelay
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved');
  });
}

// Show status message
function showStatus(message: string): void {
  statusElement.textContent = message;
  statusElement.classList.add('show');

  // Hide message after 2 seconds
  setTimeout(() => {
    statusElement.classList.remove('show');
  }, 2000);
}

// Test sound notification
function testSound(): void {
  if (!soundEnabledCheckbox.checked) {
    showStatus('⚠️ Sound alerts are disabled');
    return;
  }
  playNotificationSound();
  showStatus('🔊 Sound alert tested');
}

// Test desktop notification
function testNotification(): void {
  if (!desktopEnabledCheckbox.checked) {
    showStatus('⚠️ Desktop notifications are disabled');
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: 'SHOW_NOTIFICATION',
      text: 'This is a test notification. ChatGPT Desktop Notifier is working properly.'
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Error occurred:', chrome.runtime.lastError);
        showStatus('⚠️ Failed to send notification');
      }
    }
  );
  
  showStatus('💬 Desktop notification tested');
}

// Load saved settings
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled', 'waitTime', 'completionDelay'], (result) => {
  soundEnabledCheckbox.checked = result.soundEnabled ?? true;
  desktopEnabledCheckbox.checked = result.desktopEnabled ?? true;
  waitTimeInput.value = (result.waitTime ?? 5).toString();
  completionDelayInput.value = (result.completionDelay ?? 2).toString();
});

// Event listeners
soundEnabledCheckbox.addEventListener('change', saveSettings);
desktopEnabledCheckbox.addEventListener('change', saveSettings);
waitTimeInput.addEventListener('change', saveSettings);
completionDelayInput.addEventListener('change', saveSettings);

waitTimeInput.addEventListener('input', () => {
  const value = parseInt(waitTimeInput.value, 10);
  if (value < 1) waitTimeInput.value = '1';
  if (value > 60) waitTimeInput.value = '60';
});

completionDelayInput.addEventListener('input', () => {
  const value = parseInt(completionDelayInput.value, 10);
  if (value < 1) completionDelayInput.value = '1';
  if (value > 10) completionDelayInput.value = '10';
});

testSoundButton.addEventListener('click', testSound);
testNotificationButton.addEventListener('click', testNotification);