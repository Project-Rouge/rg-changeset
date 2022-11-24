import { config } from "dotenv";
process.env.GITHUB_REF || config();
import { exec } from "@actions/exec";
import { getOctokit, context } from "@actions/github";
import { writeFileSync, readFileSync, existsSync } from "fs";
const thisBranch = process.env.GITHUB_REF_NAME;
const thisPrBranch = process.env.GITHUB_BASE_REF;
let _octokit;
if (thisPrBranch)
  runPR();
else
  runCD();
async function runPR() {
  const pre = ".changeset/pre.json";
  const isPreRelease = existsSync(pre);
  if (!isPreRelease && thisPrBranch === "next") {
    throw new Error(`${pre} not found. Forgot to run \`yarn changeset pre enter next\`?`);
  }
  if (isPreRelease && thisPrBranch === "main") {
    throw new Error(`PR is in pre-release mode. Forgot to run \`yarn changeset pre exit\`?`);
  }
}
async function runCD() {
  pipeLog("setGitConfig");
  await setGitConfig();
  pipeLog("setReleaseMode");
  await setReleaseMode();
  pipeLog("release");
  await release();
  pipeLog("prMainToNext");
  await prMainToNext();
  pipeLog("createBumpPR");
  await createBumpPR({});
  pipeLog("createNextToMainBumpPR");
  await createNextToMainBumpPR();
}
function pipeLog(message) {
  console.log(`\u{1F33A} ${message}`);
}
function catchErrorLog(error) {
  console.log(`\u{1F41B}`);
  console.log(error);
  try {
    console.log(JSON.stringify(error, null, 4));
  } catch (error2) {
  }
}
async function setGitConfig() {
  await exec("git config user.name github-actions");
  await exec("git config user.email github-actions@github.com");
}
async function setReleaseMode({ forceExit = false } = {}) {
  updateChangesetConfig({ branch: forceExit ? "main" : thisBranch });
  try {
    if (forceExit || thisBranch === "main")
      await exec(`yarn changeset pre exit`);
    if (!forceExit && thisBranch === "dev")
      await exec(`yarn changeset pre enter next`);
  } catch (e) {
    catchErrorLog(e);
  }
}
async function release() {
  try {
    await exec("yarn changeset publish");
    const octokit = getGithubKit();
    const pkg = getJson();
    try {
      octokit.rest.repos.getReleaseByTag({
        ...context.repo,
        tag: pkg.version
      });
    } catch (e) {
      catchErrorLog(e);
      await octokit.rest.repos.createRelease({
        ...context.repo,
        name: pkg.version,
        tag_name: pkg.version,
        body: getChangelogEntry(pkg.version),
        prerelease: pkg.version.includes("-")
      });
    }
  } catch (e) {
    catchErrorLog(e);
  }
}
async function prMainToNext() {
  if (thisBranch !== "main")
    return;
  try {
    const baseBranch = "next";
    const prBranch = "main";
    const pr = await getPR({ baseBranch, prBranch });
    if (pr)
      return;
    const octokit = getGithubKit();
    await octokit.rest.pulls.create({
      ...context.repo,
      base: baseBranch,
      head: prBranch,
      title: ":arrow_down: (sync) merge `main` back into `next`",
      body: "Created by Github action"
    });
  } catch (e) {
    catchErrorLog(e);
  }
}
async function getPR({ baseBranch, prBranch }) {
  try {
    const octokit = getGithubKit();
    const prList = await octokit.rest.pulls.list({
      ...context.repo,
      state: "open"
    });
    return prList.data.find((pr) => pr.base.ref === baseBranch && pr.head.ref === prBranch);
  } catch (e) {
    catchErrorLog(e);
  }
}
async function createBumpPR({
  prBranch = `release/${thisBranch}-release`,
  baseBranch = thisBranch,
  title = `Upcoming _version_ release (\`${baseBranch}\`)`
}) {
  try {
    await exec("yarn changeset version");
    await exec(`git checkout -b ${prBranch}`);
    await exec("git add .");
    await exec("git reset .changeset/config.json");
    const version = getJson().version;
    await exec(`git commit -m "(chore) changeset bump to ${version}"`);
    await exec(`git push origin ${prBranch} --force`);
    const pr = await getPR({ baseBranch, prBranch });
    title = title.replace("_version_", `\`${version}\``);
    const octokit = getGithubKit();
    if (pr) {
      await octokit.rest.pulls.update({
        ...context.repo,
        pull_number: pr.number,
        title,
        body: getChangelogEntry(version) + "\n\nCreated by Github action."
      });
    } else {
      await octokit.rest.pulls.create({
        ...context.repo,
        head: prBranch,
        base: baseBranch,
        title,
        body: getChangelogEntry(version) + "\n\nCreated by Github action."
      });
    }
  } catch (e) {
    catchErrorLog(e);
  }
}
async function createNextToMainBumpPR() {
  if (thisBranch !== "next")
    return;
  try {
    await exec("git reset --hard");
    await setReleaseMode({ forceExit: true });
    await createBumpPR({
      prBranch: "release/next-to-main-release",
      baseBranch: "main",
      title: ":warning: Upcoming _version_ Release (`next` to `main`)"
    });
  } catch (e) {
    catchErrorLog(e);
  }
}
function getJson(file = "./package.json") {
  return JSON.parse(readFileSync(file, "utf-8"));
}
function updateChangesetConfig({ branch = thisBranch }) {
  const configFilePath = ".changeset/config.json";
  const config2 = getJson(configFilePath);
  config2.baseBranch = branch;
  writeFileSync(configFilePath, JSON.stringify(config2, null, 2) + "\n");
}
function getChangelogEntry(version) {
  const changelog = readFileSync("./CHANGELOG.md", "utf-8").split("\n");
  const start = 2 + changelog.indexOf(`## ${version}`);
  const end = start + 1 + changelog.slice(start + 1).findIndex((line) => line.startsWith("## "));
  const section = changelog.slice(start, end);
  return section.join("\n");
}
function getGithubKit() {
  if (!_octokit)
    _octokit = getOctokit(process.env.GITHUB_TOKEN);
  return _octokit;
}
