import { config } from "dotenv";
process.env.GITHUB_REF || config();
import { exec, getExecOutput } from '@actions/exec';
import { getOctokit, context } from '@actions/github';
import { writeFileSync, readFileSync, existsSync } from 'fs';

/** branch this action is running on */
const thisBranch = process.env.GITHUB_REF_NAME as string;
/** branch targeted on PR */
const thisPrBranch = process.env.GITHUB_BASE_REF as string;

let _octokit: ReturnType<typeof getOctokit>;

if (thisPrBranch) runPR();
else runCD();

async function runPR() {
  const pre = '.changeset/pre.json';
  const isPreRelease = existsSync(pre);
  if (!isPreRelease && thisPrBranch === 'next') {
    throw new Error(`${pre} not found. Forgot to run \`yarn changeset pre enter next\`?`)
  }
  if (isPreRelease && thisPrBranch === 'main') {
    throw new Error(`PR is in pre-release mode. Forgot to run \`yarn changeset pre exit\`?`)
  }
}

async function runCD() {

  pipeLog('setGitConfig');
  await setGitConfig();

  pipeLog('setReleaseMode');
  await setReleaseMode();

  pipeLog('release');
  await release();

  pipeLog('prMainToNext');
  await prMainToNext();

  pipeLog('createBumpPR');
  await createBumpPR({});

  pipeLog('createNextToMainBumpPR');
  await createNextToMainBumpPR();

}

function pipeLog(message: string) {
  console.log(`🌺 ${message}`);
}

function catchErrorLog(error: any) {
  console.trace(`🐛`);
  console.log(error);
  try { console.log(JSON.stringify(error, null, 4)); } catch (error) { }
}

async function setGitConfig() {
  await exec('git config user.name github-actions');
  await exec('git config user.email github-actions@github.com');
}

/** enter/exit pre release mode */
async function setReleaseMode({ forceExit = false } = {}) {
  updateChangesetConfig({ branch: forceExit ? 'main' : thisBranch });
  try {
    if (forceExit || thisBranch === 'main') await exec(`yarn changeset pre exit`);
    if (!forceExit && thisBranch === 'dev') await exec(`yarn changeset pre enter next`);
  } catch (e) {
    catchErrorLog(e);
  }
}

/** release (if possible) */
async function release() {
  try {

    const version = getJson().version;

    const publishedNpmVersions = await getExecOutput(`npm view @project-rouge/rg-changeset-action version`);

    if (!publishedNpmVersions.stdout.split('\n').includes(version)) {
      await exec('yarn changeset publish');
    }

    const octokit = getGithubKit();

    try {
      await octokit.rest.repos.getReleaseByTag({
        ...context.repo,
        tag: version,
      })
    } catch (e) {
      if (e.status !== 404) throw e;
      // if failed because tag does not exist, create it
      await octokit.rest.repos.createRelease({
        ...context.repo,
        name: version,
        tag_name: version,
        body: getChangelogEntry(version),
        prerelease: version.includes("-"),
      })
    }

  } catch (e) {
    catchErrorLog(e);
  }
}

/** create a PR from `main` to `next` (if possible) */
async function prMainToNext() {
  if (thisBranch !== 'main') return;
  try {
    const baseBranch = 'next';
    const prBranch = 'main';
    const pr = await getPR({ baseBranch, prBranch });
    if (pr) return;
    const octokit = getGithubKit();
    await octokit.rest.pulls.create({
      ...context.repo,
      base: baseBranch,
      head: prBranch,
      title: ':arrow_down: (sync) merge `main` back into `next`',
      body: 'Created by Github action'
    })
  } catch (e) {
    catchErrorLog(e);
  }
}

async function getPR({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {
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

interface createBumpPRProps {
  prBranch?: string,
  baseBranch?: string,
  title?: string,
}

/** create a Bump PR that will trigger a release on merge (if possible) */
async function createBumpPR({
  prBranch = `release/${thisBranch}-release`,
  baseBranch = thisBranch,
  title = `Upcoming _version_ release (\`${baseBranch}\`)`,
}: createBumpPRProps) {
  try {
    await exec('yarn changeset version');
    await exec(`git checkout -b ${prBranch}`);
    await exec('git add .');
    await exec('git reset .changeset/config.json');
    const version = getJson().version as string;
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
        body: getChangelogEntry(version) + '\n\nCreated by Github action.'
      })
    } else {
      await octokit.rest.pulls.create({
        ...context.repo,
        head: prBranch,
        base: baseBranch,
        title,
        body: getChangelogEntry(version) + '\n\nCreated by Github action.'
      })
    }
  } catch (e) {
    catchErrorLog(e);
  }
}

/** create a Bump PR from `next` to `main` that will trigger a `@latest` release on merge */
async function createNextToMainBumpPR() {
  if (thisBranch !== 'next') return;
  try {
    await exec('git reset --hard');
    await setReleaseMode({ forceExit: true });
    await createBumpPR({
      prBranch: 'release/next-to-main-release',
      baseBranch: 'main',
      title: ':warning: Upcoming _version_ Release (`next` to `main`)'
    })
  } catch (e) {
    catchErrorLog(e);
  }
}

function getJson(file = './package.json') {
  return JSON.parse(readFileSync(file, 'utf-8'));
}

function updateChangesetConfig({ branch = thisBranch }) {
  const configFilePath = '.changeset/config.json';
  const config = getJson(configFilePath);
  config.baseBranch = branch;
  writeFileSync(configFilePath, JSON.stringify(config, null, 2) + '\n');
}

function getChangelogEntry(version: string) {
  const changelog = readFileSync('./CHANGELOG.md', 'utf-8').split('\n');
  const start = 2 + changelog.indexOf(`## ${version}`);
  const end = start + 1 + changelog.slice(start + 1).findIndex(line => line.startsWith('## '));
  const section = changelog.slice(start, end);
  return section.join('\n');
}

function getGithubKit() {
  if (!_octokit) _octokit = getOctokit(process.env.GITHUB_TOKEN as string);
  return _octokit;
}