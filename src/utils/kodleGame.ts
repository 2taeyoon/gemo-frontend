// Kodle 게임 관련 유틸리티 함수들

// 한글 단어 데이터 타입 정의
export interface WordData {
  easy: { word: string, definition: string }[]
}

// 영어 키보드를 한글 자모로 매핑하는 객체
export const keyboardMapping: { [key: string]: string } = {
  // 기본 자음 매핑
  q: "ㅂ", w: "ㅈ", e: "ㄷ", r: "ㄱ", t: "ㅅ",
  a: "ㅁ", s: "ㄴ", d: "ㅇ", f: "ㄹ", g: "ㅎ",
  z: "ㅋ", x: "ㅌ", c: "ㅊ", v: "ㅍ",
  // 기본 모음 매핑
  y: "ㅛ", u: "ㅕ", i: "ㅑ", o: "ㅐ", p: "ㅔ",
  h: "ㅗ", j: "ㅓ", k: "ㅏ", l: "ㅣ",
  b: "ㅠ", n: "ㅜ", m: "ㅡ",
};

// 화면에 표시할 키보드 레이아웃
export const keyboardRows = [
  ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ"],
  ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
  ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "ㅐ", "ㅔ"],
  ["입력", "삭제"],
];

/**
 * 게임을 초기화하는 함수
 */
export const initializeGame = async () => {
  try {
    // 한글 단어 목록을 불러옵니다
    const response = await fetch("/2word_easy.json");
    const data: WordData = await response.json();

    // 랜덤하게 단어를 선택합니다
    const randomWordData = data.easy[Math.floor(Math.random() * data.easy.length)];
    const randomWord = randomWordData.word;

    return { randomWord, data };
  } catch (error) {
    console.error("단어 로딩 실패:", error);
    throw new Error("게임 로딩에 실패했습니다. 새로고침해주세요.");
  }
};

/**
 * 키 입력을 처리하는 함수
 */
export const handleKeyPress = (
  key: string,
  gameOver: boolean,
  currentRow: number,
  currentCol: number,
  targetJamoLength: number,
  grid: string[][],
  setGrid: (grid: string[][]) => void,
  setCurrentCol: (col: number) => void,
  submitGuess: () => void,
  setMessage: (message: string) => void
) => {
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
    if (currentCol === targetJamoLength) {
      submitGuess();
    } else {
      setMessage("모든 칸을 채워주세요!");
      // 2초 후 메시지 제거
      setTimeout(() => setMessage(""), 2000);
    }
  } else {
    // 일반 글자 입력
    if (currentCol < targetJamoLength) {
      const newGrid = [...grid];
      newGrid[currentRow][currentCol] = key;
      setGrid(newGrid);
      setCurrentCol(currentCol + 1);
    }
  }
};

/**
 * 셀의 CSS 클래스를 결정하는 함수
 */
export const getCellClass = (state: string, hasContent: boolean) => {
  const className = "cell";

  if (!hasContent) {
    return `${className} cellEmpty`;
  }

  switch (state) {
    case "correct":
      return `${className} cell_correct`;
    case "present":
      return `${className} cell_present`;
    case "absent":
      return `${className} cell_absent`;
    default:
      return `${className} cell_filled`;
  }
};

/**
 * 키보드 키의 CSS 클래스를 결정하는 함수
 */
export const getKeyClass = (key: string, keyStates: { [key: string]: "correct" | "present" | "absent" | "" }) => {
  const state = keyStates[key];
  const className = "key";

  switch (state) {
    case "correct":
      return `${className} key_correct`;
    case "present":
      return `${className} key_present`;
    case "absent":
      return `${className} key_absent`;
    default:
      return `${className} key_default`;
  }
}; 