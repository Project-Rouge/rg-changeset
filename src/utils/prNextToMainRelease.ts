import { exec } from '@actions/exec';
import { catchErrorLog } from "./catchErrorLog";
import { prRelease } from './prRelease';
import { setReleaseMode } from "./setReleaseMode";

/** create a Bump PR from `next` to `main` that will trigger a `@latest` release on merge */
export async function prNextToMainRelease() {
  try {
    await exec('git reset --hard');
    await exec('git checkout next');
    await setReleaseMode('main');
    await prRelease({
      prBranch: 'release/next-to-main-release',
      baseBranch: 'main',
      title: ':warning: Upcoming _version_ Release (`next` to `main`)'
    });
  } catch (e) {
    catchErrorLog(e);
  }
}
