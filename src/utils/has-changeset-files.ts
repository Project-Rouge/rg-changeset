import { existsSync, readdirSync } from 'fs';
import { getJson } from './getJson';

/** returns true if there are changeset files */
export function hasChangesetFiles() {
  const folder = '.changeset';
  /** files ending with .md */
  const ignore: string[] = [];
  if (existsSync('.changeset/pre.json')) {
    ignore.push(...getJson('.changeset/pre.json').changesets);
  }
  const regex = /^(?!README).+\.md$/;
  const items = readdirSync(folder, { withFileTypes: true });
  for (const item of items) {
    if (item.isFile() && regex.test(item.name) && !ignore.includes(item.name)) return true;
  }
  return false;
}