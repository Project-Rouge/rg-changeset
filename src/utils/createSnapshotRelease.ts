import { exec } from "@actions/exec";
import { context } from "@actions/github";
import { catchErrorLog } from "./catchErrorLog";
import { getJson } from "./getJson";
import { isInPreReleaseMode } from "./isInPreReleaseMode";
import { pipeLog } from "./pipeLog";
import { Context } from "@actions/github/lib/context";

export async function createSnapshotRelease() {

  pipeLog('createSnapshotRelease');

  try {

    if (!context.payload.pull_request) return;

    const pr = context.payload.pull_request as Context['payload']['pull_request'] & { title: string };

    if (!pr.title) return;

    if (!pr.title.includes('[snapshot]')) return;

    console.log('createSnapshotRelease: start');

    if (isInPreReleaseMode()) await exec('yarn changeset pre exit');

    await exec(`yarn changeset version --snapshot PR${pr.number}`);
    await exec(`yarn changeset version --snapshot PR${pr.number}`);
    await exec(`yarn changeset publish --no-git-tag --tag PR${pr.number}`);
    console.log('createSnapshotRelease: end');
    console.log(`🖼 You can install this snapshot with \`yarn add ${getJson().name}@PR${pr.number}\``);
  } catch (e) {
    catchErrorLog(e);
  }
}