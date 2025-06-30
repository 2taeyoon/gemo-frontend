"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { decomposeKorean, checkGuess } from "@/utils/korean"
// import LevelBar from "@/components/LevelBar"

// 한글 단어 데이터 타입 정의
interface WordData {
  easy: { word: string }[]
}

// 영어 키보드를 한글 자모로 매핑하는 객체
// 예: 'q' 키를 누르면 'ㅂ'이 입력됩니다
const keyboardMapping: { [key: string]: string } = {
  // 기본 자음 매핑
  q: "ㅂ", w: "ㅈ", e: "ㄷ", r: "ㄱ", t: "ㅅ",
  a: "ㅁ", s: "ㄴ", d: "ㅇ", f: "ㄹ", g: "ㅎ",
  z: "ㅋ", x: "ㅌ", c: "ㅊ", v: "ㅍ",
  // 기본 모음 매핑
  y: "ㅛ", u: "ㅕ", i: "ㅑ", o: "ㅐ", p: "ㅔ",
  h: "ㅗ", j: "ㅓ", k: "ㅏ", l: "ㅣ",
  b: "ㅠ", n: "ㅜ", m: "ㅡ",
}

export default function KodlePage() {
  // 사용자 컨텍스트에서 사용자 정보와 관련 함수들을 가져옵니다
  const { user, addGameWin, resetWinStreak } = useUser();

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
      // 한글 단어 목록을 불러옵니다
      const response = await fetch("/korean-words.json");
      const data: WordData = await response.json();

      // 랜덤하게 단어를 선택합니다
      const randomWordData = data.easy[Math.floor(Math.random() * data.easy.length)];
      const randomWord = randomWordData.word;

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

  // 화면에 표시할 키보드 레이아웃
  const keyboardRows = [
    ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ"],
    ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
    ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "ㅐ", "ㅔ"],
    ["입력", "삭제"],
  ];

  // 키 입력을 처리하는 함수
  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === "삭제") {
      // 백스페이스: 이전 글자 삭제
      if (currentCol > 0) {
        const newGrid = [...grid];
        newGrid[currentRow][currentCol - 1] = "";
        setGrid(newGrid);
        setCurrentCol(currentCol - 1);
      }
    } else if (key === "입력") {
      // 엔터: 현재 행의 답안 제출
      if (currentCol === targetJamo.length) {
        submitGuess();
      } else {
        setMessage("모든 칸을 채워주세요!");
        // 2초 후 메시지 제거
        setTimeout(() => setMessage(""), 2000);
      }
    } else {
      // 일반 글자 입력
      if (currentCol < targetJamo.length) {
        const newGrid = [...grid];
        newGrid[currentRow][currentCol] = key;
        setGrid(newGrid);
        setCurrentCol(currentCol + 1);
      }
    }
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

      // 로그인한 사용자에게 XP 추가
      if (user) {
        addGameWin();
      }
    } else if (currentRow === 5) {
      // 6번째 시도까지 실패한 경우
      setGameOver(true);
      setMessage(`게임 종료! 정답은 "${targetWord}"였습니다.`);

      // 게임 실패 시 연승 초기화
      if (user) {
        resetWinStreak();
      }
    } else {
      // 다음 행으로 이동
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
    }
  };

  // 셀의 CSS 클래스를 결정하는 함수
  const getCellClass = (state: string, hasContent: boolean) => {
    const className = "cell";

    if (!hasContent) {
      return `${className} cellEmpty`;
    }

    switch (state) {
      case "correct":
        return `${className} cellCorrect`;
      case "present":
        return `${className} cellPresent`;
      case "absent":
        return `${className} cellAbsent`;
      default:
        return `${className} cellFilled`;
    }
  };

  // 키보드 키의 CSS 클래스를 결정하는 함수
  const getKeyClass = (key: string) => {
    const state = keyStates[key];
    const className = "key";

    switch (state) {
      case "correct":
        return `${className} keyCorrect`;
      case "present":
        return `${className} keyPresent`;
      case "absent":
        return `${className} keyAbsent`;
      default:
        return `${className} keyDefault`;
    }
  };

  // 로딩 중일 때 표시할 화면
  if (!targetJamo.length) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="container">
      {/* 헤더 영역 */}
      {/* <header className={styles.header}>
        <h1 className={styles.title}>Kodle - 한국어 워들 게임</h1>
        <div className={styles.headerControls}>
          사용자 정보 표시
          {user && (
            <>
              <span className={styles.userGreeting}>
                {user.name}님 반갑습니다!
              </span>
              <LevelBar size="small" />
              <Link href="/attendance" className={styles.iconButton} title="출석체크">
							<Calendar size={20} />
						</Link>
            </>
          )}

          기타 버튼들
          <Link href="/login" className={styles.iconButton} title="로그인">
					<User size={20} />
				</Link>
				<Settings size={24} className={styles.icon} />
				<HelpCircle size={24} className={styles.icon} />
				<BarChart3 size={24} className={styles.icon} />
        </div>
      </header> */}

      {/* 메시지 표시 영역 */}
      {/* {message && <div className={styles.message}>{message}</div>} */}

      {/* 게임 그리드 */}
      <div
        className="gameGrid"
        style={{
          gridTemplateColumns: `repeat(${targetJamo.length}, 1fr)`,
        }}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(
                cellStates[rowIndex][colIndex],
                cell !== "",
              )}>
              {cell}
            </div>
          )),
        )}
      </div>

      {/* 키보드 가이드 */}
      <div className="guide">
        <div className="guideTitle">🎯 키보드 색상 가이드</div>
        <div className="guideItems">
          <div className="guideItem">
            <div
              className={`guideColor guideCorrect`}></div>
            <span>정확한 위치 확정</span>
          </div>
          <div className="guideItem">
            <div
              className={`guideColor guidePresent`}></div>
            <span>포함되지만 위치 미확정</span>
          </div>
          <div className="guideItem">
            <div className={`guideColor guideAbsent`}></div>
            <span>포함되지 않음</span>
          </div>
          <div className="guideItem">
            <div className={`guideColor guideUnused`}></div>
            <span>미사용</span>
          </div>
        </div>
      </div>

      {/* 키보드 입력 도움말 */}
      <div className="keyboardHelp">
        <div className="guideTitle">⌨️ 키보드 입력 가능!</div>
        <div className="helpContent">
          <div>
            <strong>자음:</strong> Q(ㅂ) W(ㅈ) E(ㄷ) R(ㄱ) T(ㅅ) A(ㅁ) S(ㄴ)
            D(ㅇ) F(ㄹ) G(ㅎ) Z(ㅋ) X(ㅌ) C(ㅊ) V(ㅍ)
          </div>
          <div>
            <strong>모음:</strong> Y(ㅛ) U(ㅕ) I(ㅑ) O(ㅐ) P(ㅔ) H(ㅗ) J(ㅓ)
            K(ㅏ) L(ㅣ) B(ㅠ) N(ㅜ) M(ㅡ)
          </div>
          <div>
            <strong>복합 입력:</strong> ㅢ = ㅡ+ㅣ, ㄲ = ㄱ+ㄱ, ㅝ = ㅜ+ㅓ 등
          </div>
          <div>
            <strong>조작:</strong> Enter(입력) Backspace(삭제)
          </div>
        </div>
      </div>

      {/* 화면 키보드 */}
      <div className="keyboard">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboardRow">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={gameOver}
                className={
                  key === "입력" || key === "삭제"
                    ? `key keySpecial`
                    : getKeyClass(key)
                }>
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* 새 게임 버튼 */}
      {gameOver && (
        <button onClick={initializeGame} className="newGameButton">
          새 게임
        </button>
      )}
    </div>
  );
}