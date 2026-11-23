import { handle, readJson } from "@/lib/http";
import { getPollService } from "@/lib/service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    await getPollService().finalizePoll(id, await readJson(req));
    return Response.json({ ok: true });
  });
}
