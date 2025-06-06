import Link from "next/link"
import React from 'react'

export default function Home() {
	return (
		<div>
			<Link href="/gemocard" className="category">게모 게임 시작하기</Link>
		</div>
	)
}