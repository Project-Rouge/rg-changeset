import { getExecOutput } from "@actions/exec";

/** check if there are files that can be committed */
export async function canCommit() {
  return await didChange('git diff --name-only') || await didChange('git ls-files -o --exclude-standard');
}

async function didChange(command: string) {
  const newFiles = (await getExecOutput(command, [], { silent: true }))
    .stdout.trim()
    .split('\n')
    .filter(v => v && v !== '.changeset/pre.json'); // we ignore this file to avoid useless PRs;

  return newFiles.length > 0
}