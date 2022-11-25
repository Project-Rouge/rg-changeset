import { exec } from '@actions/exec';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { getJson } from './getJson';
import { prependToReadme } from './prependToReadme';
import { setReleaseMode } from './setReleaseMode';
import { upsertPr } from './upsertPr';

/** create a PR from `main` to `next` (if possible) */
export async function prMainToNext() {
  try {

    const sourceBranch = 'main';
    const baseBranch = 'next';
    const prBranch = 'sync/main-to-next';

    await exec('git reset --hard');
    await exec(`git checkout ${sourceBranch}`);
    await exec(`git checkout -b ${prBranch}`);
    await exec(`git merge ${sourceBranch} --no-edit --no-commit`);
    await setReleaseMode('next');
    await exec('git restore .changeset/config.json');
    if (!(await canCommit())) {
      console.log('nothing to commit.');
      return;
    }
    const botNote = prependToReadme(prBranch);
    await exec('git add .');
    await exec('git commit -m "prep main-to-next"')
    await exec(`git push origin ${prBranch} --force`);

    const version = getJson().version;

    const title = `:arrow_down: (sync) merge \`main@${version}\` back into \`next\``;
    const body = botNote;

    await upsertPr({ baseBranch, prBranch, title, body });
  } catch (e) {
    catchErrorLog(e);
  }
}
