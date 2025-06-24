"use client"

import { useState, useEffect } from "react"
import { User, Settings, HelpCircle, BarChart3, Moon, Sun, Calendar } from "lucide-react"
import { decomposeKorean, checkGuess } from "@/utils/korean"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import LevelBar from "@/components/kordle/LevelBar"

interface WordData {
  words: string[]
}

// 기본 자모만 포함한 키보드 매핑
const keyboardMapping: { [key: string]: string } = {
  // 기본 자음
  q: "ㅂ",
  w: "ㅈ",
  e: "ㄷ",
  r: "ㄱ",
  t: "ㅅ",
  a: "ㅁ",
  s: "ㄴ",
  d: "ㅇ",
  f: "ㄹ",
  g: "ㅎ",
  z: "ㅋ",
  x: "ㅌ",
  c: "ㅊ",
  v: "ㅍ",

  // 기본 모음
  y: "ㅛ",
  u: "ㅕ",
  i: "ㅑ",
  o: "ㅐ",
  p: "ㅔ",
  h: "ㅗ",
  j: "ㅓ",
  k: "ㅏ",
  l: "ㅣ",
  b: "ㅠ",
  n: "ㅜ",
  m: "ㅡ",
}

export default function KoreanWordle() {
  const { user, addGameWin, resetWinStreak } = useUser()
  const [targetWord, setTargetWord] = useState<string>("")
  const [targetJamo, setTargetJamo] = useState<string[]>([])
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  // 게임 그리드 - 동적 크기
  const [grid, setGrid] = useState<string[][]>([])
  const [cellStates, setCellStates] = useState<("correct" | "present" | "absent" | "")[][]>([])

  // 키보드 상태 - 우선순위 기반 단순화
  const [keyStates, setKeyStates] = useState<{
    [key: string]: "correct" | "present" | "absent" | ""
  }>({})

  // 다크모드 초기화 및 localStorage 연동
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // 다크모드 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  // 게임 초기화
  useEffect(() => {
    initializeGame()
  }, [])

  // 키보드 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver) return

      const key = event.key

      // 백스페이스
      if (key === "Backspace") {
        event.preventDefault()
        handleKeyPress("삭제")
        return
      }

      // 엔터
      if (key === "Enter") {
        event.preventDefault()
        handleKeyPress("입력")
        return
      }

      // 한글 자모 매핑
      const mappedKey = keyboardMapping[key]
      if (mappedKey) {
        event.preventDefault()
        handleKeyPress(mappedKey)
        return
      }

      // 직접 한글 자모 입력 (복사-붙여넣기 등)
      if (key.length === 1 && /[ㄱ-ㅎㅏ-ㅣ]/.test(key)) {
        event.preventDefault()
        handleKeyPress(key)
        return
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown)

    // 클린업
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameOver, currentRow, currentCol, targetJamo.length])

  const initializeGame = async () => {
    try {
      const response = await fetch("/korean-words.json")
      const data: WordData = await response.json()
      const randomWord = data.words[Math.floor(Math.random() * data.words.length)]
      const decomposed = decomposeKorean(randomWord)

      setTargetWord(randomWord)
      setTargetJamo(decomposed)

      // 그리드 초기화 (가로: 자모 길이, 세로: 6)
      const newGrid = Array(6)
        .fill(null)
        .map(() => Array(decomposed.length).fill(""))
      const newCellStates = Array(6)
        .fill(null)
        .map(() => Array(decomposed.length).fill(""))

      setGrid(newGrid)
      setCellStates(newCellStates)
      setCurrentRow(0)
      setCurrentCol(0)
      setGameOver(false)
      setWon(false)
      setMessage(`정답: ${randomWord} (${decomposed.join(" ")})`) // 개발용 - 나중에 제거
      setKeyStates({})
    } catch (error) {
      console.error("Failed to load words:", error)
    }
  }

  // 기본 자모만 포함한 키보드 레이아웃
  const keyboardRows = [
    ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ"],
    ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
    ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "ㅐ", "ㅔ"],
    ["입력", "삭제"],
  ]

  const handleKeyPress = (key: string) => {
    if (gameOver) return

    if (key === "삭제") {
      if (currentCol > 0) {
        const newGrid = [...grid]
        newGrid[currentRow][currentCol - 1] = ""
        setGrid(newGrid)
        setCurrentCol(currentCol - 1)
      }
    } else if (key === "입력") {
      if (currentCol === targetJamo.length) {
        submitGuess()
      } else {
        setMessage("모든 칸을 채워주세요!")
        setTimeout(() => setMessage(""), 2000)
      }
    } else {
      if (currentCol < targetJamo.length) {
        const newGrid = [...grid]
        newGrid[currentRow][currentCol] = key
        setGrid(newGrid)
        setCurrentCol(currentCol + 1)
      }
    }
  }

  const submitGuess = () => {
    const guess = grid[currentRow]
    const result = checkGuess(guess, targetJamo)

    // 셀 상태 업데이트
    const newCellStates = [...cellStates]
    newCellStates[currentRow] = result
    setCellStates(newCellStates)

    // 키보드 상태 업데이트 - 우선순위 기반 (correct > present > absent)
    const newKeyStates = { ...keyStates }
    guess.forEach((char, index) => {
      const currentState = newKeyStates[char] || ""
      const newState = result[index]

      // 우선순위: correct > present > absent
      // 한 번이라도 correct였다면 계속 correct 유지
      if (currentState === "correct") {
        // 이미 correct이면 변경하지 않음
        return
      } else if (newState === "correct") {
        // 새로 correct가 되면 correct로 설정
        newKeyStates[char] = "correct"
      } else if (currentState === "present") {
        // 이미 present이고 새로운 상태가 correct가 아니면 present 유지
        if (newState !== "absent") {
          // present 유지 (absent로 덮어쓰지 않음)
        } else {
          // present였는데 absent가 나왔다면... 이는 논리적으로 불가능하지만 present 유지
        }
      } else if (newState === "present" && currentState !== "absent") {
        // 새로 present가 되고 이전에 absent가 아니었다면 present로 설정
        newKeyStates[char] = "present"
      } else if (newState === "absent" && !currentState) {
        // 처음으로 absent가 되면 absent로 설정
        newKeyStates[char] = "absent"
      }
    })
    setKeyStates(newKeyStates)

    // 승리 체크
    if (result.every((state) => state === "correct")) {
      setWon(true)
      setGameOver(true)
      setMessage("축하합니다! 정답을 맞추셨습니다!")

      // 로그인한 사용자에게 XP 추가
      if (user) {
        addGameWin()
      }
    } else if (currentRow === 5) {
      setGameOver(true)
      setMessage(`게임 종료! 정답은 "${targetWord}"였습니다.`)

      // 게임 실패 시 연승 초기화
      if (user) {
        resetWinStreak()
      }
    } else {
      setCurrentRow(currentRow + 1)
      setCurrentCol(0)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const getCellClass = (state: string, hasContent: boolean) => {
    const baseClass = "w-12 h-12 border-2 flex items-center justify-center text-lg font-bold transition-colors"

    if (!hasContent) {
      return `${baseClass} ${
        darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-black"
      }`
    }

    switch (state) {
      case "correct":
        return `${baseClass} ${
          darkMode ? "bg-green-600 text-white border-green-600" : "bg-green-500 text-white border-green-500"
        }`
      case "present":
        return `${baseClass} ${
          darkMode ? "bg-yellow-600 text-white border-yellow-600" : "bg-yellow-500 text-white border-yellow-500"
        }`
      case "absent":
        return `${baseClass} ${
          darkMode ? "bg-gray-600 text-white border-gray-600" : "bg-gray-400 text-white border-gray-400"
        }`
      default:
        return `${baseClass} ${
          darkMode ? "bg-gray-700 border-gray-500 text-white" : "bg-gray-100 border-gray-400 text-black"
        }`
    }
  }

  const getKeyClass = (key: string) => {
    const state = keyStates[key]
    const baseClass = "px-2 py-2 rounded text-sm font-medium transition-colors min-w-[32px]"

    switch (state) {
      case "correct":
        return `${baseClass} ${darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"}`
      case "present":
        return `${baseClass} ${darkMode ? "bg-yellow-600 text-white" : "bg-yellow-500 text-white"}`
      case "absent":
        return `${baseClass} ${darkMode ? "bg-gray-600 text-white" : "bg-gray-400 text-white"}`
      default:
        return `${baseClass} ${
          darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-black hover:bg-gray-300"
        }`
    }
  }

  const getKeyTooltip = (key: string) => {
    const state = keyStates[key]
    switch (state) {
      case "correct":
        return "정확한 위치를 알고 있는 글자"
      case "present":
        return "단어에 포함되지만 정확한 위치를 모르는 글자"
      case "absent":
        return "단어에 포함되지 않는 글자"
      default:
        return "아직 사용하지 않은 글자"
    }
  }

  if (!targetJamo.length) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        로딩 중...
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 transition-colors ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">꼬들 - 한국어</h1>
        <div className="flex gap-2 items-center">
          {user && (
            <>
              <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {user.name}님 반갑습니다!
              </span>
              <LevelBar size="small" />
              <Link
                href="/attendance"
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                title="출석체크"
              >
                <Calendar className="w-5 h-5" />
              </Link>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? "bg-gray-800 hover:bg-gray-700 text-yellow-400" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
            title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link
            href="/login"
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? "bg-gray-800 hover:bg-gray-700 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
            title="로그인"
          >
            <User className="w-5 h-5" />
          </Link>
          <Settings className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
          <HelpCircle className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
          <BarChart3 className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
        </div>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-2 rounded transition-colors ${
            darkMode ? "bg-blue-900 text-blue-200 border border-blue-700" : "bg-blue-100 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Game Grid */}
      <div
        className="mb-8"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${targetJamo.length}, 1fr)`,
          gap: "4px",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className={getCellClass(cellStates[rowIndex][colIndex], cell !== "")}>
              {cell}
            </div>
          )),
        )}
      </div>

      {/* Keyboard Legend */}
      <div
        className={`mb-4 p-3 rounded-lg text-sm max-w-4xl transition-colors ${
          darkMode ? "bg-gray-800 text-gray-300 border border-gray-700" : "bg-gray-50 text-gray-600"
        }`}
      >
        <div className="font-semibold mb-2">🎯 키보드 색상 가이드</div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${darkMode ? "bg-green-600" : "bg-green-500"}`}></div>
            <span>정확한 위치 확정</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${darkMode ? "bg-yellow-600" : "bg-yellow-500"}`}></div>
            <span>포함되지만 위치 미확정</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${darkMode ? "bg-gray-600" : "bg-gray-400"}`}></div>
            <span>포함되지 않음</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded border ${
                darkMode ? "bg-gray-700 border-gray-500" : "bg-gray-200 border-gray-300"
              }`}
            ></div>
            <span>미사용</span>
          </div>
        </div>
      </div>

      {/* Keyboard Mapping Help */}
      <div
        className={`mb-4 p-3 rounded-lg text-sm max-w-4xl transition-colors ${
          darkMode ? "bg-gray-800 text-gray-300 border border-gray-700" : "bg-gray-50 text-gray-600"
        }`}
      >
        <div className="font-semibold mb-2">⌨️ 키보드 입력 가능!</div>
        <div className="space-y-1">
          <div>
            <strong>자음:</strong> Q(ㅂ) W(ㅈ) E(ㄷ) R(ㄱ) T(ㅅ) A(ㅁ) S(ㄴ) D(ㅇ) F(ㄹ) G(ㅎ) Z(ㅋ) X(ㅌ) C(ㅊ) V(ㅍ)
          </div>
          <div>
            <strong>모음:</strong> Y(ㅛ) U(ㅕ) I(ㅑ) O(ㅐ) P(ㅔ) H(ㅗ) J(ㅓ) K(ㅏ) L(ㅣ) B(ㅠ) N(ㅜ) M(ㅡ)
          </div>
          <div>
            <strong>복합 입력:</strong> ㅢ = ㅡ+ㅣ, ㄲ = ㄱ+ㄱ, ㅝ = ㅜ+ㅓ 등
          </div>
          <div>
            <strong>조작:</strong> Enter(입력) Backspace(삭제)
          </div>
        </div>
      </div>

      {/* Korean Keyboard */}
      <div className="w-full max-w-4xl space-y-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 flex-wrap">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={gameOver}
                title={getKeyTooltip(key)}
                className={
                  key === "입력" || key === "삭제"
                    ? `px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-300 hover:bg-gray-400 text-black"
                      }`
                    : `${getKeyClass(key)} disabled:opacity-50`
                }
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* New Game Button */}
      {gameOver && (
        <button
          onClick={initializeGame}
          className={`mt-4 px-6 py-2 rounded transition-colors ${
            darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          새 게임
        </button>
      )}
    </div>
  )
}
