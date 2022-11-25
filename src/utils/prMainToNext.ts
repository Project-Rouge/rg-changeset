import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { getGithubKit } from "./getGithubKit";
import { getPR } from "./getPR";
import { prependToReadme } from './prependToReadme';
import { setReleaseMode } from './setReleaseMode';

/** create a PR from `main` to `next` (if possible) */
export async function prMainToNext() {
  try {

    const baseBranch = 'next';
    const prBranch = 'sync/main-to-next';

    await exec('git reset --hard');
    await exec('git checkout main');
    await exec(`git checkout -b ${prBranch}`);
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
    const pr = await getPR({ baseBranch, prBranch });
    if (pr)
      return;
    const octokit = getGithubKit();
    await octokit.rest.pulls.create({
      ...context.repo,
      base: baseBranch,
      head: prBranch,
      title: ':arrow_down: (sync) merge `main` back into `next`',
      body: botNote
    });
  } catch (e) {
    catchErrorLog(e);
  }
}
