import { context } from "@actions/github";
import { deleteFile } from "./addDeleteMeFile";

export function deleteMeMessage(branch: string) {
  return [
    "\n\n:warning::warning::warning:",
    `:octocat: Delete [bot note](https://github.com/${context.repo.owner}/${context.repo.repo}/blob/${branch}/${deleteFile}) before merging.`,
    ":warning::warning::warning:",
  ].join('\n\n');
}