import { randomBytes, createHash } from "crypto";

const PREFIX = "cp_";

/**
 * API 키 생성 (cp_ 프리픽스 + 32바이트 랜덤)
 * @returns { raw: 사용자에게 한 번만 표시, hash: DB 저장, prefix: 표시용 }
 */
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const random = randomBytes(32).toString("hex");
  const raw = `${PREFIX}${random}`;
  const hash = hashApiKey(raw);
  const prefix = `${PREFIX}${random.slice(0, 8)}...`;

  return { raw, hash, prefix };
}

/**
 * API 키를 SHA-256 해시
 * @param raw - 원본 API 키
 * @returns 해시 문자열
 */
export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
