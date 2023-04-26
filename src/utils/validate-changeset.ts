import { getExecOutput } from '@actions/exec';
import { pipeLog } from './pipeLog';

/** this will throw an error if the changeset files are not formatted correctly */
export async function validateChangeset() {
  pipeLog('validateChangeset');
  await getExecOutput(`yarn changeset status`);
}