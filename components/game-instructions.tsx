"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, HelpCircle, Gamepad2, Target, Zap } from "lucide-react"

interface GameInstructionsProps {
  onClose: () => void
}

export function GameInstructions({ onClose }: GameInstructionsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">How to Play</CardTitle>
          <CardDescription className="text-center">Learn the basics of Disaster Escape Maze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objective */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Objective
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Navigate through the maze to reach the green emergency exit 🚨 while collecting safety items and avoiding
              obstacles.
            </p>
          </div>

          {/* Controls */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              Controls
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">Desktop:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Arrow keys to move</li>
                  <li>• WASD keys to move</li>
                  <li>• Space to pause</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Mobile:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Touch control buttons</li>
                  <li>• Swipe on game board</li>
                  <li>• Tap to interact</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Elements */}
          <div>
            <h3 className="font-semibold mb-3">Game Elements</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-2xl">🚶‍♂️</span>
                <div>
                  <p className="font-medium">Player (You)</p>
                  <p className="text-sm text-muted-foreground">Navigate through the maze</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-medium">Emergency Exit</p>
                  <p className="text-sm text-muted-foreground">Your goal - reach this to win</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-2xl">🧯💊🔦📱</span>
                <div>
                  <p className="font-medium">Safety Items</p>
                  <p className="text-sm text-muted-foreground">Collect for points and safety tips</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-2xl">🔥🚧🚪</span>
                <div>
                  <p className="font-medium">Obstacles</p>
                  <p className="text-sm text-muted-foreground">Avoid these - they damage your health</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div>
            <h3 className="font-semibold mb-3">Scoring System</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>Collecting safety items</span>
                <Badge variant="secondary">+100 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>Combo multiplier (3+ items)</span>
                <Badge variant="secondary">+10 pts per combo</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>Completing the maze</span>
                <Badge variant="secondary">+500 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>Time penalty</span>
                <Badge variant="destructive">-1 pt/second</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span>Hitting obstacles</span>
                <Badge variant="destructive">-50 pts, -10 health</Badge>
              </div>
            </div>
          </div>

          {/* Special Features */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Special Features
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-medium text-primary mb-1">Power-Up Mode</p>
                <p className="text-sm text-muted-foreground">
                  Collect 3+ items in a row to activate power-up mode. Pass through obstacles safely for 10 seconds!
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="font-medium text-accent mb-1">Safety Tips</p>
                <p className="text-sm text-muted-foreground">
                  Each collectible shows important disaster preparedness tips. Learn while you play!
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-semibold mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                Plan your route to collect items efficiently
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                Build combos for higher scores
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                Use power-up mode to take shortcuts through obstacles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">•</span>
                Balance speed with safety - don't rush into obstacles
              </li>
            </ul>
          </div>

          <Button onClick={onClose} className="w-full">
            Start Playing!
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
