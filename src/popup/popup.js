import { playNotificationSound } from '../utils/sound';

// DOM elements
const soundEnabledCheckbox = document.getElementById('soundEnabled');
const desktopEnabledCheckbox = document.getElementById('desktopEnabled');
const waitTimeInput = document.getElementById('waitTime');
const testSoundButton = document.getElementById('testSound');
const testNotificationButton = document.getElementById('testNotification');
const statusElement = document.getElementById('status');
const versionElement = document.getElementById('version');

// Display version number
versionElement.textContent = process.env.APP_VERSION;

// Save settings
function saveSettings() {
  const waitTime = parseInt(waitTimeInput.value, 10);
  if (waitTime < 1 || waitTime > 60) {
    showStatus('⚠️ Wait time must be between 1-60 seconds');
    waitTimeInput.value = Math.min(Math.max(waitTime, 1), 60);
    return;
  }

  const settings = {
    soundEnabled: soundEnabledCheckbox.checked,
    desktopEnabled: desktopEnabledCheckbox.checked,
    waitTime: waitTime
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved');
  });
}

// Show status message
function showStatus(message) {
  statusElement.textContent = message;
  statusElement.classList.add('show');

  // Hide message after 2 seconds
  setTimeout(() => {
    statusElement.classList.remove('show');
  }, 2000);
}

// Test sound notification
function testSound() {
  if (!soundEnabledCheckbox.checked) {
    showStatus('⚠️ Sound alerts are disabled');
    return;
  }
  playNotificationSound();
  showStatus('🔊 Sound alert tested');
}

// Test desktop notification
function testNotification() {
  console.log('🔔 Starting desktop notification test');
  
  if (!desktopEnabledCheckbox.checked) {
    console.log('⚠️ Desktop notifications are disabled');
    showStatus('⚠️ Desktop notifications are disabled');
    return;
  }

  console.log('📤 Sending message to background.js');
  chrome.runtime.sendMessage(
    {
      type: 'SHOW_NOTIFICATION',
      text: 'This is a test notification. ChatGPT Desktop Notifier is working properly.'
    },
    (response) => {
      console.log('📥 Response from background.js:', response);
      if (chrome.runtime.lastError) {
        console.error('❌ Error occurred:', chrome.runtime.lastError);
        showStatus('⚠️ Failed to send notification');
      }
    }
  );
  
  showStatus('💬 Desktop notification tested');
}

// Load saved settings
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled', 'waitTime'], (result) => {
  soundEnabledCheckbox.checked = result.soundEnabled ?? true;
  desktopEnabledCheckbox.checked = result.desktopEnabled ?? true;
  waitTimeInput.value = result.waitTime ?? 5;
});

// Event listeners
soundEnabledCheckbox.addEventListener('change', saveSettings);
desktopEnabledCheckbox.addEventListener('change', saveSettings);
waitTimeInput.addEventListener('change', saveSettings);
waitTimeInput.addEventListener('input', () => {
  const value = parseInt(waitTimeInput.value, 10);
  if (value < 1) waitTimeInput.value = 1;
  if (value > 60) waitTimeInput.value = 60;
});
testSoundButton.addEventListener('click', testSound);
testNotificationButton.addEventListener('click', testNotification);