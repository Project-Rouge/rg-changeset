import { getExecOutput } from "@actions/exec";

export async function canCommit() {
  return (await getExecOutput('git diff', [], {silent: false})).stdout.trim().length !== 0
}