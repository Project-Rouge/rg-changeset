import { config } from "dotenv";
process.env.GITHUB_REF || config()

import { exec } from '@actions/exec';
import { existsSync } from 'fs';
import { updatePrDeleteMeStatus } from "./deleteMeUtils/updatePrDeleteMeStatus";
import { Env } from "./utils/Env";
import { pipeLog } from "./utils/pipeLog";
import { prMainToNext } from "./utils/prMainToNext";
import { prNextToMainRelease } from "./utils/prNextToMainRelease";
import { prRelease } from "./utils/prRelease";
import { release } from "./utils/release";
process.env.GITHUB_REF || config();

if (Env.thisPrBranch) runPR();
else runCD();

async function runPR() {
  pipeLog('runPR');
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
}

async function runCD() {

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