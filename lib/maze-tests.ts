import { MazeEngine } from "./maze-engine"

export class MazeTests {
  static async testReachabilityForMany(tries = 100): Promise<void> {
    console.log(`[v0] Running comprehensive maze reachability tests for ${tries} generations...`)

    let passed = 0
    let failed = 0
    let repaired = 0
    const failedMaps: any[] = []
    const performanceMetrics: number[] = []

    for (let i = 0; i < tries; i++) {
      const startTime = performance.now()

      try {
        const engine = new MazeEngine(12, {
          debugMode: false,
          maxRepairIterations: 50,
        })

        const result = engine.generateMaze()
        const endTime = performance.now()
        performanceMetrics.push(endTime - startTime)

        // Verify reachability after generation
        const reachabilityCheck = engine.isReachable(result.playerPos, result.exitPos, result.maze, result.obstacles)

        if (reachabilityCheck.reachable) {
          passed++
          if (result.debugInfo?.repairResult?.repaired) {
            repaired++
          }
        } else {
          failed++
          failedMaps.push({
            attempt: i + 1,
            maze: result.maze,
            playerPos: result.playerPos,
            exitPos: result.exitPos,
            obstacles: result.obstacles,
            debugInfo: result.debugInfo,
          })
          console.error(`[v0] Test ${i + 1} failed: exit unreachable after repair`)
        }
      } catch (error) {
        failed++
        const endTime = performance.now()
        performanceMetrics.push(endTime - startTime)
        console.error(`[v0] Test ${i + 1} crashed:`, error)
      }
    }

    // Calculate performance statistics
    const avgTime = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length
    const maxTime = Math.max(...performanceMetrics)
    const minTime = Math.min(...performanceMetrics)

    console.log(`[v0] ===== TEST RESULTS =====`)
    console.log(`[v0] Total Tests: ${tries}`)
    console.log(`[v0] Passed: ${passed} (${((passed / tries) * 100).toFixed(1)}%)`)
    console.log(`[v0] Failed: ${failed} (${((failed / tries) * 100).toFixed(1)}%)`)
    console.log(`[v0] Auto-Repaired: ${repaired} (${((repaired / tries) * 100).toFixed(1)}%)`)
    console.log(`[v0] ===== PERFORMANCE =====`)
    console.log(`[v0] Average Generation Time: ${avgTime.toFixed(2)}ms`)
    console.log(`[v0] Min Time: ${minTime.toFixed(2)}ms`)
    console.log(`[v0] Max Time: ${maxTime.toFixed(2)}ms`)

    if (failedMaps.length > 0) {
      console.warn(`[v0] ${failedMaps.length} maps failed reachability test`)
      // Store last failed map for inspection
      if (typeof window !== "undefined") {
        ;(window as any).lastFailedMap = failedMaps[failedMaps.length - 1]
        console.log("[v0] Last failed map stored in window.lastFailedMap")
      }
    } else {
      console.log(`[v0] 🎉 All tests passed! Pathfinding system is working correctly.`)
    }
  }

  static run(tries = 100): void {
    this.testReachabilityForMany(tries)
  }
}

// Make tests available globally
if (typeof window !== "undefined") {
  ;(window as any).MazeTests = MazeTests
}
