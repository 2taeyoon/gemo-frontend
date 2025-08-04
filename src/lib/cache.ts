/**
 * 간단한 메모리 캐시 시스템
 * 프로덕션에서는 Redis나 다른 캐시 서비스를 사용하는 것을 권장합니다.
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * 캐시에 값을 저장합니다.
   * @param key 캐시 키
   * @param value 저장할 값
   * @param ttl 캐시 유효 시간 (밀리초, 기본값: 5분)
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 캐시에서 값을 가져옵니다.
   * @param key 캐시 키
   * @returns 캐시된 값 또는 null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // TTL 체크
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 캐시에서 특정 키를 삭제합니다.
   * @param key 삭제할 캐시 키
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 모든 캐시를 삭제합니다.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 만료된 캐시 항목들을 정리합니다.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시 크기를 반환합니다.
   */
  size(): number {
    return this.cache.size;
  }
}

// 전역 캐시 인스턴스
export const memoryCache = new MemoryCache();

// 주기적으로 만료된 캐시 정리 (5분마다)
if (typeof window === 'undefined') { // 서버 사이드에서만 실행
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
} 