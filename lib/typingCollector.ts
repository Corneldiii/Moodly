// Mengumpulkan sinyal behavioral dari cara user mengetik
export interface TypingSignals {
  avg_iki: number
  backspace_ratio: number
  pause_count: number
  session_duration: number
  burst_count: number
}

export class TypingCollector {
  private keyTimes: number[] = []
  private lastKeyTime = 0
  private backspaceCount = 0
  private totalKeys = 0
  private pauseCount = 0
  private burstCount = 0
  private inBurst = false
  private startTime = Date.now()

  onKeydown(e: KeyboardEvent) {
    const now = Date.now()
    this.totalKeys++

    if (e.key === 'Backspace') this.backspaceCount++

    if (this.lastKeyTime > 0) {
      const iki = now - this.lastKeyTime

      if (iki < 2000) {
        this.keyTimes.push(iki)
        if (!this.inBurst) {
          this.burstCount++
          this.inBurst = true
        }
      } else {
        // Jeda > 2 detik = pause
        if (iki > 3000) this.pauseCount++
        this.inBurst = false
      }
    }

    this.lastKeyTime = now
  }

  getSignals(): TypingSignals {
    const ikis = this.keyTimes
    const avg_iki = ikis.length > 0
      ? ikis.reduce((a, b) => a + b, 0) / ikis.length
      : 150

    return {
      avg_iki: Math.round(avg_iki),
      backspace_ratio: this.totalKeys > 0
        ? this.backspaceCount / this.totalKeys
        : 0,
      pause_count: this.pauseCount,
      session_duration: Math.round((Date.now() - this.startTime) / 1000),
      burst_count: this.burstCount
    }
  }

  reset() {
    this.keyTimes = []
    this.lastKeyTime = 0
    this.backspaceCount = 0
    this.totalKeys = 0
    this.pauseCount = 0
    this.burstCount = 0
    this.inBurst = false
    this.startTime = Date.now()
  }
}