"use client"

import { useState } from "react"

interface DebugOverlayProps {
  debugInfo?: {
    reachabilityResult?: {
      reachable: boolean
      path: Array<{ x: number; y: number }>
      visited?: Set<string>
    }
    repairResult?: {
      repaired: boolean
      removed: Array<{ x: number; y: number; oldType: string }>
      path: Array<{ x: number; y: number }>
    }
  }
  gridSize: number
  cellSize: number
}

export function DebugOverlay({ debugInfo, gridSize, cellSize }: DebugOverlayProps) {
  const [showVisited, setShowVisited] = useState(false)
  const [showPath, setShowPath] = useState(false)
  const [showRepaired, setShowRepaired] = useState(false)

  if (!debugInfo) return null

  const { reachabilityResult, repairResult } = debugInfo

  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm max-w-xs">
      <h3 className="font-bold mb-2">Debug Mode</h3>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showVisited} onChange={(e) => setShowVisited(e.target.checked)} />
          Show BFS Visited Nodes
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showPath} onChange={(e) => setShowPath(e.target.checked)} />
          Show Optimal Path
        </label>

        {repairResult && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showRepaired} onChange={(e) => setShowRepaired(e.target.checked)} />
            Show Repaired Tiles
          </label>
        )}
      </div>

      <div className="mt-4 text-xs">
        <div>Reachable: {reachabilityResult?.reachable ? "✅" : "❌"}</div>
        {repairResult && <div>Repaired: {repairResult.repaired ? "✅" : "❌"}</div>}
        {repairResult?.removed.length && <div>Removed: {repairResult.removed.length} obstacles</div>}
      </div>

      {/* Debug visualization overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* BFS visited nodes */}
        {showVisited && reachabilityResult?.visited && (
          <>
            {Array.from(reachabilityResult.visited).map((nodeKey) => {
              const [x, y] = nodeKey.split(",").map(Number)
              return (
                <div
                  key={`visited-${nodeKey}`}
                  className="absolute bg-blue-500/30 border border-blue-400"
                  style={{
                    left: x * cellSize,
                    top: y * cellSize,
                    width: cellSize,
                    height: cellSize,
                  }}
                />
              )
            })}
          </>
        )}

        {/* Optimal path */}
        {showPath && reachabilityResult?.path && (
          <>
            {reachabilityResult.path.map((point, index) => (
              <div
                key={`path-${index}`}
                className="absolute bg-green-500/50 border border-green-400"
                style={{
                  left: point.x * cellSize,
                  top: point.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              />
            ))}
          </>
        )}

        {/* Repaired tiles */}
        {showRepaired && repairResult?.removed && (
          <>
            {repairResult.removed.map((removed, index) => (
              <div
                key={`repaired-${index}`}
                className="absolute bg-yellow-500/50 border border-yellow-400"
                style={{
                  left: removed.x * cellSize,
                  top: removed.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/30 border border-blue-400"></div>
          <span>BFS Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/50 border border-green-400"></div>
          <span>Optimal Path</span>
        </div>
        {repairResult && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500/50 border border-yellow-400"></div>
            <span>Repaired Tiles</span>
          </div>
        )}
      </div>
    </div>
  )
}
