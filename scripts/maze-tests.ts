export class MazeTestSuite {
  static runSmall(): void {
    console.log("[MazeTests] Running small test suite...")

    // Test hazard collision
    console.log("[MazeTests] Testing hazard collision...")
    this.simulateHazardTile(5, 5)

    // Test exit reached
    setTimeout(() => {
      console.log("[MazeTests] Testing exit reached...")
      this.simulateExit(10, 10)
    }, 2000)

    // Test leaderboard save
    setTimeout(() => {
      console.log("[MazeTests] Testing leaderboard save...")
      this.testLeaderboardSave()
    }, 4000)
  }

  static simulateHazardTile(x: number, y: number): void {
    console.log(`[MazeTests] Simulating hazard collision at (${x}, ${y})`)

    // Trigger hazard collision event
    const event = new CustomEvent("test-hazard-collision", {
      detail: { x, y, type: "fire" },
    })
    window.dispatchEvent(event)
  }

  static simulateExit(x: number, y: number): void {
    console.log(`[MazeTests] Simulating exit reached at (${x}, ${y})`)

    // Trigger exit reached event
    const event = new CustomEvent("test-exit-reached", {
      detail: { x, y },
    })
    window.dispatchEvent(event)
  }

  static testLeaderboardSave(): void {
    console.log("[MazeTests] Testing leaderboard save and live updates...")

    const testEntry = {
      name: `TestPlayer-${Date.now()}`,
      score: Math.floor(Math.random() * 2000) + 1000,
      time: Math.floor(Math.random() * 300) + 60,
      items: Math.floor(Math.random() * 8) + 1,
      health: Math.floor(Math.random() * 100) + 1,
      combo: Math.floor(Math.random() * 5),
      date: new Date().toISOString(),
    }

    // Import and use LeaderboardManager
    import("@/lib/leaderboard-manager").then(({ LeaderboardManager }) => {
      LeaderboardManager.saveScore(testEntry)
      console.log("[MazeTests] Test score saved:", testEntry)

      // Verify leaderboard update
      const leaderboard = LeaderboardManager.loadLeaderboard()
      console.log("[MazeTests] Current leaderboard:", leaderboard.slice(0, 3))
    })
  }

  static testConfig(): void {
    console.log("[MazeTests] Testing game configuration...")

    const config = {
      hazardPenalty: { health: 15, time: 5 },
      lethalHazards: new Set(["lava"]),
      timeValue: 10,
      itemValue: 50,
      healthValue: 200,
      mistakePenalty: 25,
      topLimit: 50,
      toastDuration: 3000,
      autoSaveScoreIfClosed: true,
      hazardTypes: new Set(["fire", "broken", "lava", "danger"]),
    }

    console.log("[MazeTests] Game config:", config)
  }
}

// Make available globally
if (typeof window !== "undefined") {
  ;(window as any).MazeTests = MazeTestSuite
}
