import { exec } from '@actions/exec';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { getJson } from './getJson';
import { prependToReadme } from './prependToReadme';
import { upsertBranch } from './upsertPrBranch';
import { setReleaseMode } from './setReleaseMode';
import { upsertPr } from './upsertPr';
import { commitAndPush } from './commitAndPush';

/** create a PR from `main` to `next` (if possible) */
export async function prMainToNext() {
  try {

    const sourceBranch = 'main';
    const baseBranch = 'next';
    const prBranch = 'sync/main-to-next';

    await upsertBranch({ sourceBranch, prBranch });

    await setReleaseMode('next');
    if (!(await canCommit())) {
      console.log('nothing to commit.');
      return;
    }
    const botNote = prependToReadme(prBranch);

    await commitAndPush({ branch: prBranch });

    const version = getJson().version;

    const title = `:arrow_down: (sync) merge \`main@${version}\` back into \`next\``;
    const body = botNote;

    await upsertPr({ baseBranch, prBranch, title, body });
  } catch (e) {
    catchErrorLog(e);
  }
}
