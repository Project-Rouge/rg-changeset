import { context } from '@actions/github';
import { catchErrorLog } from "./catchErrorLog";
import { Env } from './Env';
import { getGithubKit } from "./getGithubKit";
import { getPR } from "./getPR";

/** create a PR from `main` to `next` (if possible) */
export async function prMainToNext() {
  if (Env.thisBranch !== 'main')
    return;
  try {
    const baseBranch = 'next';
    const prBranch = 'main';
    const pr = await getPR({ baseBranch, prBranch });
    if (pr)
      return;
    const octokit = getGithubKit();
    await octokit.rest.pulls.create({
      ...context.repo,
      base: baseBranch,
      head: prBranch,
      title: ':arrow_down: (sync) merge `main` back into `next`',
      body: 'Created by Github action'
    });
  } catch (e) {
    catchErrorLog(e);
  }
}
