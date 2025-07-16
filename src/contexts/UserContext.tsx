"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { getRequiredXpForLevel } from "@/utils/levelCalculation"

/**
 * 사용자 정보를 담는 인터페이스
 * MongoDB의 UserProfile과 동일한 구조를 사용합니다.
 */
interface User {
  id: string // 사용자 고유 ID
  name: string // 사용자 이름
  email: string // 이메일 주소
  thema: 'light' | 'dark' // 다크모드 설정
  // gameData 객체의 정보들
  level: number // 현재 레벨
  currentXp: number // 현재 레벨에서의 경험치
  totalXp: number // 총 누적 경험치
  lastAttendance: string | null // 마지막 출석 날짜 (YYYY-MM-DD 형식)
  consecutiveAttendance: number // 연속 출석 일수
  gameWins: number // 게임 승리 횟수
  consecutiveWins: number // 연속 승리 횟수
}

/**
 * UserContext에서 제공하는 함수들의 타입 정의
 */
interface UserContextType {
  user: User | null // 현재 로그인한 사용자 정보
  loading: boolean // 사용자 데이터 로딩 상태
  refreshUser: () => Promise<void> // 사용자 데이터 새로고침
  addXp: (amount: number, reason: string) => Promise<void> // 경험치 추가
  checkAttendance: () => Promise<void> // 출석체크
  addGameWin: () => Promise<void> // 게임 승리 처리
  resetWinStreak: () => Promise<void> // 연승 초기화
  getRequiredXpForNextLevel: () => number // 다음 레벨까지 필요한 XP
  updateThema: (thema: 'light' | 'dark') => Promise<void> // 테마 업데이트
  // 레벨업 관련
  levelUpInfo: { isLevelUp: boolean; newLevel: number } | null // 레벨업 정보
  clearLevelUp: () => void // 레벨업 상태 초기화
}

// React Context 생성
const UserContext = createContext<UserContextType | undefined>(undefined)



