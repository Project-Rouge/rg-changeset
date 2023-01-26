import { exec } from "@actions/exec";
import { catchErrorLog } from "./catchErrorLog";
import { Env } from "./Env";
import { getJson } from "./getJson";
import { getPR } from "./getPR";
import { pipeLog } from "./pipeLog";

export async function createSnapshotRelease() {

  pipeLog('createSnapshotRelease');

  try {

    const pr = await getPR({
      baseBranch: Env.thisPrBranch,
      prBranch: Env.thisBranch
    })

    // only run if title includes `[snapshot]`
    if (!pr.title.includes('[snapshot]')) return;
    console.log('createSnapshotRelease: start');

    await exec('yarn changeset pre exit');
    await exec(`yarn changeset version --snapshot PR${pr.number}`);
    await exec(`yarn changeset version --snapshot PR${pr.number}`);
    await exec(`yarn changeset publish --no-git-tag --tag PR${pr.number}`);
    console.log('createSnapshotRelease: end');
    console.log(`📸 You can install this snapshot with \`yarn add ${getJson().name}@PR${pr.number}\``);
  } catch (e) {
    catchErrorLog(e);
  }
}