import { prisma } from "./db";
import { createPollService, type PollService } from "./poll-service";
import { createPrismaRepo } from "./prisma-repo";

let service: PollService | undefined;

/** The poll service wired to the Prisma database. */
export function getPollService(): PollService {
  service ??= createPollService(createPrismaRepo(prisma));
  return service;
}
