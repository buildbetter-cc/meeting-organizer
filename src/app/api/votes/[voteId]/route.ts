import { handle, readJson } from "@/lib/http";
import { getPollService } from "@/lib/service";

export async function PUT(req: Request, { params }: { params: Promise<{ voteId: string }> }) {
  return handle(async () => {
    const { voteId } = await params;
    await getPollService().updateVote(voteId, await readJson(req));
    return Response.json({ ok: true });
  });
}
