import { exec } from '@actions/exec';
import { canCommit } from './canCommit';
import { catchErrorLog } from "./catchErrorLog";
import { Env } from './Env';
import { getChangelogEntry } from "./getChangelogEntry";
import { getJson } from "./getJson";
import { prependToReadme } from './prependToReadme';
import { upsertPr } from './upsertPr';

interface createBumpPRProps {
  prBranch?: string,
  baseBranch?: string,
  title?: string,
}

/** create a Bump PR that will trigger a release on merge (if possible) */
export async function prRelease({
  prBranch = `release/${Env.thisBranch}-release`,
  baseBranch = Env.thisBranch,
  title = `Upcoming _version_ release (\`${baseBranch}\`)`,
}: createBumpPRProps) {
  try {
    await exec('yarn changeset version');
    await exec(`git checkout -b ${prBranch}`);
    await exec('git restore .changeset/config.json');
    const version = getJson().version as string;
    if (!(await canCommit())) {
      console.log('nothing to commit.');
      return;
    }
    const botNote = prependToReadme(prBranch);
    await exec('git add .');
    await exec(`git commit -m "(chore) changeset bump to ${version}"`)
    await exec(`git push origin ${prBranch} --force`);

    title = title.replace('_version_', `\`${version}\``);
    
    const body = getChangelogEntry(version) + botNote;

    await upsertPr({baseBranch, prBranch, title, body })

  } catch (e) {
    catchErrorLog(e);
  }
}