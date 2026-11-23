import { handle, readJson } from "@/lib/http";
import { getPollService } from "@/lib/service";

export async function POST(req: Request) {
  return handle(async () => {
    const result = await getPollService().createPoll(await readJson(req));
    return Response.json(result, { status: 201 });
  });
}
