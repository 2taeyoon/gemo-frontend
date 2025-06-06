// HTML 문서 자체를 커스터마이징할 때 사용 (<html>, <body>, <meta>, 폰트 등)

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="ko">
			<Head />
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
