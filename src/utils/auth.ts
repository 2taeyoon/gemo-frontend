// Auth 관련 유틸리티 함수들

/**
 * 로그인 제공자별 로그인 처리 함수
 * @param providerId - 로그인 제공자 ID (예: 'google')
 * @param signIn - NextAuth의 signIn 함수
 * @param setIsLoading - 로딩 상태 설정 함수
 */
export const handleProviderSignIn = async (
  providerId: string,
  signIn: any,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    // 로그인 성공 시 홈페이지로 리디렉션
    await signIn(providerId, { callbackUrl: "/" });
  } catch (error) {
    console.error("로그인 에러:", error);
  } finally {
    setIsLoading(false);
  }
};

/**
 * 로그인 제공자 정보를 가져오는 함수
 * @param getProviders - NextAuth의 getProviders 함수
 * @param setProviders - 제공자 목록 설정 함수
 */
export const getProvidersData = async (
  getProviders: any,
  setProviders: (providers: any) => void
) => {
  const res = await getProviders();
  setProviders(res);
}; 