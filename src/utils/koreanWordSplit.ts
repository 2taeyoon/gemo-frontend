// 한글 처리를 위한 유틸리티 함수들

/**
 * 한글 단어를 개별 자모로 완전히 분해하는 함수
 * 예: "안녕" → ["ㅇ", "ㅏ", "ㄴ", "ㄴ", "ㅕ", "ㅇ"]
 *
 * @param word - 분해할 한글 단어
 * @returns 자모로 분해된 배열
 */
export function decomposeKorean(word: string): string[] {
  // 한글 초성 배열 (19개)
  const CHO = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
    "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
  ]

  // 한글 중성 배열 (21개)
  const JUNG = [
    "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
    "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
  ]

  // 한글 종성 배열 (28개, 첫 번째는 빈 종성)
  const JONG = [
    "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
    "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
    "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
  ]

  /**
   * 복합 자모를 기본 자모로 분해하는 내부 함수
   * 예: "ㄲ" → ["ㄱ", "ㄱ"], "ㅘ" → ["ㅗ", "ㅏ"]
   */
  const decomposeJamo = (jamo: string): string[] => {
    const decompositionMap: { [key: string]: string[] } = {
      // 쌍자음 분해
      ㄲ: ["ㄱ", "ㄱ"], ㄸ: ["ㄷ", "ㄷ"], ㅃ: ["ㅂ", "ㅂ"], 
      ㅆ: ["ㅅ", "ㅅ"], ㅉ: ["ㅈ", "ㅈ"],
      // 복합 자음 분해
      ㄳ: ["ㄱ", "ㅅ"], ㄵ: ["ㄴ", "ㅈ"], ㄶ: ["ㄴ", "ㅎ"], 
      ㄺ: ["ㄹ", "ㄱ"], ㄻ: ["ㄹ", "ㅁ"], ㄼ: ["ㄹ", "ㅂ"], 
      ㄽ: ["ㄹ", "ㅅ"], ㄾ: ["ㄹ", "ㅌ"], ㄿ: ["ㄹ", "ㅍ"], 
      ㅀ: ["ㄹ", "ㅎ"], ㅄ: ["ㅂ", "ㅅ"],
      // 복합 모음 분해
      ㅘ: ["ㅗ", "ㅏ"], ㅙ: ["ㅗ", "ㅐ"], ㅚ: ["ㅗ", "ㅣ"], 
      ㅝ: ["ㅜ", "ㅓ"], ㅞ: ["ㅜ", "ㅔ"], ㅟ: ["ㅜ", "ㅣ"], 
      ㅢ: ["ㅡ", "ㅣ"],
    }

    // 분해 가능한 자모면 분해된 배열을, 아니면 원래 자모를 배열로 반환
    return decompositionMap[jamo] || [jamo]
  }

  const result: string[] = []

  // 단어의 각 글자를 처리
  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const code = char.charCodeAt(0)

    // 한글 완성형 글자인지 확인 (가-힣 범위)
    if (code >= 0xac00 && code <= 0xd7a3) {
      // 유니코드에서 한글 분해 공식
      const temp = code - 0xac00
      const jong = temp % 28 // 종성 인덱스
      const jung = ((temp - jong) / 28) % 21 // 중성 인덱스
      const cho = ((temp - jong) / 28 - jung) / 21 // 초성 인덱스

      // 초성 분해 후 추가
      const choJamo = CHO[cho]
      result.push(...decomposeJamo(choJamo))

      // 중성 분해 후 추가
      const jungJamo = JUNG[jung]
      result.push(...decomposeJamo(jungJamo))

      // 종성이 있는 경우에만 분해 후 추가
      if (jong !== 0) {
        const jongJamo = JONG[jong]
        result.push(...decomposeJamo(jongJamo))
      }
    } else {
      // 한글이 아닌 문자는 그대로 추가
      result.push(char)
    }
  }

  return result
}

/**
 * 사용자의 추측과 정답을 비교하여 각 위치의 결과를 반환하는 함수
 *
 * @param guess - 사용자가 입력한 추측 배열
 * @param answer - 정답 배열
 * @returns 각 위치별 결과 배열 ("correct" | "present" | "absent")
 */
export function checkGuess(guess: string[], answer: string[]): ("correct" | "present" | "absent")[] {
  const result: ("correct" | "present" | "absent")[] = []
  const answerCopy = [...answer] // 정답 배열 복사본 (중복 처리용)

  // 1단계: 정확한 위치의 글자들을 먼저 체크
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct" // 정확한 위치
      answerCopy[i] = "" // 사용된 글자는 빈 문자열로 표시
    }
  }

  // 2단계: 나머지 위치들에 대해 포함 여부 체크
  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== "correct") {
      // 이미 정답 처리된 위치는 건너뜀
      const foundIndex = answerCopy.indexOf(guess[i])

      if (foundIndex !== -1) {
        result[i] = "present" // 단어에 포함되지만 위치가 틀림
        answerCopy[foundIndex] = "" // 사용된 글자 제거
      } else {
        result[i] = "absent" // 단어에 포함되지 않음
      }
    }
  }

  return result
}

/**
 * 한글 자모가 유효한지 확인하는 함수
 *
 * @param char - 확인할 문자
 * @returns 유효한 한글 자모인지 여부
 */
export function isValidKoreanJamo(char: string): boolean {
  // 한글 자음과 모음 범위 확인
  return /[ㄱ-ㅎㅏ-ㅣ]/.test(char)
}

/**
 * 문자열이 모두 한글인지 확인하는 함수
 *
 * @param str - 확인할 문자열
 * @returns 모두 한글인지 여부
 */
export function isAllKorean(str: string): boolean {
  // 한글 완성형 문자 범위 확인
  return /^[가-힣]+$/.test(str)
}
