import { exec } from '@actions/exec';
import { catchErrorLog } from "./catchErrorLog";
import { createBumpPR } from './createBumpPR';
import { Env } from './Env';
import { setReleaseMode } from "./setReleaseMode";

/** create a Bump PR from `next` to `main` that will trigger a `@latest` release on merge */
export async function createNextToMainBumpPR() {
  if (Env.thisBranch !== 'next')
    return;
  try {
    await exec('git reset --hard');
    await setReleaseMode({ forceExit: true });
    await createBumpPR({
      prBranch: 'release/next-to-main-release',
      baseBranch: 'main',
      title: ':warning: Upcoming _version_ Release (`next` to `main`)'
    });
  } catch (e) {
    catchErrorLog(e);
  }
}
