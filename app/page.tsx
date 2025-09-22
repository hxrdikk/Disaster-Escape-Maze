import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Flame,
  Mountain,
  Waves,
  Wind,
  MapPin,
  Phone,
  Shield,
  Trophy,
  Play,
  Users,
  Clock,
  Target,
} from "lucide-react"
import Link from "next/link"
import { LeaderboardSection } from "@/components/leaderboard-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" aria-hidden />
              <h1 className="text-xl font-bold text-balance">Disaster Escape Maze</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/leaderboard" aria-label="Leaderboard">
                <Badge
                  variant="secondary"
                  className="hidden sm:flex hover:bg-secondary/80 cursor-pointer"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  Leaderboard
                </Badge>
              </Link>
              <Badge variant="secondary" className="hidden sm:flex">
                <Users className="h-3 w-3 mr-1" />
                Educational Game
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 animate-pulse-emergency" aria-hidden>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Safety at every step
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Learn Disaster Safety Through <span className="text-primary">Interactive Gaming</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Navigate through challenging mazes while learning essential safety tips for fires, earthquakes, floods,
              cyclones, and landslides. Every move teaches you how to stay safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/game" aria-label="Start Game">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Play className="h-5 w-5 mr-2" />
                  Start Playing Now
                </Button>
              </Link>
              <Link href="/leaderboard" aria-label="View Leaderboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                  <Trophy className="h-5 w-5 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Game Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Navigate through disaster scenarios, collect safety items, and learn life-saving tips
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Navigate Mazes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use keyboard or touch controls to navigate through 12x12 disaster scenario mazes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Collect Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find fire extinguishers, first aid kits, flashlights, and emergency phones for safety tips
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle>Learn & Compete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Race against time while learning essential safety tips and compete on the leaderboard
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disaster Preparedness Guide */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Disaster Preparedness Guide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essential knowledge for staying safe during natural disasters
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Fire Safety */}
            <Card className="border-destructive/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <Flame className="h-5 w-5 text-destructive" />
                  </div>
                  <CardTitle className="text-destructive">Fire Safety</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Causes</h4>
                  <p className="text-sm text-muted-foreground">
                    Electrical faults, cooking accidents, heating equipment, smoking materials
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prevention</h4>
                  <p className="text-sm text-muted-foreground">
                    Install smoke detectors, maintain electrical systems, safe cooking practices
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During Fire</h4>
                  <p className="text-sm text-muted-foreground">
                    Stay low, check doors for heat, use stairs not elevators, call emergency services
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">After Fire</h4>
                  <p className="text-sm text-muted-foreground">
                    Wait for all-clear, check for structural damage, avoid damaged areas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Earthquake Safety */}
            <Card className="border-chart-3/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                    <Mountain className="h-5 w-5 text-chart-3" />
                  </div>
                  <CardTitle className="text-chart-3">Earthquake Safety</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Causes</h4>
                  <p className="text-sm text-muted-foreground">
                    Tectonic plate movement, fault line activity, volcanic activity
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prevention</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure heavy objects, create emergency kit, know safe spots in each room
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During Earthquake</h4>
                  <p className="text-sm text-muted-foreground">Drop, Cover, Hold On. Stay away from windows and heavy objects</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">After Earthquake</h4>
                  <p className="text-sm text-muted-foreground">
                    Check for injuries, inspect for damage, be prepared for aftershocks
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Flood Safety */}
            <Card className="border-chart-2/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <Waves className="h-5 w-5 text-chart-2" />
                  </div>
                  <CardTitle className="text-chart-2">Flood Safety</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Causes</h4>
                  <p className="text-sm text-muted-foreground">
                    Heavy rainfall, dam failure, storm surge, rapid snowmelt
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prevention</h4>
                  <p className="text-sm text-muted-foreground">
                    Know evacuation routes, keep emergency supplies, monitor weather alerts
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During Flood</h4>
                  <p className="text-sm text-muted-foreground">Move to higher ground, avoid walking/driving through flood water</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">After Flood</h4>
                  <p className="text-sm text-muted-foreground">Avoid flood water, check for structural damage, clean and disinfect</p>
                </div>
              </CardContent>
            </Card>

            {/* Cyclone Safety */}
            <Card className="border-chart-4/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Wind className="h-5 w-5 text-chart-4" />
                  </div>
                  <CardTitle className="text-chart-4">Cyclone Safety</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Causes</h4>
                  <p className="text-sm text-muted-foreground">
                    Warm ocean waters, low pressure systems, atmospheric conditions
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Prevention</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor weather forecasts, secure outdoor items, prepare evacuation plan
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During Cyclone</h4>
                  <p className="text-sm text-muted-foreground">Stay indoors, away from windows, in strongest part of building</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">After Cyclone</h4>
                  <p className="text-sm text-muted-foreground">Wait for all-clear, watch for flooding, avoid downed power lines</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Resources */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Emergency Resources</h2>
            <p className="text-muted-foreground">Important contacts and resources for disaster situations</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Emergency Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">911</p>
                <p className="text-sm text-muted-foreground">Fire, Police, Medical</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-lg">Disaster Hotline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">1-800-RED-CROSS</p>
                <p className="text-sm text-muted-foreground">Disaster Relief</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Waves className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                <CardTitle className="text-lg">Weather Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-chart-2">weather.gov</p>
                <p className="text-sm text-muted-foreground">Weather Alerts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                <CardTitle className="text-lg">FEMA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-secondary-foreground">ready.gov</p>
                <p className="text-sm text-muted-foreground">Preparedness Guide</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <LeaderboardSection />
   {/* Footer Note */}
<footer className="py-8 px-4">
<div className="container mx-auto text-center">
<p className="text-sm text-muted-foreground">
Educational tool for disaster preparedness. Always follow official emergency guidelines.
</p>
</div>
</footer>
</div>
)
}