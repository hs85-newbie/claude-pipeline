"use client";

import { useEffect, useRef, useCallback } from "react";

type EventHandler = (data: unknown) => void;

const MAX_RETRY_DELAY = 60000;
const INITIAL_RETRY_DELAY = 3000;
const MAX_RETRIES = 10;

/**
 * SSE(Server-Sent Events) 연결 관리 훅 (지수 백오프 재연결)
 * @param url - SSE 엔드포인트 URL
 * @param handlers - 이벤트 타입별 핸들러 맵
 * @example
 * useEventSource("/api/events", {
 *   "issues:updated": (data) => refetch(),
 *   "connected": () => console.log("연결됨"),
 * });
 */
export function useEventSource(
  url: string,
  handlers: Record<string, EventHandler>
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);
  const retryCountRef = useRef(0);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      // WHY: 연결 성공 시 재시도 카운터 리셋
      retryCountRef.current = 0;
    };

    es.onerror = () => {
      es.close();

      if (retryCountRef.current >= MAX_RETRIES) {
        console.warn("[SSE] 최대 재시도 횟수 초과. 연결 중단.");
        return;
      }

      // WHY: 지수 백오프 + 지터로 스탬피드 방지
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
        MAX_RETRY_DELAY
      );
      const jitter = delay * 0.2 * Math.random();
      retryCountRef.current++;

      setTimeout(connect, delay + jitter);
    };

    for (const eventType of Object.keys(handlersRef.current)) {
      es.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handlersRef.current[eventType]?.(data);
        } catch (error) {
          console.error(`[SSE] ${eventType} 파싱 실패:`, error);
        }
      });
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);
}
