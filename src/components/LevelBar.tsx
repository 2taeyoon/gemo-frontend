"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { getRequiredXpForLevel } from "@/utils/levelCalculation"
import "@/styles/auth/level_bar.css"

// LevelBar 컴포넌트의 props 타입 정의
interface LevelBarProps {
  size?: "small" | "large" // 크기 옵션
  showXpText?: boolean // XP 텍스트 표시 여부
  animated?: boolean // 애니메이션 효과 여부
}

/**
 * 레벨업 모달 컴포넌트
 */
function LevelUpModal({ level, onClose }: { level: number, onClose: () => void }) {
  // 다크모드 감지
  const isDark = document.body.classList.contains('dark')
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: isDark ? '#2d3748' : 'white',
        color: isDark ? 'white' : '#1a1a1a',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        maxWidth: '400px',
        animation: 'fadeInScale 0.5s ease-out',
        border: isDark ? '1px solid #4a5568' : 'none'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#3b82f6', 
          marginBottom: '10px' 
        }}>
          레벨업!
        </h2>
        <p style={{ 
          fontSize: '1.5rem', 
          color: isDark ? '#cbd5e0' : '#666', 
          marginBottom: '30px' 
        }}>
          레벨 {level}이 되었습니다!
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6'
          }}
        >
          확인
        </button>
      </div>
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}



// 사용자의 레벨과 경험치를 시각적으로 보여주는 컴포넌트
export default function LevelBar({ size = "small", showXpText = false, animated = false }: LevelBarProps) {
  // 사용자 정보와 레벨업 정보를 가져옵니다
  const { user, levelUpInfo, clearLevelUp } = useUser()

  // 툴팁 표시 상태를 관리합니다
  const [showTooltip, setShowTooltip] = useState(false)

  // 사용자가 로그인하지 않았으면 아무것도 표시하지 않습니다
  if (!user) return null

  // 현재 레벨과 다음 레벨까지 필요한 XP 계산
  const currentLevel = user.level
  const currentXp = user.currentXp
  const requiredXpForCurrentLevel = getRequiredXpForLevel(currentLevel) // 현재 레벨에서 레벨업에 필요한 XP
  const requiredXpForNextLevel = currentLevel < 500 ? requiredXpForCurrentLevel : 0

  // 진행률 계산: (현재 경험치 / 현재 레벨에서 레벨업에 필요한 경험치) * 100
  const progress = requiredXpForNextLevel > 0 ? (currentXp / requiredXpForNextLevel) * 100 : 100

  // 다음 레벨까지 남은 XP
  const remainingXp = requiredXpForNextLevel > 0 ? requiredXpForNextLevel - currentXp : 0

  // 크기에 따른 스타일 클래스를 결정합니다
  const sizeClass = size === "small" ? "small" : "large"

  return (
    <>
      <div className={`container ${sizeClass}`}>
        {/* 레벨 표시 */}
        <div className="level_info">
          <span className="level">Lv.{currentLevel}</span>
          {/* XP 텍스트를 표시하는 경우 */}
          {showXpText && (
            <span className="xp_text">
              {currentXp} / {requiredXpForNextLevel} XP
            </span>
          )}
        </div>

        {/* 레벨 진행바 */}
        <div
          className={`progress_bar ${animated ? "animated" : ""}`}
          onMouseEnter={() => setShowTooltip(true)} // 마우스 올렸을 때 툴팁 표시
          onMouseLeave={() => setShowTooltip(false)} // 마우스 벗어났을 때 툴팁 숨김
        >
          {/* 실제 진행률을 나타내는 바 */}
          <div className="progress_fill" style={{ width: `${Math.min(progress, 100)}%` }} />

          {/* 작은 크기일 때 레벨 텍스트를 바 위에 표시 */}
          {size === "small" && (
            <div className="level_overlay">
              <span className="level_text">Lv.{currentLevel}</span>
            </div>
          )}

          {/* 툴팁 - 작은 크기일 때만 표시 */}
          {showTooltip && size === "small" && (
            <div className="tooltip">
              {currentXp} / {requiredXpForNextLevel} XP
              <div className="tooltip_arrow" />
            </div>
          )}
        </div>

        {/* 큰 크기일 때 다음 레벨까지 남은 XP 표시 */}
        {size === "large" && currentLevel < 500 && (
          <div className="remaining_xp">다음 레벨까지 {remainingXp} XP</div>
        )}

        {/* 최대 레벨 도달 시 */}
        {currentLevel >= 500 && (
          <div className="remaining_xp">🎉 최대 레벨 도달!</div>
        )}
      </div>

      {/* 레벨업 모달 표시 */}
      {levelUpInfo?.isLevelUp && (
        <LevelUpModal 
          level={levelUpInfo.newLevel} 
          onClose={clearLevelUp}
        />
      )}
    </>
  )
}
