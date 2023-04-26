import { readdirSync } from 'fs';

/** returns true if there are changeset files */
export function hasChangesetFiles() {
  const folder = '.changeset';
  /** files ending with .md */
  const regex = /^(?!README).+\.md$/;
  const items = readdirSync(folder, { withFileTypes: true });
  for (const item of items) {
    if (item.isFile() && regex.test(item.name)) return true;
  }
  return false;
}