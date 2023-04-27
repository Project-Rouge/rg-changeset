import { readFileSync, readdirSync } from 'fs';
import { pipeLog } from './pipeLog';

/** this will throw an error if the changeset files are not formatted correctly */
export async function validateChangeset() {
  pipeLog('validateChangeset');

  const fileRegex = /^(?!README).+\.md$/;
  const contentRegex: RegExp = /^---\n"((?:@[\w-]+\/)?[\w-]+)": (patch|minor|major)\n---\n\n/;
  const folder = '.changeset';
  const items = readdirSync(folder, { withFileTypes: true });
  for (const item of items) {
    if (!item.isFile()) continue;
    if (!fileRegex.test(item.name)) continue;
    const content = readFileSync(`${folder}/${item.name}`, 'utf-8');
    if (!contentRegex.test(content)) throw new Error(`${item.name} has an invalid format.`);
  }
}