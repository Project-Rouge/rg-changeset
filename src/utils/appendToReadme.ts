import { context } from "@actions/github";
import { appendFileSync, readFileSync } from "fs";
import { getJson } from "./getJson";

export function appendToReadme(branch: string) {

  const pkg = getJson();

  appendFileSync('./README.md', '\n\n:octocat: Created by github-bot. Delete this line to trigger PR actions');
  const readmeLine = readFileSync('./README.md', 'utf-8').split('\n').length;

  return `\n\n:octocat: Delete [bot footnote](https://github.com/${context.repo.owner}/${context.repo.repo}/blob/${branch}/README.md?plain=1#L${readmeLine - 1}-L${readmeLine}) to trigger PR actions`;

}