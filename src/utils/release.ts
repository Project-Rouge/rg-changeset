import { exec, getExecOutput } from '@actions/exec';
import { context } from '@actions/github';
import { getGithubKit } from "./getGithubKit";
import { getChangelogEntry } from "./getChangelogEntry";
import { getJson } from "./getJson";
import { catchErrorLog } from "./catchErrorLog";

/** release (if possible) */
export async function release() {
  const { version, name } = getJson();

  let npmReleased = false;

  // check if npm released
  try {
    const publishedNpmVersions = await getExecOutput(`npm view ${name} version`);
    npmReleased = publishedNpmVersions.stdout.split('\n').includes(version);
  } catch (e) {
    catchErrorLog(e);
  }

  // release to npm
  try {
    if (!npmReleased)
      await exec('yarn changeset publish');
  } catch (e) {
    catchErrorLog(e);
  }

  // release to Github
  try {
    const octokit = getGithubKit();
    try {
      await octokit.rest.repos.getReleaseByTag({
        ...context.repo,
        tag: version,
      });
    } catch (e) {
      if (e.status !== 404)
        throw e;
      console.log('tag does not exist, creating...');
      await octokit.rest.repos.createRelease({
        ...context.repo,
        name: version,
        tag_name: version,
        body: getChangelogEntry(version),
        prerelease: version.includes("-"),
      });
    }
  } catch (e) {
    catchErrorLog(e);
  }
}
