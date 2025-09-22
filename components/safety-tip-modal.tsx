"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Lightbulb } from "lucide-react"

interface SafetyTipModalProps {
  collectibleType: string
  onClose: () => void
}

const SAFETY_TIPS = {
  extinguisher: {
    title: "Fire Extinguisher Found!",
    icon: "🧯",
    tips: [
      "Never use elevators during fire emergencies",
      "Stay low and crawl if there's smoke",
      "Check doors for heat before opening",
      "Stop, Drop, and Roll if clothes catch fire",
    ],
    color: "destructive",
  },
  firstaid: {
    title: "First Aid Kit Collected!",
    icon: "💊",
    tips: [
      "Know two exits from every room",
      "Keep emergency supplies ready",
      "Learn basic first aid techniques",
      "Have emergency contact numbers handy",
    ],
    color: "accent",
  },
  flashlight: {
    title: "Flashlight Acquired!",
    icon: "🔦",
    tips: [
      "Drop, Cover, Hold On during earthquakes",
      "Stay indoors until shaking stops",
      "Stay away from windows and glass",
      "Be prepared for aftershocks",
    ],
    color: "chart-4",
  },
  phone: {
    title: "Emergency Phone Found!",
    icon: "📱",
    tips: [
      "Don't use lifts immediately after earthquakes",
      "Call emergency services: 911",
      "Have a family communication plan",
      "Know your local emergency numbers",
    ],
    color: "chart-2",
  },
}

export function SafetyTipModal({ collectibleType, onClose }: SafetyTipModalProps) {
  const tipData = SAFETY_TIPS[collectibleType as keyof typeof SAFETY_TIPS]

  if (!tipData) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <CardHeader className="text-center relative">
          <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">{tipData.icon}</span>
          </div>
          <CardTitle className="text-xl">{tipData.title}</CardTitle>
          <CardDescription>
            <Badge className="mt-2">+100 Points</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="font-semibold">Safety Tips</span>
            </div>
            <div className="space-y-2">
              {tipData.tips.map((tip, index) => (
                <div key={index} className="text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="text-primary font-medium">•</span> {tip}
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onClose} className="w-full">
            Continue Playing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
