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
  // 코들 게임 관련 통계 (새로운 구조)
  kodleGameWins: number // 코들 게임 승리 횟수 (기존 gameWins 대체)
  kodleGameDefeat: number // 코들 게임 패배 횟수 (새로 추가)
  kodleSuccessiveVictory: number // 코들 게임 연속 승리 횟수 (기존 consecutiveWins 대체)
  kodleMaximumSuccessiveVictory: number // 코들 게임 최대 연속 승리 기록 (새로 추가)
  // 하위 호환성을 위한 필드들 (기존 코드에서 사용 중)
  gameWins: number // kodleGameWins와 동일한 값
  consecutiveWins: number // kodleSuccessiveVictory와 동일한 값
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
  // 코들 게임 관련 함수들 (새로운 구조)
  addKodleGameWin: () => Promise<void> // 코들 게임 승리 처리
  addKodleGameDefeat: () => Promise<void> // 코들 게임 패배 처리
  // 하위 호환성을 위한 기존 함수들 (기존 코드에서 사용 중)
  addGameWin: () => Promise<void> // 코들 게임 승리 처리 (addKodleGameWin과 동일)
  resetWinStreak: () => Promise<void> // 연승 초기화 (코들 게임 패배 시 사용)
  // 기타 함수들
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
          // 새로운 코들 게임 통계 필드들
          kodleGameWins: profile.gameData?.kodleGameWins || profile.gameData?.gameWins || 0,
          kodleGameDefeat: profile.gameData?.kodleGameDefeat || 0,
          kodleSuccessiveVictory: profile.gameData?.kodleSuccessiveVictory || profile.gameData?.consecutiveWins || 0,
          kodleMaximumSuccessiveVictory: profile.gameData?.kodleMaximumSuccessiveVictory || 0,
          // 하위 호환성을 위한 필드들 (기존 코드에서 사용하는 곳들을 위해 유지)
          gameWins: profile.gameData?.kodleGameWins || profile.gameData?.gameWins || 0,
          consecutiveWins: profile.gameData?.kodleSuccessiveVictory || profile.gameData?.consecutiveWins || 0,
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

        // alert 제거 - 사용자 경험 개선을 위해 콘솔 로그만 출력
        console.log(`📅 출석체크 완료! 연속 ${result.data.consecutiveAttendance}일, ${result.data.xpGained}XP 획득`)

        // 레벨업 체크 및 상태 업데이트
        if (result.data.leveledUp) {
          setLevelUpInfo({ isLevelUp: true, newLevel: result.data.level })
        }
      } else {
        // 오류 발생 시에만 alert 표시
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
   * 코들 게임 승리를 처리하는 함수 (새로운 구조)
   * 연속 승리 기록도 관리하고 최대 연속 승리 기록을 업데이트합니다.
   */
  const addKodleGameWin = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/kodle-game-win`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트 (새로운 구조 반영)
        setUser(prev => prev ? {
          ...prev,
          kodleGameWins: result.data.kodleGameWins,
          kodleSuccessiveVictory: result.data.kodleSuccessiveVictory,
          kodleMaximumSuccessiveVictory: result.data.kodleMaximumSuccessiveVictory,
          // 하위 호환성을 위한 기존 필드들도 업데이트
          gameWins: result.data.kodleGameWins,
          consecutiveWins: result.data.kodleSuccessiveVictory,
        } : null)

        console.log(`🏆 코들 게임 승리! 총 ${result.data.kodleGameWins}승, 연승 ${result.data.kodleSuccessiveVictory}, 최고 연승 ${result.data.kodleMaximumSuccessiveVictory}`)

        // 레벨업 체크 및 상태 업데이트
        if (result.data.leveledUp) {
          setLevelUpInfo({ isLevelUp: true, newLevel: result.data.level })
        }
      } else {
        console.error('코들 게임 승리 처리 실패:', result.error)
      }
    } catch (error) {
      console.error('코들 게임 승리 처리 중 오류:', error)
    }
  }

  /**
   * 코들 게임 패배를 처리하는 함수 (새로운 기능)
   * 패배 횟수를 증가시키고 연속 승리 기록을 초기화합니다.
   */
  const addKodleGameDefeat = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/kodle-game-defeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        // 로컬 상태 업데이트 (새로운 구조 반영)
        setUser(prev => prev ? {
          ...prev,
          kodleGameDefeat: result.data.kodleGameDefeat,
          kodleGameWins: result.data.kodleGameWins, // 승리 횟수 유지
          kodleSuccessiveVictory: result.data.kodleSuccessiveVictory, // 연속 승리 초기화 (0)
          kodleMaximumSuccessiveVictory: result.data.kodleMaximumSuccessiveVictory, // 최대 연속 승리 유지
          // 하위 호환성을 위한 기존 필드들도 업데이트
          gameWins: result.data.kodleGameWins,
          consecutiveWins: result.data.kodleSuccessiveVictory,
        } : null)

        console.log(`💔 코들 게임 패배! 총 승리 ${result.data.kodleGameWins}회, 총 패배 ${result.data.kodleGameDefeat}회, 연속 승리 초기화`)

        // 레벨업 체크 및 상태 업데이트 (패배 시에도 20XP를 받으므로)
        if (result.data.leveledUp) {
          setLevelUpInfo({ isLevelUp: true, newLevel: result.data.level })
        }
      } else {
        console.error('코들 게임 패배 처리 실패:', result.error)
      }
    } catch (error) {
      console.error('코들 게임 패배 처리 중 오류:', error)
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
        // 새로운 코들 게임 관련 함수들
        addKodleGameWin,
        addKodleGameDefeat,
        // 하위 호환성을 위한 기존 함수들
        addGameWin, // addKodleGameWin과 동일하게 동작하도록 기존 코드에서 사용
        resetWinStreak, // addKodleGameDefeat과 유사하게 연승 초기화
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
