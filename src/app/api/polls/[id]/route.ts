import { handle } from "@/lib/http";
import { getPollService } from "@/lib/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    return Response.json(await getPollService().getPublicPoll(id));
  });
}
