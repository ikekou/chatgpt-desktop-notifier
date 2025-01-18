import { playNotificationSound } from '../utils/sound';

// DOM elements
const soundEnabledCheckbox = document.getElementById('soundEnabled');
const desktopEnabledCheckbox = document.getElementById('desktopEnabled');
const testSoundButton = document.getElementById('testSound');
const testNotificationButton = document.getElementById('testNotification');
const statusElement = document.getElementById('status');
const versionElement = document.getElementById('version');

// Display version number
versionElement.textContent = process.env.APP_VERSION;

// Save settings
function saveSettings() {
  const settings = {
    soundEnabled: soundEnabledCheckbox.checked,
    desktopEnabled: desktopEnabledCheckbox.checked
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
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled'], (result) => {
  soundEnabledCheckbox.checked = result.soundEnabled ?? true;
  desktopEnabledCheckbox.checked = result.desktopEnabled ?? true;
});

// Event listeners
soundEnabledCheckbox.addEventListener('change', saveSettings);
desktopEnabledCheckbox.addEventListener('change', saveSettings);
testSoundButton.addEventListener('click', testSound);
testNotificationButton.addEventListener('click', testNotification);