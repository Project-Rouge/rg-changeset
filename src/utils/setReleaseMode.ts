import { exec } from '@actions/exec';
import { existsSync } from 'fs';
import { catchErrorLog } from "./catchErrorLog";

/** enter/exit pre release mode */
export async function setReleaseMode(asBranch: string) {
  try {
    const isInPreMode = existsSync('./.changeset/pre.json');

    if (isInPreMode && asBranch === 'main') await exec(`yarn changeset pre exit`);

    if (!isInPreMode && asBranch === 'next') await exec(`yarn changeset pre enter next`);
  } catch (e) {
    catchErrorLog(e);
  }
}
