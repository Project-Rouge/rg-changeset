import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { appendFileSync } from "fs";
import { appendToReadme } from './appendToReadme';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { Env } from './Env';
import { getChangelogEntry } from "./getChangelogEntry";
import { getGithubKit } from "./getGithubKit";
import { getJson } from "./getJson";
import { getPR } from "./getPR";

interface createBumpPRProps {
  prBranch?: string,
  baseBranch?: string,
  title?: string,
}

/** create a Bump PR that will trigger a release on merge (if possible) */
export async function createBumpPR({
  prBranch = `release/${Env.thisBranch}-release`,
  baseBranch = Env.thisBranch,
  title = `Upcoming _version_ release (\`${baseBranch}\`)`,
}: createBumpPRProps) {
  try {
    await exec('yarn changeset version');
    await exec(`git checkout -b ${prBranch}`);
    await exec('git restore .changeset/config.json');
    await exec('git add .');
    const version = getJson().version as string;
    if (!(await canCommit())) return;
    const footNote = appendToReadme(prBranch);
    await exec('git add .');
    await exec(`git commit -m "(chore) changeset bump to ${version}"`)
    await exec(`git push origin ${prBranch} --force`);

    const pr = await getPR({ baseBranch, prBranch });

    title = title.replace('_version_', `\`${version}\``);

    const octokit = getGithubKit();

    if (pr) {
      await octokit.rest.pulls.update({
        ...context.repo,
        pull_number: pr.number,
        title,
        body: getChangelogEntry(version) + footNote
      })
    } else {
      await octokit.rest.pulls.create({
        ...context.repo,
        head: prBranch,
        base: baseBranch,
        title,
        body: getChangelogEntry(version) + footNote
      })
    }
  } catch (e) {
    catchErrorLog(e);
  }
}