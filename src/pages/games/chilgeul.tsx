import dynamic from "next/dynamic";
import React from 'react'

const AppWithoutSSR = dynamic(() => import("@/game/chilgeul/ChilgeulGameApp"), { ssr: false });

export default function chilgeul() {
	return (
		<div>
			<div>chilgeul 페이지</div>
			<AppWithoutSSR />
		</div>
	)
}