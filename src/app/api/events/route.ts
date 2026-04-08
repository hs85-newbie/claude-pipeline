import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// WHY: SSE로 이슈 상태 변경을 실시간 push. MVP에서는 DB polling(5초) → 변경 감지 시 전송.
// Phase 2에서 Paperclip webhook 수신 시 push 방식으로 전환.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

      function sendEvent(event: string, data: unknown) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      // 초기 연결 확인
      sendEvent("connected", { timestamp: lastCheck.toISOString() });

      const interval = setInterval(async () => {
        try {
          // WHY: 마지막 체크 이후 업데이트된 이슈만 조회
          const updatedIssues = await prisma.issue.findMany({
            where: {
              project: { userId },
              updatedAt: { gt: lastCheck },
            },
            include: {
              project: { select: { name: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 10,
          });

          if (updatedIssues.length > 0) {
            sendEvent("issues:updated", updatedIssues);
          }

          lastCheck = new Date();
        } catch (error) {
          console.error("[SSE] polling 에러:", error);
        }
      }, 5000);

      // 30초마다 heartbeat
      const heartbeat = setInterval(() => {
        sendEvent("heartbeat", { timestamp: new Date().toISOString() });
      }, 30000);

      // cleanup 시 interval 정리
      const cleanup = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      };

      // WHY: ReadableStream cancel 시 cleanup 필요
      controller.close = new Proxy(controller.close, {
        apply(target, thisArg) {
          cleanup();
          return Reflect.apply(target, thisArg, []);
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
