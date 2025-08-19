// 영어 키보드를 한글 자모로 매핑하는 객체
// 예: 'q' 키를 누르면 'ㅂ'이 입력됩니다
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

// 한글 단어 데이터 타입 정의
export interface WordData {
  easy: { word: string, definition: string }[]
}

/**
 * 랜덤 단어를 선택하는 함수
 * @param wordData - 단어 데이터
 * @returns 선택된 단어 객체
 */
export function selectRandomWord(wordData: WordData): { word: string, definition: string } {
  const words = wordData.easy;
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

/**
 * 게임 그리드 초기화 함수
 * @param rows - 행 수
 * @param cols - 열 수
 * @returns 초기화된 그리드 배열
 */
export function initializeGrid(rows: number, cols: number): string[][] {
  return Array(rows).fill(null).map(() => Array(cols).fill(""));
}

/**
 * 셀 상태 초기화 함수
 * @param rows - 행 수
 * @param cols - 열 수
 * @returns 초기화된 셀 상태 배열
 */
export function initializeCellStates(rows: number, cols: number): ("correct" | "present" | "absent" | "")[][] {
  return Array(rows).fill(null).map(() => Array(cols).fill(""));
}

/**
 * 게임 승리 조건 확인 함수
 * @param guess - 추측한 자모 배열
 * @param target - 정답 자모 배열
 * @returns 승리 여부
 */
export function checkWinCondition(guess: string[], target: string[]): boolean {
  return guess.length === target.length && guess.every((char, index) => char === target[index]);
}
