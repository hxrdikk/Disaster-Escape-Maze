export interface MazeConfig {
  allowDiagonal: boolean
  obstacleCost: number
  maxRepairIterations: number
  mutateGridByDefault: boolean
  debugMode: boolean
}

export interface PathfindingResult {
  reachable: boolean
  path: Array<{ x: number; y: number }>
  visited?: Set<string>
}

export interface RepairResult {
  repaired: boolean
  removed: Array<{ x: number; y: number; oldType: string }>
  path: Array<{ x: number; y: number }>
}

export class MazeEngine {
  private gridSize: number
  private config: MazeConfig
  private passableTypes = new Set([" ", "exit", "player"])

  constructor(gridSize: number, config: Partial<MazeConfig> = {}) {
    this.gridSize = gridSize
    this.config = {
      allowDiagonal: false,
      obstacleCost: 10,
      maxRepairIterations: 50,
      mutateGridByDefault: true,
      debugMode: false,
      ...config,
    }
  }

  generateMaze() {
    let maze = this.createBasicMaze()
    maze = this.addOpenings(maze)

    const playerPos = { x: 1, y: 1 }
    const exitPos = { x: this.gridSize - 2, y: this.gridSize - 2 }

    // Ensure exit placement is valid
    if (!this.validateExitPlacement(exitPos, maze)) {
      // Find a better exit position
      const validExitPos = this.findValidExitPosition(maze, playerPos)
      if (validExitPos) {
        Object.assign(exitPos, validExitPos)
      }
    }

    const obstacles = this.generateObstacles(maze)
    const collectibles = this.generateCollectibles(maze, obstacles)

    // Post-placement validation and repair
    const reachabilityResult = this.isReachable(playerPos, exitPos, maze, obstacles)
    let repairResult: RepairResult | null = null

    if (!reachabilityResult.reachable) {
      console.log("[v0] Exit unreachable, attempting repair...")
      repairResult = this.repairPath(playerPos, exitPos, maze, obstacles)

      if (repairResult.repaired) {
        console.log("[v0] Map repaired successfully")
        // Show toast notification in game
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("maze-repaired", {
              detail: { message: "Map adjusted to ensure the exit is reachable." },
            }),
          )
        }
      } else {
        console.warn("[v0] Could not repair map, regenerating...")
        return this.generateMaze() // Regenerate if repair fails
      }
    }

    return {
      maze,
      playerPos,
      exitPos,
      obstacles,
      collectibles,
      debugInfo: this.config.debugMode
        ? {
            reachabilityResult,
            repairResult,
          }
        : undefined,
    }
  }

  isReachable(
    start: { x: number; y: number },
    exit: { x: number; y: number },
    grid: string[][] | null = null,
    obstacles: Array<{ x: number; y: number; type: string }> = [],
  ): PathfindingResult {
    const visited = new Set<string>()
    const queue = [start]
    const path: Array<{ x: number; y: number }> = []
    const parent = new Map<string, { x: number; y: number } | null>()

    parent.set(`${start.x},${start.y}`, null)

    while (queue.length > 0) {
      const current = queue.shift()!
      const key = `${current.x},${current.y}`

      if (visited.has(key)) continue
      visited.add(key)

      if (current.x === exit.x && current.y === exit.y) {
        // Reconstruct path
        const reconstructedPath: Array<{ x: number; y: number }> = []
        let pathNode: { x: number; y: number } | null = current

        while (pathNode) {
          reconstructedPath.unshift(pathNode)
          pathNode = parent.get(`${pathNode.x},${pathNode.y}`) || null
        }

        return { reachable: true, path: reconstructedPath, visited }
      }

      const directions = this.config.allowDiagonal
        ? [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
            [1, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
          ]
        : [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ]

      for (const [dx, dy] of directions) {
        const newX = current.x + dx
        const newY = current.y + dy
        const newKey = `${newX},${newY}`

        if (this.isValidPosition(newX, newY, grid, obstacles) && !visited.has(newKey)) {
          queue.push({ x: newX, y: newY })
          parent.set(newKey, current)
        }
      }
    }

    return { reachable: false, path: [], visited }
  }

  findLeastCostPath(
    start: { x: number; y: number },
    exit: { x: number; y: number },
    grid: string[][],
    costs: Map<string, number> = new Map(),
  ): Array<{ x: number; y: number }> | null {
    const openSet = new Set<string>()
    const closedSet = new Set<string>()
    const gScore = new Map<string, number>()
    const fScore = new Map<string, number>()
    const parent = new Map<string, { x: number; y: number } | null>()

    const startKey = `${start.x},${start.y}`
    const exitKey = `${exit.x},${exit.y}`

    openSet.add(startKey)
    gScore.set(startKey, 0)
    fScore.set(startKey, this.heuristic(start, exit))
    parent.set(startKey, null)

    while (openSet.size > 0) {
      // Find node with lowest fScore
      const current = Array.from(openSet).reduce((lowest, node) =>
        (fScore.get(node) || Number.POSITIVE_INFINITY) < (fScore.get(lowest) || Number.POSITIVE_INFINITY)
          ? node
          : lowest,
      )

      if (current === exitKey) {
        // Reconstruct path
        const path: Array<{ x: number; y: number }> = []
        const [x, y] = current.split(",").map(Number)
        let pathNode: { x: number; y: number } | null = { x, y }

        while (pathNode) {
          path.unshift(pathNode)
          pathNode = parent.get(`${pathNode.x},${pathNode.y}`) || null
        }
        return path
      }

      openSet.delete(current)
      closedSet.add(current)

      const [currentX, currentY] = current.split(",").map(Number)
      const directions = this.config.allowDiagonal
        ? [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
            [1, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
          ]
        : [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ]

      for (const [dx, dy] of directions) {
        const newX = currentX + dx
        const newY = currentY + dy
        const neighborKey = `${newX},${newY}`

        if (closedSet.has(neighborKey) || !this.isInBounds(newX, newY)) continue

        const moveCost = this.getMoveCost(newX, newY, grid, costs)
        const tentativeGScore = (gScore.get(current) || 0) + moveCost

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey)
        } else if (tentativeGScore >= (gScore.get(neighborKey) || Number.POSITIVE_INFINITY)) {
          continue
        }

        parent.set(neighborKey, { x: currentX, y: currentY })
        gScore.set(neighborKey, tentativeGScore)
        fScore.set(neighborKey, tentativeGScore + this.heuristic({ x: newX, y: newY }, exit))
      }
    }

    return null
  }

  repairPath(
    start: { x: number; y: number },
    exit: { x: number; y: number },
    grid: string[][],
    obstacles: Array<{ x: number; y: number; type: string }>,
    options: { mutateGrid?: boolean } = {},
  ): RepairResult {
    const mutateGrid = options.mutateGrid ?? this.config.mutateGridByDefault
    const removed: Array<{ x: number; y: number; oldType: string }> = []

    // Create cost map where obstacles have high cost
    const costs = new Map<string, number>()
    obstacles.forEach((obs) => {
      costs.set(`${obs.x},${obs.y}`, this.config.obstacleCost)
    })

    // Find least cost path through obstacles
    const candidatePath = this.findLeastCostPath(start, exit, grid, costs)

    if (!candidatePath) {
      return { repaired: false, removed: [], path: [] }
    }

    // Remove obstacles along the path until reachable
    let iterations = 0
    while (iterations < this.config.maxRepairIterations) {
      const reachabilityCheck = this.isReachable(start, exit, grid, obstacles)
      if (reachabilityCheck.reachable) {
        return { repaired: true, removed, path: reachabilityCheck.path }
      }

      // Find next obstacle to remove along candidate path
      let obstacleRemoved = false
      for (const pathPoint of candidatePath) {
        const obstacleIndex = obstacles.findIndex(
          (obs) => obs.x === pathPoint.x && obs.y === pathPoint.y && !obs.immutable,
        )

        if (obstacleIndex !== -1) {
          const obstacle = obstacles[obstacleIndex]
          removed.push({ x: obstacle.x, y: obstacle.y, oldType: obstacle.type })

          if (mutateGrid) {
            obstacles.splice(obstacleIndex, 1)
            if (grid[pathPoint.y][pathPoint.x] === "#") {
              grid[pathPoint.y][pathPoint.x] = " "
            }
          }

          obstacleRemoved = true
          break
        }
      }

      if (!obstacleRemoved) {
        // Fallback: remove obstacles around exit
        const exitNeighbors = this.getNeighbors(exit.x, exit.y)
        for (const neighbor of exitNeighbors) {
          const obstacleIndex = obstacles.findIndex(
            (obs) => obs.x === neighbor.x && obs.y === neighbor.y && !obs.immutable,
          )
          if (obstacleIndex !== -1) {
            const obstacle = obstacles[obstacleIndex]
            removed.push({ x: obstacle.x, y: obstacle.y, oldType: obstacle.type })
            if (mutateGrid) {
              obstacles.splice(obstacleIndex, 1)
            }
            obstacleRemoved = true
            break
          }
        }
      }

      if (!obstacleRemoved) break
      iterations++
    }

    const finalCheck = this.isReachable(start, exit, grid, obstacles)
    return {
      repaired: finalCheck.reachable,
      removed,
      path: finalCheck.path,
    }
  }

  validateExitPlacement(exit: { x: number; y: number }, grid: string[][]): boolean {
    const neighbors = this.getNeighbors(exit.x, exit.y)
    return neighbors.some(
      (neighbor) => this.isInBounds(neighbor.x, neighbor.y) && this.passableTypes.has(grid[neighbor.y][neighbor.x]),
    )
  }

  private isValidPosition(
    x: number,
    y: number,
    grid: string[][] | null,
    obstacles: Array<{ x: number; y: number; type: string }>,
  ): boolean {
    if (!this.isInBounds(x, y)) return false

    if (grid && !this.passableTypes.has(grid[y][x])) return false

    return !obstacles.some((obs) => obs.x === x && obs.y === y)
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize
  }

  private heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
    if (this.config.allowDiagonal) {
      return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
    }
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  private getMoveCost(x: number, y: number, grid: string[][], costs: Map<string, number>): number {
    const key = `${x},${y}`
    return costs.get(key) || 1
  }

  private getNeighbors(x: number, y: number): Array<{ x: number; y: number }> {
    const directions = this.config.allowDiagonal
      ? [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
          [1, 1],
          [-1, -1],
          [1, -1],
          [-1, 1],
        ]
      : [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ]

    return directions.map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
  }

  private findValidExitPosition(
    maze: string[][],
    playerPos: { x: number; y: number },
  ): { x: number; y: number } | null {
    // Find all corridor tiles that are far from player
    const candidates: Array<{ x: number; y: number; distance: number }> = []

    for (let y = 1; y < this.gridSize - 1; y++) {
      for (let x = 1; x < this.gridSize - 1; x++) {
        if (maze[y][x] === " " && this.validateExitPlacement({ x, y }, maze)) {
          const distance = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y)
          candidates.push({ x, y, distance })
        }
      }
    }

    // Sort by distance and pick the farthest valid position
    candidates.sort((a, b) => b.distance - a.distance)
    return candidates[0] || null
  }

  private createBasicMaze(): string[][] {
    const maze: string[][] = []

    // Initialize with walls
    for (let y = 0; y < this.gridSize; y++) {
      maze[y] = []
      for (let x = 0; x < this.gridSize; x++) {
        maze[y][x] = "#"
      }
    }

    // Create paths using recursive backtracking
    this.carvePaths(maze, 1, 1)

    return maze
  }

  private carvePaths(maze: string[][], x: number, y: number) {
    maze[y][x] = " " // Mark as path

    // Directions: up, right, down, left
    const directions = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ]

    // Shuffle directions for randomness
    this.shuffleArray(directions)

    for (const [dx, dy] of directions) {
      const newX = x + dx
      const newY = y + dy

      // Check bounds
      if (newX > 0 && newX < this.gridSize - 1 && newY > 0 && newY < this.gridSize - 1 && maze[newY][newX] === "#") {
        // Carve path between current and new position
        maze[y + dy / 2][x + dx / 2] = " "
        this.carvePaths(maze, newX, newY)
      }
    }
  }

  private addOpenings(maze: string[][]): string[][] {
    // Add some additional openings to make the maze less linear
    const openings = Math.floor(this.gridSize * 0.8)

    for (let i = 0; i < openings; i++) {
      const x = Math.floor(Math.random() * (this.gridSize - 2)) + 1
      const y = Math.floor(Math.random() * (this.gridSize - 2)) + 1

      if (maze[y][x] === "#") {
        // Check if opening this wall connects two paths
        const neighbors = [maze[y - 1]?.[x], maze[y + 1]?.[x], maze[y]?.[x - 1], maze[y]?.[x + 1]].filter(
          (cell) => cell === " ",
        )

        if (neighbors.length >= 2) {
          maze[y][x] = " "
        }
      }
    }

    return maze
  }

  private generateObstacles(maze: string[][]): Array<{ x: number; y: number; type: string }> {
    const obstacles: Array<{ x: number; y: number; type: string }> = []
    const obstacleTypes = ["fire", "stairs", "door"]
    const maxObstacles = Math.floor(this.gridSize * 0.6)

    for (let i = 0; i < maxObstacles; i++) {
      const x = Math.floor(Math.random() * this.gridSize)
      const y = Math.floor(Math.random() * this.gridSize)

      // Only place on open paths, not start/exit
      if (maze[y][x] === " " && !(x === 1 && y === 1) && !(x === this.gridSize - 2 && y === this.gridSize - 2)) {
        obstacles.push({
          x,
          y,
          type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
        })
      }
    }

    return obstacles
  }

  private generateCollectibles(
    maze: string[][],
    obstacles: Array<{ x: number; y: number; type: string }>,
  ): Array<{ x: number; y: number; type: string; collected: boolean }> {
    const collectibles: Array<{ x: number; y: number; type: string; collected: boolean }> = []
    const collectibleTypes = ["extinguisher", "firstaid", "flashlight", "phone"]
    const maxCollectibles = 8

    for (let i = 0; i < maxCollectibles; i++) {
      let attempts = 0
      let placed = false

      while (!placed && attempts < 50) {
        const x = Math.floor(Math.random() * this.gridSize)
        const y = Math.floor(Math.random() * this.gridSize)

        // Check if position is valid (open path, no obstacles, not start/exit)
        const hasObstacle = obstacles.some((obs) => obs.x === x && obs.y === y)
        const hasCollectible = collectibles.some((col) => col.x === x && col.y === y)

        if (
          maze[y][x] === " " &&
          !hasObstacle &&
          !hasCollectible &&
          !(x === 1 && y === 1) &&
          !(x === this.gridSize - 2 && y === this.gridSize - 2)
        ) {
          collectibles.push({
            x,
            y,
            type: collectibleTypes[i % collectibleTypes.length],
            collected: false,
          })
          placed = true
        }
        attempts++
      }
    }

    return collectibles
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
}

