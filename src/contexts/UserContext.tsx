"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  level: number
  currentXp: number
  totalXp: number
  lastAttendance: string | null
  consecutiveAttendance: number
  gameWins: number
  consecutiveWins: number
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  addXp: (amount: number, reason: string) => void
  checkAttendance: () => void
  addGameWin: () => void
  resetWinStreak: () => void
  getRequiredXpForLevel: (level: number) => number
  getRequiredXpForNextLevel: () => number
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// 레벨별 필요 XP 계산
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // 로컬스토리지에서 사용자 데이터 로드
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // 사용자 데이터 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    }
  }, [user])

  const addXp = (amount: number, reason: string) => {
    if (!user) return

    const newTotalXp = user.totalXp + amount
    let newLevel = user.level
    let newCurrentXp = user.currentXp + amount

    // 레벨업 체크
    while (newLevel < 500 && newCurrentXp >= getRequiredXpForLevel(newLevel + 1) - getRequiredXpForLevel(newLevel)) {
      newCurrentXp -= getRequiredXpForLevel(newLevel + 1) - getRequiredXpForLevel(newLevel)
      newLevel++
    }

    setUser({
      ...user,
      level: newLevel,
      currentXp: newCurrentXp,
      totalXp: newTotalXp,
    })

    // XP 획득 알림
    console.log(`${reason}: +${amount}xp 획득!`)
  }

  const checkAttendance = () => {
    if (!user) return

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    // 이미 오늘 출석했는지 확인
    if (user.lastAttendance === today) {
      alert("이미 오늘 출석체크를 완료했습니다!")
      return
    }

    const baseXp = 10
    let bonusXp = 0
    let newConsecutiveAttendance = 1

    // 연속 출석 체크
    if (user.lastAttendance === yesterday) {
      newConsecutiveAttendance = user.consecutiveAttendance + 1
    }

    // 연속 출석 보너스 계산
    if (newConsecutiveAttendance >= 30) {
      bonusXp = 1000
    } else if (newConsecutiveAttendance >= 7) {
      bonusXp = 100
    } else if (newConsecutiveAttendance >= 2 && newConsecutiveAttendance <= 6) {
      bonusXp = 20
    }

    const totalXp = baseXp + bonusXp
    addXp(totalXp, `출석체크 (${newConsecutiveAttendance}일 연속)`)

    setUser({
      ...user,
      lastAttendance: today,
      consecutiveAttendance: newConsecutiveAttendance,
    })
  }

  const addGameWin = () => {
    if (!user) return

    const newConsecutiveWins = user.consecutiveWins + 1
    const newGameWins = user.gameWins + 1

    let xpAmount = 50 // 기본 승리 XP

    // 연승 보너스
    if (newConsecutiveWins >= 10) {
      xpAmount = 1000
    } else if (newConsecutiveWins >= 5) {
      xpAmount = 300
    }

    addXp(xpAmount, `게임 승리 (${newConsecutiveWins}연승)`)

    setUser({
      ...user,
      gameWins: newGameWins,
      consecutiveWins: newConsecutiveWins,
    })
  }

  const resetWinStreak = () => {
    if (!user) return

    setUser({
      ...user,
      consecutiveWins: 0,
    })
  }

  const getRequiredXpForNextLevel = () => {
    if (!user || user.level >= 500) return 0
    return getRequiredXpForLevel(user.level + 1) - getRequiredXpForLevel(user.level)
  }

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

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
