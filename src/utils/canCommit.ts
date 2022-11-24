import { getExecOutput } from "@actions/exec";

export async function canCommit() {
  return (await getExecOutput('git diff')).stdout.trim().length !== 0
}