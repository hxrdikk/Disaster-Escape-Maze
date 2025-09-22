"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

interface MobileGameControlsProps {
  onMove: (direction: "up" | "down" | "left" | "right") => void
  disabled?: boolean
}

export function MobileGameControls({ onMove, disabled = false }: MobileGameControlsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!isMobile) return null

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <span className="text-sm font-medium text-muted-foreground">Touch Controls</span>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-48 mx-auto">
          <div></div>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 touch-manipulation bg-transparent"
            onClick={() => onMove("up")}
            disabled={disabled}
            aria-label="Move up"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <div></div>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 touch-manipulation bg-transparent"
            onClick={() => onMove("left")}
            disabled={disabled}
            aria-label="Move left"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 touch-manipulation bg-transparent"
            onClick={() => onMove("down")}
            disabled={disabled}
            aria-label="Move down"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 touch-manipulation bg-transparent"
            onClick={() => onMove("right")}
            disabled={disabled}
            aria-label="Move right"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">Swipe on the game board also works</p>
        </div>
      </CardContent>
    </Card>
  )
}
