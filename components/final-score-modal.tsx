"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Heart, Zap, AlertTriangle, Home, RotateCcw, Share2 } from "lucide-react"
import { LeaderboardManager } from "@/lib/leaderboard-manager"

interface FinalScoreModalProps {
  scoreData: {
    finalScore: number
    timeRemaining: number
    itemsCollected: number
    health: number
    mistakes: number
    totalTime: number
  }
  onRestart: () => void
  onHome: () => void
  onClose: () => void
}

export function FinalScoreModal({ scoreData, onRestart, onHome, onClose }: FinalScoreModalProps) {
  const [playerName, setPlayerName] = useState("Player")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [playerRank, setPlayerRank] = useState<number | null>(null)

  // Auto-save timer
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (!saved) {
        handleSaveScore(`Player-${Date.now().toString(36)}`)
      }
    }, 10000) // Auto-save after 10 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [saved])

  const handleSaveScore = async (name: string) => {
    if (isSaving || saved) return

    setIsSaving(true)

    try {
      const entry = {
        name,
        score: scoreData.finalScore,
        time: scoreData.totalTime,
        items: scoreData.itemsCollected,
        health: scoreData.health,
        combo: 0, // Could be passed from game state
        date: new Date().toISOString(),
      }

      LeaderboardManager.saveScore(entry)

      // Broadcast update for live leaderboard
      localStorage.setItem("leaderboard_last_update", JSON.stringify({ ts: Date.now() }))
      window.dispatchEvent(new CustomEvent("leaderboard:updated"))

      // Get player rank
      const rank = LeaderboardManager.getUserRank(name)
      setPlayerRank(rank)

      setSaved(true)
    } catch (error) {
      console.error("Error saving score:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = () => {
    const shareText = `I just escaped the Disaster Maze with a score of ${scoreData.finalScore}! 🚨🏃‍♂️`

    if (navigator.share) {
      navigator.share({
        title: "Disaster Escape Maze",
        text: shareText,
        url: window.location.origin,
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`)
      // Could show a toast here
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Congratulations! You Escaped!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Final Score Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{scoreData.finalScore.toLocaleString()}</div>
            <p className="text-muted-foreground">Final Score</p>
            {playerRank && (
              <Badge variant="secondary" className="mt-2">
                Rank #{playerRank}
              </Badge>
            )}
          </div>

          {/* Score Breakdown */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Time Bonus</span>
                  </div>
                  <span className="font-medium">+{Math.max(0, Math.round(scoreData.timeRemaining * 10))}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Items Collected ({scoreData.itemsCollected})</span>
                  </div>
                  <span className="font-medium">+{scoreData.itemsCollected * 50}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Health Bonus ({scoreData.health}%)</span>
                  </div>
                  <span className="font-medium">+{Math.round((scoreData.health / 100) * 200)}</span>
                </div>

                {scoreData.mistakes > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Mistakes ({scoreData.mistakes})</span>
                    </div>
                    <span className="font-medium text-red-500">-{scoreData.mistakes * 25}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Score Section */}
          {!saved ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="playerName">Save Your Score</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => handleSaveScore(playerName)}
                disabled={isSaving || !playerName.trim()}
                className="w-full"
              >
                {isSaving ? "Saving..." : "Save Score"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Score will auto-save in 10 seconds if not saved manually
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-green-600 font-medium">✓ Score Saved!</div>
              {playerRank && (
                <p className="text-sm text-muted-foreground">You're ranked #{playerRank} on the leaderboard!</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare} className="flex-1 bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={onRestart} className="flex-1 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button variant="outline" onClick={onHome} className="flex-1 bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
