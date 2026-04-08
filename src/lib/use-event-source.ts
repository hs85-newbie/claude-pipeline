"use client";

import { useEffect, useRef, useCallback } from "react";

type EventHandler = (data: unknown) => void;

/**
 * SSE(Server-Sent Events) 연결 관리 훅
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
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onerror = () => {
      es.close();
      // WHY: 연결 끊김 시 3초 후 재연결 (지수 백오프 대신 고정 간격 — MVP 단순화)
      setTimeout(connect, 3000);
    };

    // 등록된 모든 이벤트 타입에 리스너 연결
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
