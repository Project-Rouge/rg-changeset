import { exec } from "@actions/exec";
import { checkDeleteMeFile } from "../deleteMeUtils/checkDeleteMeFile";
import { Env } from "./Env";
import { pipeLog } from "./pipeLog";
import { prMainToNext } from "./prMainToNext";
import { prNextToMainRelease } from "./prNextToMainRelease";
import { prRelease } from "./prRelease";
import { release } from "./release";

export async function runCD() {

  checkDeleteMeFile();

  pipeLog('setGitConfig');
  await setGitConfig();

  pipeLog('release');
  await release();

  pipeLog('prRelease');
  await prRelease();

  if (Env.thisBranch === 'main') {
    pipeLog('prMainToNext');
    await prMainToNext();
  }

  if (Env.thisBranch === 'next') {
    pipeLog('prNextToMainRelease');
    await prNextToMainRelease();
  }

}

async function setGitConfig() {
  await exec('git config user.name github-actions');
  await exec('git config user.email github-actions@github.com');
}