// 홈 페이지 (/ 경로). 실제 첫 화면이 여기 렌더링 됨

import Head from "next/head";
import Link from "next/link";

export default function Home() {
	return (
		<>
			<Head>
				<title>Phaser Nextjs Template</title>
				<meta
					name="description"
					content="A Phaser 3 Next.js project template that demonstrates Next.js with React communication and uses Vite for bundling."
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.png" />
			</Head>
			<main>
				<Link href="/games/chilgeul">
					<button>💝 칠글 게임 바로가기</button>
				</Link>
				<Link href="/psytest">
					<button>🧬 심리 테스트 바로가기</button>
				</Link>
			</main>
		</>
	);
}
