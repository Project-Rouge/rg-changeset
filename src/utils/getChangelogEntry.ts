import { readFileSync } from 'fs';

export function getChangelogEntry(version: string) {
  const changelog = readFileSync('./CHANGELOG.md', 'utf-8').split('\n');
  const start = 2 + changelog.indexOf(`## ${version}`);
  const end = start + 1 + changelog.slice(start + 1).findIndex(line => line.startsWith('## '));
  const section = changelog.slice(start, end);
  return section.join('\n');
}
