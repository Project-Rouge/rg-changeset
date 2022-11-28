import { addDeleteMeFile } from '../deleteMeUtils/addDeleteMeFile';
import { catchErrorLog } from "./catchErrorLog";
import { commitAndPush } from './commitAndPush';
import { getJson } from './getJson';
import { getPrMessage, PrType } from './getPrMessage';
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

    await commitAndPush({ branch: prBranch });

    const version = getJson().version;

    const title = `:arrow_down: (sync) merge \`main@${version}\` back into \`next\``;

    const deleteMeNote = addDeleteMeFile(prBranch);
    const prNote = getPrMessage(PrType.sync);
    const body = `${prNote}\n\n${deleteMeNote}`;

    await upsertPr({ baseBranch, prBranch, title, body });
  } catch (e) {
    catchErrorLog(e);
  }
}
