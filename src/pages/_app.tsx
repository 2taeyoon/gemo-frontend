// 모든 페이지에 공통으로 적용되는 Layout, CSS, 상태관리 등을 설정하는 엔트리포인트

import "../styles/global.css"; // 전역 스타일 시트
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}