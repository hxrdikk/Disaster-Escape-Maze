export class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled = true

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn("Audio context not supported")
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = "sine") {
    if (!this.audioContext || !this.enabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  playMove() {
    this.createTone(200, 0.1, "square")
  }

  playCollect() {
    // Pleasant ascending tone
    this.createTone(523, 0.1) // C5
    setTimeout(() => this.createTone(659, 0.1), 50) // E5
    setTimeout(() => this.createTone(784, 0.2), 100) // G5
  }

  playObstacleHit() {
    // Harsh descending tone
    this.createTone(150, 0.3, "sawtooth")
  }

  playWin() {
    // Victory fanfare
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => this.createTone(note, 0.4), index * 100)
    })
  }

  playLose() {
    // Sad descending tone
    this.createTone(200, 0.5, "triangle")
    setTimeout(() => this.createTone(150, 0.5, "triangle"), 200)
    setTimeout(() => this.createTone(100, 0.8, "triangle"), 400)
  }
}
