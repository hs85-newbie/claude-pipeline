import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recoverStuckIssues } from "@/lib/dispatch";

// WHY: SSE로 이슈 상태 변경을 실시간 push. MVP에서는 DB polling(5초) → 변경 감지 시 전송.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let heartbeatId: ReturnType<typeof setInterval> | null = null;

  function cleanup() {
    if (intervalId) clearInterval(intervalId);
    if (heartbeatId) clearInterval(heartbeatId);
    intervalId = null;
    heartbeatId = null;
  }

  const stream = new ReadableStream({
    start(controller) {
      let lastCheck = new Date();
      let stuckCheckCounter = 0;

      function sendEvent(event: string, data: unknown) {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // WHY: 연결이 이미 닫힌 경우 enqueue 실패 → cleanup
          cleanup();
        }
      }

      sendEvent("connected", { timestamp: lastCheck.toISOString() });

      intervalId = setInterval(async () => {
        try {
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

          // WHY: 5분마다 stuck 이슈 체크 (polling 12회 = 60초, 60회 = 5분)
          stuckCheckCounter++;
          if (stuckCheckCounter >= 60) {
            const recovered = await recoverStuckIssues(userId);
            if (recovered > 0) {
              sendEvent("issues:recovered", { count: recovered });
            }
            stuckCheckCounter = 0;
          }
        } catch (error) {
          console.error("[SSE] polling 에러:", error);
        }
      }, 5000);

      heartbeatId = setInterval(() => {
        sendEvent("heartbeat", { timestamp: new Date().toISOString() });
      }, 30000);
    },

    // WHY: 클라이언트 연결 종료 시 cancel()이 호출됨 → 여기서 cleanup
    cancel() {
      cleanup();
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
