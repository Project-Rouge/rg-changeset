import { context } from '@actions/github';
import { catchErrorLog } from "./catchErrorLog";
import { getGithubKit } from "./getGithubKit";

export async function getPR({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {
  try {
    const octokit = getGithubKit();
    const prList = await octokit.rest.pulls.list({
      ...context.repo,
      state: 'open',
    });
    return prList.data.find(pr => pr.base.ref === baseBranch && pr.head.ref === prBranch);
  } catch (e) {
    catchErrorLog(e);
  }
}
