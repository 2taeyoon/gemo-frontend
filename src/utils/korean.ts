// 한글 자모 분해 함수 - 복합 자모를 기본 자모로 완전 분해
export function decomposeKorean(word: string): string[] {
  const CHO = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ]

  const JUNG = [
    "ㅏ",
    "ㅐ",
    "ㅑ",
    "ㅒ",
    "ㅓ",
    "ㅔ",
    "ㅕ",
    "ㅖ",
    "ㅗ",
    "ㅘ",
    "ㅙ",
    "ㅚ",
    "ㅛ",
    "ㅜ",
    "ㅝ",
    "ㅞ",
    "ㅟ",
    "ㅠ",
    "ㅡ",
    "ㅢ",
    "ㅣ",
  ]

  const JONG = [
    "",
    "ㄱ",
    "ㄲ",
    "ㄳ",
    "ㄴ",
    "ㄵ",
    "ㄶ",
    "ㄷ",
    "ㄹ",
    "ㄺ",
    "ㄻ",
    "ㄼ",
    "ㄽ",
    "ㄾ",
    "ㄿ",
    "ㅀ",
    "ㅁ",
    "ㅂ",
    "ㅄ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ]

  // 복합 자모를 기본 자모로 분해하는 함수
  const decomposeJamo = (jamo: string): string[] => {
    const decompositionMap: { [key: string]: string[] } = {
      // 쌍자음 분해
      ㄲ: ["ㄱ", "ㄱ"],
      ㄸ: ["ㄷ", "ㄷ"],
      ㅃ: ["ㅂ", "ㅂ"],
      ㅆ: ["ㅅ", "ㅅ"],
      ㅉ: ["ㅈ", "ㅈ"],

      // 복합 자음 분해
      ㄳ: ["ㄱ", "ㅅ"],
      ㄵ: ["ㄴ", "ㅈ"],
      ㄶ: ["ㄴ", "ㅎ"],
      ㄺ: ["ㄹ", "ㄱ"],
      ㄻ: ["ㄹ", "ㅁ"],
      ㄼ: ["ㄹ", "ㅂ"],
      ㄽ: ["ㄹ", "ㅅ"],
      ㄾ: ["ㄹ", "ㅌ"],
      ㄿ: ["ㄹ", "ㅍ"],
      ㅀ: ["ㄹ", "ㅎ"],
      ㅄ: ["ㅂ", "ㅅ"],

      // 복합 모음 분해
      ㅘ: ["ㅗ", "ㅏ"],
      ㅙ: ["ㅗ", "ㅐ"],
      ㅚ: ["ㅗ", "ㅣ"],
      ㅝ: ["ㅜ", "ㅓ"],
      ㅞ: ["ㅜ", "ㅔ"],
      ㅟ: ["ㅜ", "ㅣ"],
      ㅢ: ["ㅡ", "ㅣ"],
    }

    return decompositionMap[jamo] || [jamo]
  }

  const result: string[] = []

  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const code = char.charCodeAt(0)

    // 한글인지 확인
    if (code >= 0xac00 && code <= 0xd7a3) {
      const temp = code - 0xac00
      const jong = temp % 28
      const jung = ((temp - jong) / 28) % 21
      const cho = ((temp - jong) / 28 - jung) / 21

      // 초성 분해
      const choJamo = CHO[cho]
      result.push(...decomposeJamo(choJamo))

      // 중성 분해
      const jungJamo = JUNG[jung]
      result.push(...decomposeJamo(jungJamo))

      // 종성 분해 (있는 경우만)
      if (jong !== 0) {
        const jongJamo = JONG[jong]
        result.push(...decomposeJamo(jongJamo))
      }
    } else {
      // 한글이 아닌 경우 그대로 추가
      result.push(char)
    }
  }

  return result
}

// 게임 결과 체크 함수
export function checkGuess(guess: string[], answer: string[]): ("correct" | "present" | "absent")[] {
  const result: ("correct" | "present" | "absent")[] = []
  const answerCopy = [...answer]

  // 먼저 정확한 위치 체크
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct"
      answerCopy[i] = "" // 사용된 글자 제거
    }
  }

  // 그 다음 포함되어 있지만 위치가 틀린 글자 체크
  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== "correct") {
      const foundIndex = answerCopy.indexOf(guess[i])
      if (foundIndex !== -1) {
        result[i] = "present"
        answerCopy[foundIndex] = "" // 사용된 글자 제거
      } else {
        result[i] = "absent"
      }
    }
  }

  return result
}
