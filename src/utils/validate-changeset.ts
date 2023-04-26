import { getExecOutput } from '@actions/exec';

/** this will throw an error if the changeset files are not formatted correctly */
export async function validateChangeset() {
  await getExecOutput(`yarn changeset status`);
}