export function playNotificationSound(): void {
  const audioContext = new AudioContext();
  
  // 1つ目の音（低音）
  const oscillator1 = audioContext.createOscillator();
  const gainNode1 = audioContext.createGain();
  
  oscillator1.connect(gainNode1);
  gainNode1.connect(audioContext.destination);
  
  oscillator1.type = 'sine';
  oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5音
  gainNode1.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode1.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
  
  // 2つ目の音（高音）
  const oscillator2 = audioContext.createOscillator();
  const gainNode2 = audioContext.createGain();
  
  oscillator2.connect(gainNode2);
  gainNode2.connect(audioContext.destination);
  
  oscillator2.type = 'sine';
  oscillator2.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.05); // G5音
  gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode2.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.08);
  gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
  
  // 音を鳴らす
  oscillator1.start(audioContext.currentTime);
  oscillator2.start(audioContext.currentTime);
  
  oscillator1.stop(audioContext.currentTime + 0.15);
  oscillator2.stop(audioContext.currentTime + 0.2);
}