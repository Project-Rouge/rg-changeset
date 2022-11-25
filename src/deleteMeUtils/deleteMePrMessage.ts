import { context } from "@actions/github";
import { deleteFile } from "./addDeleteMeFile";

export function deleteMeMessage(branch: string, onlyMainMessage = false) {
  const mainMessage = `:octocat: Delete [bot note](https://github.com/${context.repo.owner}/${context.repo.repo}/blob/${branch}/${deleteFile}) before merging.`;
  if (onlyMainMessage) return mainMessage;
  return [
    "\n\n:warning::warning::warning:",
    mainMessage,
    ":warning::warning::warning:",
  ].join('\n\n').normalize();
}