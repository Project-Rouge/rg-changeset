import { getOctokit } from '@actions/github';

let _octokit: ReturnType<typeof getOctokit>;

export function getGithubKit() {
  if (!_octokit)
    _octokit = getOctokit(process.env.GITHUB_TOKEN as string);
  return _octokit;
}
