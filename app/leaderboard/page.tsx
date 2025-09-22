"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Medal,
  Award,
  Home,
  RotateCcw,
  Search,
  Clock,
  Target,
  Heart,
  Zap,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { LeaderboardManager, type LeaderboardEntry, type LeaderboardStats } from "@/lib/leaderboard-manager"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const loadData = () => {
      const data = LeaderboardManager.getLeaderboard()
      const statsData = LeaderboardManager.getStats()
      setLeaderboard(data)
      setStats(statsData)
      setFilteredLeaderboard(data)
    }

    loadData()

    // Listen for storage changes
    const handleStorageChange = () => loadData()
    window.addEventListener("storage", handleStorageChange)

    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = leaderboard.filter((entry) => entry.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredLeaderboard(filtered)
    } else {
      setFilteredLeaderboard(leaderboard)
    }
  }, [searchQuery, leaderboard])

  const clearLeaderboard = () => {
    if (confirm("Are you sure you want to clear all leaderboard data? This cannot be undone.")) {
      LeaderboardManager.clearLeaderboard()
      setLeaderboard([])
      setFilteredLeaderboard([])
      setStats({
        totalGames: 0,
        averageScore: 0,
        bestTime: 0,
        totalItemsCollected: 0,
        averageItemsPerGame: 0,
        winRate: 0,
      })
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

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 1200) return "default" // Gold
    if (score >= 1000) return "secondary" // Silver
    if (score >= 800) return "outline" // Bronze
    return "destructive" // Needs improvement
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Home className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/game">
                <Button variant="outline" size="sm">
                  Play Game
                </Button>
              </Link>
              {leaderboard.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearLeaderboard}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how you rank against other disaster preparedness champions
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Leaderboard */}
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Top Survivors
                  </CardTitle>
                  <CardDescription>
                    {filteredLeaderboard.length} {filteredLeaderboard.length === 1 ? "player" : "players"} shown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredLeaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "No players found matching your search."
                          : "No scores yet. Be the first to play!"}
                      </p>
                      {!searchQuery && (
                        <Link href="/game" className="mt-4 inline-block">
                          <Button>Start Playing</Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLeaderboard.slice(0, 50).map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 flex justify-center">{getRankIcon(index)}</div>
                            <div>
                              <p className="font-semibold">{entry.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.date).toLocaleDateString()}
                                <Clock className="h-3 w-3 ml-2" />
                                {formatTime(entry.time)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="space-y-1">
                              <Badge variant={getScoreBadgeVariant(entry.score)} className="mb-1">
                                {entry.score} pts
                              </Badge>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {entry.items}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {entry.health}%
                                </div>
                                {entry.combo > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {entry.combo}x
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {stats && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Games</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalGames}</div>
                    <p className="text-xs text-muted-foreground">Games played by all users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageScore}</div>
                    <p className="text-xs text-muted-foreground">Points per game</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.bestTime > 0 ? formatTime(stats.bestTime) : "N/A"}</div>
                    <p className="text-xs text-muted-foreground">Fastest completion</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Items Collected</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalItemsCollected}</div>
                    <p className="text-xs text-muted-foreground">Total safety items found</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Items Per Game</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageItemsPerGame}</div>
                    <p className="text-xs text-muted-foreground">Average items collected</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.winRate}%</div>
                    <p className="text-xs text-muted-foreground">Games with score &gt; 800</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {(!stats || stats.totalGames === 0) && (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No statistics available yet.</p>
                <Link href="/game">
                  <Button>Play Your First Game</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
