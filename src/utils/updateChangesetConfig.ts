import { writeFileSync } from 'fs';
import { Env } from './Env';
import { getJson } from "./getJson";

export function updateChangesetConfig({ branch = Env.thisBranch }) {
  const configFilePath = '.changeset/config.json';
  const config = getJson(configFilePath);
  config.baseBranch = branch;
  writeFileSync(configFilePath, JSON.stringify(config, null, 2) + '\n');
}
