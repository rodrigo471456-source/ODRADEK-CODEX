// js/audio.js - Motor de Síntesis Sonora Táctica (Web Audio API)

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

/**
 * Genera un pulso sónico táctico por síntesis procedural.
 * @param {number} freq - Frecuencia en Hertz (Hz)
 * @param {string} type - 'sine', 'square', 'sawtooth', 'triangle'
 * @param {number} duration - Duración en segundos
 * @param {number} vol - Volumen maestro (0.0 a 1.0)
 */
function playTechSound(freq, type = 'sine', duration = 0.1, vol = 0.05) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}