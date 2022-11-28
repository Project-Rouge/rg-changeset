import { exec } from '@actions/exec';
import { addDeleteMeFile } from '../deleteMeUtils/addDeleteMeFile';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { commitAndPush } from './commitAndPush';
import { getChangelogEntry } from './getChangelogEntry';
import { getJson } from './getJson';
import { getPrMessage } from './getPrMessage';
import { setReleaseMode } from "./setReleaseMode";
import { upsertPr } from './upsertPr';
import { upsertBranch } from './upsertPrBranch';

/** create a Bump PR from `next` to `main` that will trigger a `@latest` release on merge */
export async function prNextToMainRelease() {
  try {
    const sourceBranch = 'next';
    const baseBranch = 'main';
    const prBranch = 'release/next-to-main-release';

    await upsertBranch({ sourceBranch, prBranch });
    await setReleaseMode('main');
    await exec('yarn changeset version');
    if (!(await canCommit())) {
      console.log('nothing to commit.');
      return;
    }

    const deleteMeNote = addDeleteMeFile(prBranch);

    await commitAndPush({ branch: prBranch });

    const version = getJson().version;

    const title = `:warning: Upcoming \`${version}\` release (\`next\` to \`main\`)`;

    const prNote = getPrMessage();
    const body = `${prNote}\n\n${deleteMeNote}\n\n${getChangelogEntry(version)}`;

    await upsertPr({ baseBranch, prBranch, title, body });

  } catch (e) {
    catchErrorLog(e);
  }
}
