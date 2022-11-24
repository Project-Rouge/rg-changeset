import { config } from "dotenv";
process.env.GITHUB_REF || config();
import { exec } from '@actions/exec';
import { existsSync } from 'fs';
import { createBumpPR } from "./utils/createBumpPR";
import { createNextToMainBumpPR } from "./utils/createNextToMainBumpPR";
import { Env } from "./utils/Env";
import { pipeLog } from "./utils/pipeLog";
import { prMainToNext } from "./utils/prMainToNext";
import { release } from "./utils/release";
import { setReleaseMode } from "./utils/setReleaseMode";
import { canCommit } from "./utils/canCommit";

if (Env.thisPrBranch) runPR();
else runCD();

async function runPR() {
  const pre = '.changeset/pre.json';
  const isPreRelease = existsSync(pre);
  if (!isPreRelease && Env.thisPrBranch === 'next') {
    throw new Error(`${pre} not found. Forgot to run \`yarn changeset pre enter next\`?`)
  }
  if (isPreRelease && Env.thisPrBranch === 'main') {
    throw new Error(`PR is in pre-release mode. Forgot to run \`yarn changeset pre exit\`?`)
  }
}

async function runCD() {

  pipeLog('setGitConfig');
  await setGitConfig();

  pipeLog('setReleaseMode');
  await setReleaseMode();

  pipeLog('release');
  await release();

  pipeLog('prMainToNext');
  await prMainToNext();

  pipeLog('createBumpPR');
  await createBumpPR({});

  pipeLog('createNextToMainBumpPR');
  await createNextToMainBumpPR();

}

async function setGitConfig() {
  await exec('git config user.name github-actions');
  await exec('git config user.email github-actions@github.com');
}