import { exec } from '@actions/exec';
import { addDeleteMeFile } from '../deleteMeUtils/addDeleteMeFile';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { commitAndPush } from './commitAndPush';
import { Env } from './Env';
import { getChangelogEntry } from "./getChangelogEntry";
import { getJson } from "./getJson";
import { getPrMessage } from './getPrMessage';
import { upsertPr } from './upsertPr';
import { upsertBranch } from './upsertPrBranch';

/** create a Bump PR that will trigger a release on merge (if possible) */
export async function prRelease() {
  try {

    const sourceBranch = Env.thisBranch;
    const baseBranch = sourceBranch;
    const prBranch = `release/${sourceBranch}-release`;

    await upsertBranch({ sourceBranch, prBranch });
    await exec('yarn changeset version');
    if (!(await canCommit())) {
      console.log('nothing to commit.');
      return;
    }

    const deleteMeNote = addDeleteMeFile(prBranch);

    await commitAndPush({ branch: prBranch });

    const version = getJson().version;

    let title = `Upcoming \`${version}\` release (\`${baseBranch}\`)`;
    if (baseBranch === 'main') title = `:warning: ${title}`;

    const prNote = getPrMessage(sourceBranch);
    const body = `${prNote}\n\n${deleteMeNote}\n\n${getChangelogEntry(version)}`;

    await upsertPr({ baseBranch, prBranch, title, body })

  } catch (e) {
    catchErrorLog(e);
  }
}