export class MazeTests {
  static run(tries = 100): void {
    console.log(`[v0] Running maze reachability tests for ${tries} generations...`)

    let passed = 0
    let failed = 0
    const failedMaps: any[] = []

    for (let i = 0; i < tries; i++) {
      try {
        const engine = new MazeEngine(12, { debugMode: false })
        const result = engine.generateMaze()

        const reachabilityCheck = engine.isReachable(result.playerPos, result.exitPos, result.maze, result.obstacles)

        if (reachabilityCheck.reachable) {
          passed++
        } else {
          failed++
          failedMaps.push({
            attempt: i + 1,
            maze: result.maze,
            playerPos: result.playerPos,
            exitPos: result.exitPos,
            obstacles: result.obstacles,
          })
          console.error(`[v0] Test ${i + 1} failed: exit unreachable`)
        }
      } catch (error) {
        failed++
        console.error(`[v0] Test ${i + 1} crashed:`, error)
      }
    }

    console.log(`[v0] Test Results: ${passed}/${tries} passed, ${failed} failed`)

    if (failedMaps.length > 0) {
      console.warn(`[v0] ${failedMaps.length} maps failed reachability test`)
      // Store last failed map for inspection
      if (typeof window !== "undefined") {
        ;(window as any).lastFailedMap = failedMaps[failedMaps.length - 1]
        console.log("[v0] Last failed map stored in window.lastFailedMap")
      }
    }
  }
}

// Make tests available globally
if (typeof window !== "undefined") {
  ;(window as any).MazeTests = MazeTests
}
