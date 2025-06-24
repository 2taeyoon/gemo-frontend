"use client"

import { useState } from "react"
import { useUser } from "@/contexts/UserContext"

interface LevelBarProps {
  size?: "small" | "large"
  showXpText?: boolean
  animated?: boolean
}

export default function LevelBar({ size = "small", showXpText = false, animated = false }: LevelBarProps) {
  const { user, getRequiredXpForNextLevel } = useUser()
  const [showTooltip, setShowTooltip] = useState(false)

  if (!user) return null

  const requiredXp = getRequiredXpForNextLevel()
  const progress = requiredXp > 0 ? (user.currentXp / requiredXp) * 100 : 100

  const isSmall = size === "small"
  const barHeight = isSmall ? "h-2" : "h-6"
  const textSize = isSmall ? "text-sm" : "text-lg"

  return (
    <div className={`${isSmall ? "w-32" : "w-full max-w-md"} relative`}>
      {/* 레벨 표시 */}
      <div className={`flex justify-between items-center mb-1 ${textSize}`}>
        <span className="font-bold text-blue-600 dark:text-blue-400">Lv.{user.level}</span>
        {showXpText && (
          <span className="text-gray-600 dark:text-gray-400">
            {user.currentXp} / {requiredXp} XP
          </span>
        )}
      </div>

      {/* 레벨바 */}
      <div
        className={`relative ${barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* 진행바 */}
        <div
          className={`${barHeight} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out ${
            animated ? "animate-pulse" : ""
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />

        {/* 레벨 텍스트 (작은 사이즈일 때만) */}
        {isSmall && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">Lv.{user.level}</span>
          </div>
        )}

        {/* 툴팁 */}
        {showTooltip && isSmall && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap z-10">
            {user.currentXp} / {requiredXp} XP
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
          </div>
        )}
      </div>

      {/* 다음 레벨까지 남은 XP (큰 사이즈일 때만) */}
      {!isSmall && user.level < 500 && (
        <div className="mt-2 text-center text-gray-600 dark:text-gray-400">
          다음 레벨까지 {requiredXp - user.currentXp} XP
        </div>
      )}
    </div>
  )
}
