import { context } from "@actions/github";
import { deleteFile } from "./addDeleteMeFile";

export function deleteMeMessage(branch: string, onlyMainMessage = false) {
  const mainMessage = `:octocat: Delete [action note](https://github.com/${context.repo.owner}/${context.repo.repo}/delete/${branch}/${deleteFile}) before merging.`;
  if (onlyMainMessage) return mainMessage;
  return [
    "\n\n:warning::warning::warning:",
    mainMessage,
    "This message will disappear automatically after deleting the file with the next GH action check.",
    ":warning::warning::warning:",
  ].join('\n\n').normalize();
}