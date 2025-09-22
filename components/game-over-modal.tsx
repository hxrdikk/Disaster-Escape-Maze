"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Home, RotateCcw, Clock, Target, Heart, Zap, TrendingUp } from "lucide-react"
import { LeaderboardManager } from "@/lib/leaderboard-manager"

interface GameState {
  score: number
  time: number
  health: number
  gameStatus: "won" | "lost"
  collectedItems: number
  collectibles: Array<{ collected: boolean }>
  combo: number
}

interface GameOverModalProps {
  gameState: GameState
  onRestart: () => void
  onHome: () => void
}

export function GameOverModal({ gameState, onRestart, onHome }: GameOverModalProps) {
  const [playerName, setPlayerName] = useState("")
  const [saved, setSaved] = useState(false)
  const [userRank, setUserRank] = useState<number | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const saveScore = () => {
    if (!playerName.trim()) return

    const scoreEntry = {
      name: playerName.trim(),
      score: gameState.score,
      time: gameState.time,
      items: gameState.collectedItems,
      health: gameState.health,
      combo: gameState.combo,
      date: new Date().toISOString(),
    }

    LeaderboardManager.saveScore(scoreEntry)

    // Get user's rank after saving
    const rank = LeaderboardManager.getUserRank(playerName.trim())
    setUserRank(rank)
    setSaved(true)
  }

  const safetyTips = [
    "Never use elevators during fire or earthquake emergencies",
    "Stay low and crawl if there's smoke in the area",
    "Check doors for heat before opening during a fire",
    "Drop, Cover, and Hold On during earthquakes",
    "Know at least two exits from every room",
    "Keep an emergency kit ready with supplies",
    "Stay away from windows during severe weather",
    "Don't walk or drive through flood water",
    "Have a family communication plan ready",
    "Learn basic first aid and CPR techniques",
  ]

  const randomTips = safetyTips.sort(() => 0.5 - Math.random()).slice(0, 3)

  const getPerformanceMessage = () => {
    if (gameState.score >= 1200) return { message: "Outstanding Performance!", color: "text-primary" }
    if (gameState.score >= 1000) return { message: "Excellent Work!", color: "text-accent" }
    if (gameState.score >= 800) return { message: "Good Job!", color: "text-chart-2" }
    return { message: "Keep Practicing!", color: "text-muted-foreground" }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {gameState.gameStatus === "won" ? (
              <Trophy className="h-8 w-8 text-primary" />
            ) : (
              <Heart className="h-8 w-8 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {gameState.gameStatus === "won" ? "Congratulations!" : "Game Over"}
          </CardTitle>
          <CardDescription>
            {gameState.gameStatus === "won" ? "You successfully escaped the disaster!" : "Better luck next time!"}
          </CardDescription>
          <div className={`text-sm font-medium ${performance.color}`}>{performance.message}</div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Score</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {gameState.score}
              </Badge>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Time</span>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {formatTime(gameState.time)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-chart-2" />
                <span className="text-sm font-medium">Items</span>
              </div>
              <Badge className="text-lg px-3 py-1">
                {gameState.collectedItems}/{gameState.collectibles.length}
              </Badge>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Health</span>
              </div>
              <Badge variant={gameState.health > 50 ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                {gameState.health}%
              </Badge>
            </div>
          </div>

          {/* Combo bonus if applicable */}
          {gameState.combo > 0 && (
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Max Combo Achieved!</span>
              </div>
              <Badge className="text-lg px-3 py-1">{gameState.combo}x Multiplier</Badge>
            </div>
          )}

          {/* Safety Tips */}
          <div>
            <h4 className="font-semibold mb-3 text-center">Safety Tips Learned</h4>
            <div className="space-y-2">
              {randomTips.map((tip, index) => (
                <div key={index} className="text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="text-primary font-medium">💡</span> {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Save Score */}
          {!saved && (
            <div className="space-y-3">
              <h4 className="font-semibold text-center">Save Your Score</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  onKeyPress={(e) => e.key === "Enter" && saveScore()}
                />
                <Button onClick={saveScore} disabled={!playerName.trim()}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {saved && (
            <div className="text-center space-y-2">
              <div className="text-sm text-accent">✅ Score saved to leaderboard!</div>
              {userRank && userRank <= 10 && (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">You're ranked #{userRank}!</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onHome} className="flex-1 bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button onClick={onRestart} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
