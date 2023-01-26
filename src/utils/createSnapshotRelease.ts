import { exec } from "@actions/exec";
import { catchErrorLog } from "./catchErrorLog";
import { Env } from "./Env";
import { getPR } from "./getPR";
import { pipeLog } from "./pipeLog";

export async function createSnapshotRelease() {

  pipeLog('createSnapshotRelease');

  try {

    // don't run on `main` and `next` branches
    if (Env.thisPrBranch === 'main') return;
    if (Env.thisPrBranch === 'next') return;

    const pr = await getPR({
      baseBranch: Env.thisPrBranch,
      prBranch: Env.thisBranch
    })

    // only run if title includes `[snapshot]`
    if (!pr.title.includes('[snapshot]')) return;
    await exec('yarn changeset pre exit');
    await exec(`yarn changeset version --snapshot PR${pr.number}`);
    await exec(`yarn changeset version --snapshot PR${pr.number}`);
    await exec(`yarn changeset publish --no-git-tag --tag PR${pr.number}`);
  } catch (e) {
    catchErrorLog(e);
  }
}