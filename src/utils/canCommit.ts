import { getExecOutput } from "@actions/exec";

/** check if there are files that can be committed */
export async function canCommit() {
  let itCan = (await getExecOutput('git diff', [], { silent: true })).stdout.trim().length !== 0;
  itCan = itCan || (await getExecOutput('git ls-files -o --exclude-standard', [], { silent: true })).stdout.trim().length !== 0;
  return itCan;
}