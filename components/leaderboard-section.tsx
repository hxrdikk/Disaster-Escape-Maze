"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, RotateCcw, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LeaderboardManager, type LeaderboardEntry } from "@/lib/leaderboard-manager"

export function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const loadLeaderboard = () => {
      const data = LeaderboardManager.getTopScores(10)
      setLeaderboard(data)
    }

    loadLeaderboard()

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => loadLeaderboard()
    window.addEventListener("storage", handleStorageChange)

    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const clearLeaderboard = () => {
    if (confirm("Are you sure you want to clear the leaderboard?")) {
      LeaderboardManager.clearLeaderboard()
      setLeaderboard([])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Top Survivors</h2>
          <p className="text-muted-foreground">See how you rank against other disaster preparedness champions</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Top 10 highest scores</CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/leaderboard">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
                {leaderboard.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearLeaderboard}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No scores yet. Be the first to play!</p>
                  <Link href="/game">
                    <Button>Start Playing</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                        <div>
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <Badge variant="secondary" className="mb-1">
                            {entry.score} pts
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(entry.time)} • {entry.items} items
                            {entry.combo > 0 && ` • ${entry.combo}x combo`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
