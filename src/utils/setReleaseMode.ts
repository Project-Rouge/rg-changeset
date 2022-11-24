import { exec } from '@actions/exec';
import { existsSync } from 'fs';
import { catchErrorLog } from "./catchErrorLog";
import { Env } from './Env';
import { updateChangesetConfig } from "./updateChangesetConfig";

/** enter/exit pre release mode */
export async function setReleaseMode({ forceExit = false } = {}) {
  updateChangesetConfig({ branch: forceExit ? 'main' : Env.thisBranch });
  try {
    const isInPreMode = existsSync('./.changeset/pre.json');

    if (isInPreMode && (forceExit || Env.thisBranch === 'main'))
      await exec(`yarn changeset pre exit`);

    if (!isInPreMode && !forceExit && Env.thisBranch === 'dev')
      await exec(`yarn changeset pre enter next`);
  } catch (e) {
    catchErrorLog(e);
  }
}
