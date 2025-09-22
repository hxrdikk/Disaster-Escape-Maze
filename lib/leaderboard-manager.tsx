export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  time: number
  items: number
  health: number
  combo: number
  date: string
  difficulty?: string
}

export interface LeaderboardStats {
  totalGames: number
  averageScore: number
  bestTime: number
  totalItemsCollected: number
  averageItemsPerGame: number
  winRate: number
}

export class LeaderboardManager {
  private static readonly STORAGE_KEY = "disaster-maze-leaderboard"
  private static readonly STATS_KEY = "disaster-maze-stats"
  private static readonly UPDATE_KEY = "leaderboard_last_update"
  private static readonly MAX_ENTRIES = 50

  static saveScore(entry: Omit<LeaderboardEntry, "id">): void {
    try {
      const leaderboard = this.getLeaderboard()
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: this.generateId(),
      }

      leaderboard.push(newEntry)
      leaderboard.sort((a, b) => b.score - a.score)

      // Keep only top entries
      const trimmedLeaderboard = leaderboard.slice(0, this.MAX_ENTRIES)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLeaderboard))
      this.updateStats(newEntry)
      this.broadcastLeaderboardUpdate()
    } catch (error) {
      console.error("Error saving score:", error)
    }
  }

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      return []
    }
  }

  static getTopScores(limit = 10): LeaderboardEntry[] {
    return this.getLeaderboard().slice(0, limit)
  }

  static getUserBestScore(playerName: string): LeaderboardEntry | null {
    const leaderboard = this.getLeaderboard()
    const userScores = leaderboard.filter((entry) => entry.name.toLowerCase() === playerName.toLowerCase())
    return userScores.length > 0 ? userScores[0] : null
  }

  static getUserRank(playerName: string): number {
    const leaderboard = this.getLeaderboard()
    const userBest = this.getUserBestScore(playerName)
    if (!userBest) return -1

    return leaderboard.findIndex((entry) => entry.id === userBest.id) + 1
  }

  static getStats(): LeaderboardStats {
    try {
      const stored = localStorage.getItem(this.STATS_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }

    return {
      totalGames: 0,
      averageScore: 0,
      bestTime: 0,
      totalItemsCollected: 0,
      averageItemsPerGame: 0,
      winRate: 0,
    }
  }

  static clearLeaderboard(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.STATS_KEY)
    } catch (error) {
      console.error("Error clearing leaderboard:", error)
    }
  }

  static broadcastLeaderboardUpdate(): void {
    try {
      // Signal for cross-tab updates
      localStorage.setItem(this.UPDATE_KEY, JSON.stringify({ ts: Date.now() }))

      // Fire in-page event
      window.dispatchEvent(new CustomEvent("leaderboard:updated"))
    } catch (error) {
      console.error("Error broadcasting leaderboard update:", error)
    }
  }

  static loadLeaderboard(): LeaderboardEntry[] {
    return this.getLeaderboard()
  }

  static renderLeaderboard(container: HTMLElement, highlightNewEntry = false): void {
    try {
      const leaderboard = this.getLeaderboard()
      const topEntries = leaderboard.slice(0, 10)

      // Simple innerHTML replacement for now - could be optimized with virtual DOM
      container.innerHTML = topEntries
        .map(
          (entry, index) => `
        <div class="flex items-center justify-between p-3 border-b border-border last:border-b-0 ${
          highlightNewEntry && index === 0 ? "leaderboard-highlight" : ""
        }">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium w-6">#${index + 1}</span>
            <div>
              <p class="font-medium">${entry.name}</p>
              <p class="text-xs text-muted-foreground">${new Date(entry.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold">${entry.score.toLocaleString()}</p>
            <p class="text-xs text-muted-foreground">${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, "0")}</p>
          </div>
        </div>
      `,
        )
        .join("")
    } catch (error) {
      console.error("Error rendering leaderboard:", error)
    }
  }

  static liveLeaderboardSubscribe(callback: () => void): () => void {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.UPDATE_KEY) {
        callback()
      }
    }

    const handleLeaderboardUpdate = () => {
      callback()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("leaderboard:updated", handleLeaderboardUpdate)

    // Return cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("leaderboard:updated", handleLeaderboardUpdate)
    }
  }

  private static updateStats(entry: LeaderboardEntry): void {
    try {
      const stats = this.getStats()
      const leaderboard = this.getLeaderboard()

      const totalGames = stats.totalGames + 1
      const totalScore = stats.averageScore * stats.totalGames + entry.score
      const averageScore = Math.round(totalScore / totalGames)

      const bestTime = stats.bestTime === 0 ? entry.time : Math.min(stats.bestTime, entry.time)
      const totalItemsCollected = stats.totalItemsCollected + entry.items
      const averageItemsPerGame = Math.round((totalItemsCollected / totalGames) * 10) / 10

      // Calculate win rate (assuming scores > 800 are wins)
      const wins = leaderboard.filter((e) => e.score > 800).length
      const winRate = Math.round((wins / totalGames) * 100)

      const newStats: LeaderboardStats = {
        totalGames,
        averageScore,
        bestTime,
        totalItemsCollected,
        averageItemsPerGame,
        winRate,
      }

      localStorage.setItem(this.STATS_KEY, JSON.stringify(newStats))
    } catch (error) {
      console.error("Error updating stats:", error)
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

declare global {
  interface Window {
    GameAPI: {
      endGame: (reason: string) => void
      saveScore: (data: { name: string }) => void
      loadLeaderboard: () => LeaderboardEntry[]
    }
    MazeTests: {
      runSmall: () => void
      simulateHazardTile: (x: number, y: number) => void
      simulateExit: (x: number, y: number) => void
    }
  }
}
