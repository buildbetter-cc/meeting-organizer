import { handle, readJson } from "@/lib/http";
import { getPollService } from "@/lib/service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const result = await getPollService().castVote(id, await readJson(req));
    return Response.json(result, { status: 201 });
  });
}
