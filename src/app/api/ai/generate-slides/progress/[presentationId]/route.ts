import { NextRequest } from "next/server";
import { getProgress } from "@/lib/progress-tracker";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const encoder = new TextEncoder();
  const { presentationId } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = () => {
        const progress = getProgress(presentationId);
        if (progress) {
          const data = JSON.stringify(progress);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      };

      const interval = setInterval(sendProgress, 500);

      sendProgress();

      const cleanup = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch (e) {
        }
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
