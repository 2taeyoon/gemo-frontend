"use client"

import { useState } from "react"
import { useUser } from "@/contexts/UserContext"
import styles from "@/styles/modules/LevelBar.module.css"

// LevelBar 컴포넌트의 props 타입 정의
interface LevelBarProps {
  size?: "small" | "large" // 크기 옵션
  showXpText?: boolean // XP 텍스트 표시 여부
  animated?: boolean // 애니메이션 효과 여부
}

// 사용자의 레벨과 경험치를 시각적으로 보여주는 컴포넌트
export default function LevelBar({ size = "small", showXpText = false, animated = false }: LevelBarProps) {
  // 사용자 정보와 다음 레벨까지 필요한 XP를 가져옵니다
  const { user, getRequiredXpForNextLevel } = useUser()

  // 툴팁 표시 상태를 관리합니다
  const [showTooltip, setShowTooltip] = useState(false)

  // 사용자가 로그인하지 않았으면 아무것도 표시하지 않습니다
  if (!user) return null

  // 다음 레벨까지 필요한 XP와 현재 진행률을 계산합니다
  const requiredXp = getRequiredXpForNextLevel()
  const progress = requiredXp > 0 ? (user.currentXp / requiredXp) * 100 : 100

  // 크기에 따른 스타일 클래스를 결정합니다
  const sizeClass = size === "small" ? styles.small : styles.large

  return (
    <div className={`${styles.container} ${sizeClass}`}>
      {/* 레벨 표시 */}
      <div className={styles.levelInfo}>
        <span className={styles.level}>Lv.{user.level}</span>
        {/* XP 텍스트를 표시하는 경우 */}
        {showXpText && (
          <span className={styles.xpText}>
            {user.currentXp} / {requiredXp} XP
          </span>
        )}
      </div>

      {/* 레벨 진행바 */}
      <div
        className={`${styles.progressBar} ${animated ? styles.animated : ""}`}
        onMouseEnter={() => setShowTooltip(true)} // 마우스 올렸을 때 툴팁 표시
        onMouseLeave={() => setShowTooltip(false)} // 마우스 벗어났을 때 툴팁 숨김
      >
        {/* 실제 진행률을 나타내는 바 */}
        <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />

        {/* 작은 크기일 때 레벨 텍스트를 바 위에 표시 */}
        {size === "small" && (
          <div className={styles.levelOverlay}>
            <span className={styles.levelText}>Lv.{user.level}</span>
          </div>
        )}

        {/* 툴팁 - 작은 크기일 때만 표시 */}
        {showTooltip && size === "small" && (
          <div className={styles.tooltip}>
            {user.currentXp} / {requiredXp} XP
            <div className={styles.tooltipArrow} />
          </div>
        )}
      </div>

      {/* 큰 크기일 때 다음 레벨까지 남은 XP 표시 */}
      {size === "large" && user.level < 500 && (
        <div className={styles.remainingXp}>다음 레벨까지 {requiredXp - user.currentXp} XP</div>
      )}
    </div>
  )
}
