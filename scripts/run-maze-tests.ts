import { MazeTestSuite } from "./maze-tests"

console.log("[v0] Starting Disaster Escape Maze Test Suite...")

// Run the comprehensive test suite
MazeTestSuite.runSmall()

// Test configuration
setTimeout(() => {
  MazeTestSuite.testConfig()
}, 6000)

console.log("[v0] All maze tests initiated successfully!")
console.log("[v0] Check console for test results over the next 10 seconds")
