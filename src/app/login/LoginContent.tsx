"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import Link from "next/link";

// 에러 메시지를 표시하는 별도 컴포넌트
// function ErrorMessage() {
//   const searchParams = useSearchParams();
//   const error = searchParams?.get("error");

//   if (!error) return null;

//   return (
//     <div
//       style={{
//         backgroundColor: "#fee",
//         color: "#c33",
//         padding: "12px",
//         borderRadius: "6px",
//         marginBottom: "20px",
//         textAlign: "center",
//         fontSize: "14px",
//       }}
//     >
//       {error === "OAuthSignin" &&
//         "OAuth 로그인 중 오류가 발생했습니다. Google OAuth 설정을 확인해주세요."}
//       {error === "OAuthCallback" && "OAuth 콜백 오류가 발생했습니다."}
//       {error === "Configuration" && "로그인 설정에 문제가 있습니다."}
//       {!["OAuthSignin", "OAuthCallback", "Configuration"].includes(error) &&
//         "로그인 중 오류가 발생했습니다."}
//     </div>
//   );
// }

export default function LoginContent() {
  const [providers, setProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getProvidersData = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    getProvidersData();
  }, []);

  const handleProviderSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { callbackUrl: "/" });
    } catch (error) {
      console.error("로그인 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "var(--bg-color, #f5f5f5)",
					padding: "20px",
				}}
			>
				<div
					style={{
						backgroundColor: "var(--card-bg, white)",
						padding: "40px",
						borderRadius: "12px",
						boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
						width: "100%",
						maxWidth: "400px",
					}}
				>
					<h1
						style={{
							textAlign: "center",
							marginBottom: "30px",
							color: "var(--text-color, #333)",
							fontSize: "28px",
							fontWeight: "600",
						}}
					>
						로그인
					</h1>
					{/* <ErrorMessage /> */}
					

					{!providers || Object.keys(providers).length === 0 ? (
						<div
							style={{
								textAlign: "center",
								padding: "20px",
								backgroundColor: "#f0f8ff",
								borderRadius: "8px",
								marginBottom: "20px",
							}}
						>
							<h3 style={{ color: "#0066cc", marginBottom: "15px" }}>
								환경변수 설정이 필요합니다
							</h3>
							<p
								style={{
									color: "#666",
									fontSize: "14px",
									lineHeight: "1.5",
									marginBottom: "15px",
								}}
							>
								Google OAuth 로그인을 사용하려면 다음 환경변수를 설정해주세요:
							</p>
							<div
								style={{
									textAlign: "left",
									backgroundColor: "#f8f9fa",
									padding: "15px",
									borderRadius: "4px",
									fontFamily: "monospace",
									fontSize: "12px",
									color: "#333",
								}}
							>
								NEXTAUTH_URL=http://localhost:3000
								<br />
								NEXTAUTH_SECRET=your-secret-key
								<br />
								GOOGLE_CLIENT_ID=your-google-client-id
								<br />
								GOOGLE_CLIENT_SECRET=your-google-client-secret
							</div>
							<p
								style={{ color: "#666", fontSize: "12px", marginTop: "10px" }}
							>
								.env.local 파일에 위 내용을 추가하고 서버를 재시작해주세요.
							</p>
						</div>
					) : (
						Object.values(providers).map((provider: any) => (
							<button
								key={provider.id}
								onClick={() => handleProviderSignIn(provider.id)}
								disabled={isLoading}
								style={{
									width: "100%",
									padding: "12px",
									backgroundColor:
										provider.id === "google" ? "#db4437" : "#333",
									color: "white",
									border: "none",
									borderRadius: "6px",
									fontSize: "14px",
									fontWeight: "500",
									cursor: isLoading ? "not-allowed" : "pointer",
									opacity: isLoading ? 0.7 : 1,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "8px",
									marginBottom: "12px",
								}}
							>
								{provider.id === "google" && "🔗"}
								{isLoading
									? "로그인 중..."
									: `${provider.name}으로 로그인`}
							</button>
						))
					)}

					<div style={{ textAlign: "center", marginTop: "20px" }}>
						<Link
							href="/"
							style={{
								color: "#0070f3",
								textDecoration: "none",
								fontSize: "14px",
							}}
						>
							← 홈으로 돌아가기
						</Link>
					</div>
				</div>
			</div>
    
  );
}

// // LoginContent 컴포넌트를 기본 내보내기로 설정
// export default function LoginContent() {
//   return (
//     <Suspense fallback={<div>로딩 중...</div>}>
//       <LoginForm />
//     </Suspense>
//   );
