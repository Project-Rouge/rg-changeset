import { context } from '@actions/github';
import { catchErrorLog } from "./catchErrorLog";
import { getGithubKit } from "./getGithubKit";
import { Globals } from './Globals';

interface getPrProps {
  baseBranch: string;
  prBranch: string;
}

export async function getPR({ baseBranch, prBranch }: getPrProps) {
  try {
    const octokit = getGithubKit();
    let pr = (await octokit.rest.pulls.list({
      ...context.repo,
      state: 'open',
      base: baseBranch,
      head: `${Globals.org}:${prBranch}`,
    })).data[0];
    return pr;
  } catch (e) {
    catchErrorLog(e);
  }
}
