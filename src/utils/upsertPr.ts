import { context } from "@actions/github";
import { getGithubKit } from "./getGithubKit";
import { getPR } from "./getPR";

interface upsertPrProps {
  baseBranch: string;
  prBranch: string;
  title: string;
  body: string;
}

/** create or update PR */
export async function upsertPr({ baseBranch, prBranch, title, body }: upsertPrProps) {

  const octokit = getGithubKit();

  const pr = await getPR({ baseBranch, prBranch });

  if (pr) {
    await octokit.rest.pulls.update({
      ...context.repo,
      pull_number: pr.number,
      title, body
    })
  } else {
    await octokit.rest.pulls.create({
      ...context.repo,
      head: prBranch,
      base: baseBranch,
      title, body
    })
  }

}