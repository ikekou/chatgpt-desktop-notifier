import { playNotificationSound } from '../utils/sound';

// DOM要素の取得
const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
const desktopEnabledCheckbox = document.getElementById('desktopEnabled') as HTMLInputElement;
const testSoundButton = document.getElementById('testSound') as HTMLButtonElement;
const testNotificationButton = document.getElementById('testNotification') as HTMLButtonElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

// 設定を保存する関数
function saveSettings() {
  const settings = {
    soundEnabled: soundEnabledCheckbox.checked,
    desktopEnabled: desktopEnabledCheckbox.checked
  };

  chrome.storage.sync.set(settings, () => {
    showStatus('設定を保存しました');
  });
}

// ステータスメッセージを表示する関数
function showStatus(message: string) {
  statusElement.textContent = message;
  statusElement.classList.add('show');

  // 2秒後にメッセージを非表示にする
  setTimeout(() => {
    statusElement.classList.remove('show');
  }, 2000);
}

// 音声通知をテストする関数
function testSound() {
  if (!soundEnabledCheckbox.checked) {
    showStatus('⚠️ 音声通知が無効になっています');
    return;
  }
  playNotificationSound();
  showStatus('🔊 音声通知をテストしました');
}

// デスクトップ通知をテストする関数
function testNotification() {
  if (!desktopEnabledCheckbox.checked) {
    showStatus('⚠️ デスクトップ通知が無効になっています');
    return;
  }
  chrome.runtime.sendMessage({
    type: 'SHOW_NOTIFICATION',
    text: 'これはテスト通知です。ChatGPT Desktop Notifierは正常に動作しています。'
  });
  showStatus('💬 デスクトップ通知をテストしました');
}

// 保存された設定を読み込む
chrome.storage.sync.get(['soundEnabled', 'desktopEnabled'], (result) => {
  soundEnabledCheckbox.checked = result.soundEnabled ?? true;
  desktopEnabledCheckbox.checked = result.desktopEnabled ?? true;
});

// イベントリスナーの設定
soundEnabledCheckbox.addEventListener('change', saveSettings);
desktopEnabledCheckbox.addEventListener('change', saveSettings);
testSoundButton.addEventListener('click', testSound);
testNotificationButton.addEventListener('click', testNotification);