import { getExecOutput } from "@actions/exec";

export async function canCommit() {
  return (await getExecOutput('git diff', [], {silent: true})).stdout.trim().length !== 0
}