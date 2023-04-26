import { exec } from '@actions/exec';
import { hasChangesetFiles } from './has-changeset-files';
import { pipeLog } from './pipeLog';

/** this will throw an error if the changeset files are not formatted correctly */
export async function validateChangeset() {
  pipeLog('validateChangeset');
  if (!hasChangesetFiles()) return;
  await exec(`git fetch origin main:main`);
  await exec(`yarn changeset status`);
}