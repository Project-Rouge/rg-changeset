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

  console.log(`find PR ${prBranch} > ${baseBranch} `);

  const pr = await getPR({ baseBranch, prBranch });

  if (pr) {
    console.log(`PR found: ${pr.number}`);
    await octokit.rest.pulls.update({
      ...context.repo,
      pull_number: pr.number,
      title, body
    })
  } else {
    console.log(`PR not found, creating...`);
    await octokit.rest.pulls.create({
      ...context.repo,
      head: prBranch,
      base: baseBranch,
      title, body
    })
  }

}