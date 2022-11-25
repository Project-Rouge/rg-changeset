import { catchErrorLog } from "./catchErrorLog";
import { commitAndPush } from './commitAndPush';
import { getJson } from './getJson';
import { prependToReadme } from './prependToReadme';
import { setReleaseMode } from './setReleaseMode';
import { upsertPr } from './upsertPr';
import { upsertBranch } from './upsertPrBranch';

/** create a PR from `main` to `next` (if possible) */
export async function prMainToNext() {
  try {

    const sourceBranch = 'main';
    const baseBranch = 'next';
    const prBranch = 'sync/main-to-next';

    await upsertBranch({ sourceBranch, prBranch });

    await setReleaseMode('next');
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
