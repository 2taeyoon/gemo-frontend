import Link from 'next/link';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - 페이지를 찾을 수 없습니다 | Gemo",
  description: "요청하신 페이지가 존재하지 않거나 접근 권한이 없습니다.",
};

export default function NotFound() {
  return (
    <div className="not-found-page min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-500 mb-8">
            요청하신 페이지가 존재하지 않거나 접근 권한이 없습니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          
          <div className="text-sm text-gray-400">
            <p>문제가 지속되면 관리자에게 문의해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 