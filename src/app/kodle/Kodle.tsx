"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { decomposeKorean, checkGuess } from "@/utils/koreanWordSplit"
import "@/styles/kodle/kodle.css"

// 유틸 함수들
import { 
  keyboardMapping, 
  initializeGame as initializeGameUtil,
  handleKeyPress as handleKeyPressUtil
} from "@/utils/kodleGame"

// 분리된 컴포넌트들
import UserInfo from "@/components/kodle/UserInfo"
import AnswerDisplay from "@/components/kodle/AnswerDisplay"
import GameGrid from "@/components/kodle/GameGrid"
import KeyboardGuide from "@/components/kodle/KeyboardGuide"
import KeyboardHelp from "@/components/kodle/KeyboardHelp"
import GameKeyboard from "@/components/kodle/GameKeyboard"

export default function KodlePage() {
  // 사용자 컨텍스트에서 사용자 정보와 관련 함수들을 가져옵니다
  // 새로운 코들 게임 전용 함수들을 사용합니다
  const { user, addKodleGameWin, addKodleGameDefeat } = useUser();
  
  // 🔍 Kodle 컴포넌트에서 사용자 정보 디버깅
  console.log('🔍 Kodle 컴포넌트 사용자 정보:', {
    user: user,
    hasUser: !!user,
    userId: user?.id,
    userName: user?.name,
  });

  // 게임 상태 관리를 위한 state들
  const [targetWord, setTargetWord] = useState<string>(""); // 정답 단어
  const [targetJamo, setTargetJamo] = useState<string[]>([]); // 정답 단어를 자모로 분해한 배열
  const [currentRow, setCurrentRow] = useState(0); // 현재 입력 중인 행
  const [currentCol, setCurrentCol] = useState(0); // 현재 입력 중인 열
  const [gameOver, setGameOver] = useState(false); // 게임 종료 여부
  const [won, setWon] = useState(false); // 게임 승리 여부
  const [message, setMessage] = useState(""); // 사용자에게 보여줄 메시지
  

  // 게임 그리드 - 사용자가 입력한 글자들을 저장
  const [grid, setGrid] = useState<string[][]>([]);
  // 각 셀의 상태 - 정답(correct), 포함(present), 없음(absent)
  const [cellStates, setCellStates] = useState<
    ("correct" | "present" | "absent" | "")[][]
  >([]);

  // 키보드 각 키의 상태를 저장 (어떤 키가 정답인지, 포함되는지 등)
  const [keyStates, setKeyStates] = useState<{
    [key: string]: "correct" | "present" | "absent" | "";
  }>({});

  // 컴포넌트가 처음 렌더링될 때 게임을 초기화합니다
  useEffect(() => {
    initializeGame();
  }, []);

  // 키보드 이벤트를 처리하는 useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 게임이 끝났으면 키 입력을 무시합니다
      if (gameOver) return;

      const key = event.key;

      // 백스페이스 키 처리
      if (key === "Backspace") {
        event.preventDefault();
        handleKeyPress("삭제");
        return;
      }

      // 엔터 키 처리
      if (key === "Enter") {
        event.preventDefault();
        handleKeyPress("입력");
        return;
      }

      // 영어 키를 한글 자모로 변환
      const mappedKey = keyboardMapping[key];
      if (mappedKey) {
        event.preventDefault();
        handleKeyPress(mappedKey);
        return;
      }

      // 직접 한글 자모 입력 (복사-붙여넣기 등)
      if (key.length === 1 && /[ㄱ-ㅎㅏ-ㅣ]/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
        return;
      }
    };

    // 키보드 이벤트 리스너를 등록합니다
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, currentRow, currentCol, targetJamo.length]);

  // 게임을 초기화하는 함수
  const initializeGame = async () => {
    try {
      const { randomWord } = await initializeGameUtil();

      // 선택된 단어를 자모로 분해합니다
      const decomposed = decomposeKorean(randomWord);

      // 게임 상태를 초기화합니다
      setTargetWord(randomWord);
      setTargetJamo(decomposed);

      // 게임 그리드를 초기화합니다 (6행 x 자모길이 열)
      const newGrid = Array(6)
        .fill(null)
        .map(() => Array(decomposed.length).fill(""));

      // 셀 상태 배열을 초기화합니다
      const newCellStates = Array(6)
        .fill(null)
        .map(() => Array(decomposed.length).fill(""));

      setGrid(newGrid);
      setCellStates(newCellStates);
      setCurrentRow(0);
      setCurrentCol(0);
      setGameOver(false);
      setWon(false);
      setMessage(`정답: ${randomWord} (${decomposed.join(" ")})`); // 개발용 - 나중에 제거
      setKeyStates({});
    } catch (error) {
      console.error("단어 로딩 실패:", error);
      setMessage("게임 로딩에 실패했습니다. 새로고침해주세요.");
    }
  };

  // 키 입력을 처리하는 함수
  const handleKeyPress = (key: string) => {
    handleKeyPressUtil(
      key,
      gameOver,
      currentRow,
      currentCol,
      targetJamo.length,
      grid,
      setGrid,
      setCurrentCol,
      submitGuess,
      setMessage
    );
  };

  // 사용자의 추측을 제출하고 결과를 확인하는 함수
  const submitGuess = () => {
    const guess = grid[currentRow]; // 현재 행의 추측
    const result = checkGuess(guess, targetJamo); // 추측 결과 확인

    // 셀 상태 업데이트
    const newCellStates = [...cellStates];
    newCellStates[currentRow] = result;
    setCellStates(newCellStates);

    // 키보드 상태 업데이트 (우선순위: correct > present > absent)
    const newKeyStates = { ...keyStates };
    guess.forEach((char, index) => {
      const currentState = newKeyStates[char] || "";
      const newState = result[index];

      // 이미 correct인 키는 그대로 유지
      if (currentState === "correct") {
        return;
      } else if (newState === "correct") {
        newKeyStates[char] = "correct";
      } else if (currentState === "present") {
        // present 상태 유지 (absent로 덮어쓰지 않음)
      } else if (newState === "present" && currentState !== "absent") {
        newKeyStates[char] = "present";
      } else if (newState === "absent" && !currentState) {
        newKeyStates[char] = "absent";
      }
    });
    setKeyStates(newKeyStates);

    // 승리 조건 확인
    if (result.every((state) => state === "correct")) {
      setWon(true);
      setGameOver(true);
      setMessage("축하합니다! 정답을 맞추셨습니다!");

      // 로그인한 사용자의 코들 게임 승리 처리 (경험치 지급 + 통계 업데이트)
      if (user) {
        addKodleGameWin(); // 새로운 코들 게임 승리 함수 사용
      }
    } else if (currentRow === 5) {
      // 6번째 시도까지 실패한 경우
      setGameOver(true);
      setMessage(`게임 종료! 정답은 "${targetWord}"였습니다.`);

      // 로그인한 사용자의 코들 게임 패배 처리 (패배 통계 업데이트 + 연승 초기화)
      if (user) {
        addKodleGameDefeat(); // 새로운 코들 게임 패배 함수 사용
      }
    } else {
      // 다음 행으로 이동
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
    }
  };

  // 로딩 중일 때 표시할 화면
  if (!targetJamo.length) {
    return <div className="loading">로딩 중...</div>;
  }

  console.log("session.user", user);

  return (
    <div className="container">
      <UserInfo user={user} />

      {/* 테스트용 정답 표시 */}
      <AnswerDisplay targetWord={targetWord} targetJamo={targetJamo} />
      
      {/* 게임 그리드 */}
      <GameGrid 
        grid={grid} 
        cellStates={cellStates} 
        targetJamoLength={targetJamo.length} 
      />

      {/* 키보드 가이드 */}
      <KeyboardGuide />

      {/* 키보드 입력 도움말 */}
      <KeyboardHelp />

      {/* 화면 키보드 */}
      <GameKeyboard 
        keyStates={keyStates}
        gameOver={gameOver}
        onKeyPress={handleKeyPress}
      />

      {/* 새 게임 버튼 */}
      {gameOver && (
        <button onClick={initializeGame} className="new_game_button">
          새 게임
        </button>
      )}
    </div>
  );
}