/**
 * UserProvider 컴포넌트
 * 전체 앱에 사용자 정보를 제공하고 MongoDB와 연동하여 데이터를 관리합니다.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  // 현재 사용자 상태를 관리합니다
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 레벨업 상태를 관리합니다
  const [levelUpInfo, setLevelUpInfo] = useState<{ isLevelUp: boolean; newLevel: number } | null>(null)
  
  // NextAuth 세션 정보를 가져옵니다
  const { data: session, status } = useSession()

  /**
   * 레벨업 상태를 초기화하는 함수
   */
  const clearLevelUp = () => {
    setLevelUpInfo(null)
  }

  /**
   * MongoDB에서 사용자 프로필을 조회하는 함수
   */
  const fetchUserProfile = async () => {
    if (!session?.user) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()

      if (result.success && result.data) {
        const profile = result.data
        // MongoDB 프로필 데이터를 User 인터페이스 형태로 변환 (gameData 구조 반영)
        setUser({
          id: profile._id,
          name: profile.name,
          email: profile.email,
          thema: profile.thema || 'light', // 기본값은 light
          level: profile.gameData?.level || 1,
          currentXp: profile.gameData?.currentXp || 0,
          totalXp: profile.gameData?.totalXp || 0,
          lastAttendance: profile.gameData?.lastAttendance || null,
          consecutiveAttendance: profile.gameData?.consecutiveAttendance || 0,
          gameWins: profile.gameData?.gameWins || 0,
          consecutiveWins: profile.gameData?.consecutiveWins || 0,
        })
      } else {
        console.error('사용자 프로필 조회 실패:', result.error)
        setUser(null)
      }
    } catch (error) {
      console.error('사용자 프로필 조회 중 오류:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 사용자 데이터 새로고침 함수
   */
  const refreshUser = async () => {
    await fetchUserProfile()
  }

  /**
   * 세션 상태가 변경될 때마다 사용자 프로필을 다시 조회합니다
   */
  useEffect(() => {
    if (status === 'loading') return // 세션 로딩 중이면 대기

    if (status === 'authenticated') {
      fetchUserProfile()
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  /**
   * 경험치를 추가하는 함수
   * API를 통해 MongoDB에 저장하고 UI를 업데이트합니다.
   * @param amount - 추가할 경험치
   * @param reason - 경험치 추가 이유
   */
  const addXp = async (amount: number, reason: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/user/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, reason }),
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트
        setUser(prev => prev ? {
          ...prev,
          level: result.data.level,
          currentXp: result.data.currentXp,
          totalXp: result.data.totalXp,
        } : null)

        console.log(`✨ ${reason}: +${amount}XP 획득! 현재 레벨: ${result.data.level}`)

        // 레벨업 체크 및 상태 업데이트
        if (result.data.leveledUp) {
          setLevelUpInfo({ isLevelUp: true, newLevel: result.data.level })
        }
      } else {
        console.error('경험치 추가 실패:', result.error)
      }
    } catch (error) {
      console.error('경험치 추가 중 오류:', error)
    }
  }

  /**
   * 출석체크를 처리하는 함수
   * API를 통해 MongoDB에 저장하고 UI를 업데이트합니다.
   */
  const checkAttendance = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/user/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트
        setUser(prev => prev ? {
          ...prev,
          consecutiveAttendance: result.data.consecutiveAttendance,
          level: result.data.level,
          currentXp: result.data.currentXp,
          totalXp: result.data.totalXp,
        } : null)

        alert(result.message)
        console.log(`📅 출석체크 완료! 연속 ${result.data.consecutiveAttendance}일`)

        // 레벨업 체크 및 상태 업데이트
        if (result.data.leveledUp) {
          setLevelUpInfo({ isLevelUp: true, newLevel: result.data.level })
        }
      } else {
        alert(result.error)
        console.error('출석체크 실패:', result.error)
      }
    } catch (error) {
      console.error('출석체크 중 오류:', error)
      alert('출석체크 중 오류가 발생했습니다.')
    }
  }

  /**
   * 게임 승리를 처리하는 함수
   * API를 통해 MongoDB에 저장하고 UI를 업데이트합니다.
   */
  const addGameWin = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/user/game-win', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트
        setUser(prev => prev ? {
          ...prev,
          gameWins: result.data.gameWins,
          consecutiveWins: result.data.consecutiveWins,
          level: result.data.level,
          currentXp: result.data.currentXp,
          totalXp: result.data.totalXp,
        } : null)

        console.log(`🏆 게임 승리! 총 ${result.data.gameWins}승, 연승 ${result.data.consecutiveWins}`)

        // 레벨업 체크 및 상태 업데이트
        if (result.data.leveledUp) {
          setLevelUpInfo({ isLevelUp: true, newLevel: result.data.level })
        }
      } else {
        console.error('게임 승리 처리 실패:', result.error)
      }
    } catch (error) {
      console.error('게임 승리 처리 중 오류:', error)
    }
  }

  /**
   * 연승 기록을 초기화하는 함수 (게임 패배 시 호출)
   * API를 통해 MongoDB에 저장하고 UI를 업데이트합니다.
   */
  const resetWinStreak = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/user/reset-win-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트
        setUser(prev => prev ? {
          ...prev,
          consecutiveWins: 0,
        } : null)

        console.log('🔄 연승이 초기화되었습니다.')
      } else {
        console.error('연승 초기화 실패:', result.error)
      }
    } catch (error) {
      console.error('연승 초기화 중 오류:', error)
    }
  }

  /**
   * 테마 설정을 업데이트하는 함수
   * API를 통해 MongoDB에 저장하고 UI를 업데이트합니다.
   * @param thema - 새로운 테마 설정 ('light' 또는 'dark')
   */
  const updateThema = async (thema: 'light' | 'dark') => {
    if (!user) return

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thema }),
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트
        setUser(prev => prev ? {
          ...prev,
          thema: thema,
        } : null)

        console.log(`🎨 테마 변경: ${thema}`)
      } else {
        console.error('테마 업데이트 실패:', result.error)
      }
    } catch (error) {
      console.error('테마 업데이트 중 오류:', error)
    }
  }

  /**
   * 현재 레벨에서 레벨업까지 필요한 XP를 계산하는 함수
   * @returns 현재 레벨에서 레벨업에 필요한 경험치
   */
  const getRequiredXpForNextLevelValue = () => {
    if (!user || user.level >= 500) return 0
    return getRequiredXpForLevel(user.level)
  }

  // Context Provider로 값들을 제공합니다
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        addXp,
        checkAttendance,
        addGameWin,
        resetWinStreak,
        getRequiredXpForNextLevel: getRequiredXpForNextLevelValue,
        updateThema,
        // 레벨업 관련
        levelUpInfo,
        clearLevelUp,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

/**
 * UserContext를 사용하기 위한 커스텀 훅
 * 컴포넌트에서 사용자 정보와 관련 함수들에 접근할 수 있습니다.
 */
export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser는 UserProvider 내부에서만 사용할 수 있습니다.")
  }
  return context
}
