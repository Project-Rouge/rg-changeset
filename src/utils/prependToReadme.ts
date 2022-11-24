import { context } from "@actions/github";
import { readFileSync, writeFileSync } from "fs";

export function prependToReadme(branch: string) {

  const readmePath = './README.md';

  let readme = readFileSync(readmePath, 'utf-8');

  if (!readme.startsWith(':octocat:')) {
    readme = `:octocat: Created by github-bot. Delete this line to trigger PR actions\n\n${readme}`;
    writeFileSync(readmePath, readme);
  }

  return `\n\n:octocat: Delete [bot note](https://github.com/${context.repo.owner}/${context.repo.repo}/edit/${branch}/README.md#L1-L2) to trigger PR actions`;

}