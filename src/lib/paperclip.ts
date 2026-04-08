const PAPERCLIP_API_URL = process.env.PAPERCLIP_API_URL ?? "";
const PAPERCLIP_API_KEY = process.env.PAPERCLIP_API_KEY ?? "";

interface PaperclipRequestOptions {
  path: string;
  method?: string;
  body?: unknown;
}

/**
 * Paperclip API 프록시 호출
 * @param options - 요청 경로, 메서드, 바디
 * @returns Paperclip API 응답
 * @throws {Error} API URL 미설정 또는 요청 실패 시
 */
export async function paperclipFetch({ path, method = "GET", body }: PaperclipRequestOptions) {
  if (!PAPERCLIP_API_URL) {
    throw new Error("PAPERCLIP_API_URL이 설정되지 않았습니다.");
  }

  const url = `${PAPERCLIP_API_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(PAPERCLIP_API_KEY ? { Authorization: `Bearer ${PAPERCLIP_API_KEY}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "응답 본문 없음");
    throw new Error(`Paperclip API 오류 (${response.status}): ${text}`);
  }

  return response.json();
}
