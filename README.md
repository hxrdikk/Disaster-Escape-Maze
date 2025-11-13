<!-- ~welcome note -->
<p align="center">
    <img src="https://readme-typing-svg.herokuapp.com/?font=Righteous&size=35&center=true&vCenter=true&width=500&height=70&duration=4000&lines=Hello+there!;Welcome+to+my+Project!" />
</p>

<div style="margin-top:12px;"></div> 

<!-- ~about this project -->
<h3 align="left"> ✨ About this project:</h3>

<div style="margin-top:12px;"></div> 

- Disaster Escape Maze is a browser-based educational game designed to teach disaster preparedness, quick decision-making, and survival awareness through interactive maze challenges. Players navigate through randomly generated mazes, avoid hazards, collect safety items, and reach the exit before disaster strikes.

- Disaster Escape Maze is a Next.js-based web game built to promote disaster awareness.
Each maze introduces players to:

  - Safety items (first-aid kits, masks, flashlights, food packets)

  - Hazards (fires, toxic spills, falling debris, floods)

  - Escape strategy (reaching the safe exit)

 <!-- ~gameplay overview -->
<h3 align="left"> 🎯 Gameplay Overview: </h3>

~ In Disaster Escape Maze, players navigate through dynamically generated mazes using simple arrow-key controls. As you move through each level, you’ll encounter randomly placed survival items that boost your score and help you stay prepared. At the same time, hazardous obstacles appear throughout the maze touching them reduces your health and increases the challenge. Your goal is to reach the green safe zone to complete the level. As you progress, each new stage becomes more difficult, introducing larger mazes, more hazards, and tougher navigation, making every run increasingly intense and engaging.

 <!-- ~technical overview -->
<h3 align="left"> 🧠 Technical Overview: </h3>

A. Tech Stack: The game uses a Depth-First Search (DFS)–based maze generation algorithm combined with randomized obstacle placement to create unique, dynamic levels every time you play.

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Vercel Deployment
- Custom Maze Generation Algorithm
- Canvas-based Rendering

B. Game Engine: The maze is generated using a depth-first search (DFS) maze generation algorithm combined with randomized obstacle placement.
Each tile in the maze can be:

- Wall
- Path
- Hazard
- Collectible
- Exit Portal

C. Core Features: At the heart of Disaster Escape Maze is a DFS-based procedural maze generator that ensures every level is completely unique. Randomized obstacle placement introduces dynamic hazards, while collectible survival items encourage exploration and strategic movement. Smooth animations, responsive controls, and real-time difficulty scaling make the gameplay both challenging and engaging as players progress through increasingly complex mazes.

<!-- ~installation & usage -->
<h3 align="left"> ⚙️ Installation & Usage:</h3>

1. Clone the Repository
```bash
git clone https://github.com/hxrdikk/Disaster-Escape-Maze.git
cd Disaster-Escape-Maze
```

2. Install Dependencies
```bash
pnpm install
```

3. Run Development Server
```bash
pnpm dev
```

4. Build for Production
```bash
pnpm build
pnpm start
```

<!-- ~deployment -->
<h3 align="left"> 🚀 Deployment:</h3>

~ Disaster Escape Maze is currently deployed on Vercel → <a href="https://disaster-escape-maze.vercel.app" target="_blank">disaster-escape-maze.vercel.app</a>

- Deploy your own instance:

    - Push your code to GitHub  
    - Import the repository into Vercel  
    - Configure Build & Development Settings
    - Add any required environment variables (if you use API keys later)  
    - Click Deploy to build and launch your game

<!-- ~project structure -->
<h3 align="left"> 🏗 Project Structure:</h3>

```
Disaster-Escape-Maze/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── game/                # Game screen + logic
│   ├── leaderboard/         # Leaderboard page
│   └── _not-found/          # 404 page
│
├── components/              # Reusable UI components
├── lib/                     # Utility functions (maze generation, game logic)
├── public/                  # Static assets (icons, images)
├── styles/                  # Global styles
├── package.json             # Project config + dependencies
├── pnpm-lock.yaml           # Package lockfile
└── README.md                # Documentation
```
<!-- ~features -->
<h3 align="left"> 🏆 Features:</h3>

- Random maze generation
- Safety item collectibles
- Realistic disaster hazards
- Teaches survival concepts
- Leaderboard functionality
- Smooth controls and animations

<!-- ~author -->
<h3 align="left"> 👨‍💻 Author:</h3>

- Hardik Jain

<!-- ~license -->
<h3 align="left"> 📜 License:</h3>

- This project is open-source and available under the [MIT License](LICENSE).
