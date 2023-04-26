import { existsSync } from "fs";
import { checkDeleteMeFile } from "../deleteMeUtils/checkDeleteMeFile";
import { updatePrDeleteMeStatus } from "../deleteMeUtils/updatePrDeleteMeStatus";
import { createSnapshotRelease } from "./createSnapshotRelease";
import { Env } from "./Env";
import { pipeLog } from "./pipeLog";
import { validateChangeset } from "./validate-changeset";

export async function prChecks() {
  pipeLog('prChecks');

  checkDeleteMeFile();

  validateChangeset();

  const pre = '.changeset/pre.json';
  const isPreRelease = existsSync(pre);
  if (!isPreRelease && Env.thisPrBranch === 'next') {
    throw new Error(`${pre} not found. Forgot to run \`yarn changeset pre enter next\`?`)
  }
  if (isPreRelease && Env.thisPrBranch === 'main') {
    throw new Error(`PR is in pre-release mode. Forgot to run \`yarn changeset pre exit\`?`)
  }
  pipeLog('updatePrDeleteMeStatus');
  await updatePrDeleteMeStatus({ baseBranch: Env.thisPrBranch, prBranch: Env.thisBranch });

  createSnapshotRelease();

}