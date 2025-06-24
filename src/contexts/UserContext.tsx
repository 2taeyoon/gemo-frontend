"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// 사용자 정보를 담는 인터페이스
interface User {
  id: string // 사용자 고유 ID
  name: string // 사용자 이름
  email: string // 이메일 주소
  level: number // 현재 레벨
  currentXp: number // 현재 레벨에서의 경험치
  totalXp: number // 총 누적 경험치
  lastAttendance: string | null // 마지막 출석 날짜
  consecutiveAttendance: number // 연속 출석 일수
  gameWins: number // 게임 승리 횟수
  consecutiveWins: number // 연속 승리 횟수
}

// UserContext에서 제공하는 함수들의 타입 정의
interface UserContextType {
  user: User | null // 현재 로그인한 사용자 정보
  setUser: (user: User | null) => void // 사용자 정보 설정
  addXp: (amount: number, reason: string) => void // 경험치 추가
  checkAttendance: () => void // 출석체크
  addGameWin: () => void // 게임 승리 처리
  resetWinStreak: () => void // 연승 초기화
  getRequiredXpForLevel: (level: number) => number // 특정 레벨까지 필요한 총 XP
  getRequiredXpForNextLevel: () => number // 다음 레벨까지 필요한 XP
}

// React Context 생성
const UserContext = createContext<UserContextType | undefined>(undefined)

// 레벨별 필요 XP를 계산하는 함수
// 레벨이 높아질수록 더 많은 XP가 필요합니다
const getRequiredXpForLevel = (level: number): number => {
  if (level <= 1) return 0
  if (level <= 10) return (level - 1) * 100 // 1-10레벨: 100xp씩
  if (level <= 50) return 900 + (level - 10) * 200 // 11-50레벨: 200xp씩
  if (level <= 100) return 8900 + (level - 50) * 500 // 51-100레벨: 500xp씩
  if (level <= 200) return 33900 + (level - 100) * 1000 // 101-200레벨: 1000xp씩
  if (level <= 300) return 133900 + (level - 200) * 2000 // 201-300레벨: 2000xp씩
  if (level <= 400) return 333900 + (level - 300) * 5000 // 301-400레벨: 5000xp씩
  if (level <= 500) return 833900 + (level - 400) * 10000 // 401-500레벨: 10000xp씩
  return 1833900 // 500레벨 이후
}

// UserProvider 컴포넌트 - 전체 앱에 사용자 정보를 제공합니다
export function UserProvider({ children }: { children: React.ReactNode }) {
  // 현재 사용자 상태를 관리합니다
  const [user, setUser] = useState<User | null>(null)

  // 컴포넌트가 처음 렌더링될 때 localStorage에서 사용자 데이터를 불러옵니다
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("사용자 데이터 로딩 실패:", error)
        // 잘못된 데이터가 있으면 제거합니다
        localStorage.removeItem("user")
      }
    }
  }, [])

  // 사용자 데이터가 변경될 때마다 localStorage에 저장합니다
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    }
  }, [user])

  // 경험치를 추가하고 레벨업을 처리하는 함수
  const addXp = (amount: number, reason: string) => {
    if (!user) return

    const newTotalXp = user.totalXp + amount
    let newLevel = user.level
    let newCurrentXp = user.currentXp + amount

    // 레벨업 체크 - 현재 XP가 다음 레벨 요구 XP를 넘으면 레벨업
    while (newLevel < 500 && newCurrentXp >= getRequiredXpForLevel(newLevel + 1) - getRequiredXpForLevel(newLevel)) {
      newCurrentXp -= getRequiredXpForLevel(newLevel + 1) - getRequiredXpForLevel(newLevel)
      newLevel++
    }

    // 사용자 정보 업데이트
    setUser({
      ...user,
      level: newLevel,
      currentXp: newCurrentXp,
      totalXp: newTotalXp,
    })

    // 콘솔에 XP 획득 로그 출력
    console.log(`${reason}: +${amount}xp 획득!`)

    // 레벨업했다면 축하 메시지 출력
    if (newLevel > user.level) {
      console.log(`🎉 레벨업! ${user.level} → ${newLevel}`)
    }
  }

  // 출석체크를 처리하는 함수
  const checkAttendance = () => {
    if (!user) return

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    // 이미 오늘 출석했는지 확인
    if (user.lastAttendance === today) {
      alert("이미 오늘 출석체크를 완료했습니다!")
      return
    }

    const baseXp = 10 // 기본 출석 XP
    let bonusXp = 0
    let newConsecutiveAttendance = 1

    // 연속 출석 체크 - 어제 출석했다면 연속 출석 증가
    if (user.lastAttendance === yesterday) {
      newConsecutiveAttendance = user.consecutiveAttendance + 1
    }

    // 연속 출석 보너스 계산
    if (newConsecutiveAttendance >= 30) {
      bonusXp = 1000 // 30일 연속 출석 보너스
    } else if (newConsecutiveAttendance >= 7) {
      bonusXp = 100 // 7일 연속 출석 보너스
    } else if (newConsecutiveAttendance >= 2 && newConsecutiveAttendance <= 6) {
      bonusXp = 20 // 2-6일 연속 출석 보너스
    }

    const totalXp = baseXp + bonusXp
    addXp(totalXp, `출석체크 (${newConsecutiveAttendance}일 연속)`)

    // 출석 정보 업데이트
    setUser({
      ...user,
      lastAttendance: today,
      consecutiveAttendance: newConsecutiveAttendance,
    })

    // 출석 완료 알림
    alert(`출석체크 완료! +${totalXp}XP 획득 (${newConsecutiveAttendance}일 연속)`)
  }

  // 게임 승리를 처리하는 함수
  const addGameWin = () => {
    if (!user) return

    const newConsecutiveWins = user.consecutiveWins + 1
    const newGameWins = user.gameWins + 1

    let xpAmount = 50 // 기본 승리 XP

    // 연승 보너스 계산
    if (newConsecutiveWins >= 10) {
      xpAmount = 1000 // 10연승 이상 보너스
    } else if (newConsecutiveWins >= 5) {
      xpAmount = 300 // 5연승 이상 보너스
    }

    addXp(xpAmount, `게임 승리 (${newConsecutiveWins}연승)`)

    // 게임 통계 업데이트
    setUser({
      ...user,
      gameWins: newGameWins,
      consecutiveWins: newConsecutiveWins,
    })
  }

  // 연승 기록을 초기화하는 함수 (게임 패배 시 호출)
  const resetWinStreak = () => {
    if (!user) return

    setUser({
      ...user,
      consecutiveWins: 0,
    })
  }

  // 다음 레벨까지 필요한 XP를 계산하는 함수
  const getRequiredXpForNextLevel = () => {
    if (!user || user.level >= 500) return 0
    return getRequiredXpForLevel(user.level + 1) - getRequiredXpForLevel(user.level)
  }

  // Context Provider로 값들을 제공합니다
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        addXp,
        checkAttendance,
        addGameWin,
        resetWinStreak,
        getRequiredXpForLevel,
        getRequiredXpForNextLevel,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// UserContext를 사용하기 위한 커스텀 훅
export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser는 UserProvider 내부에서만 사용할 수 있습니다.")
  }
  return context
}
