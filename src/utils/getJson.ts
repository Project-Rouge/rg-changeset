import { readFileSync } from 'fs';

export function getJson(file = './package.json') {
  return JSON.parse(readFileSync(file, 'utf-8'));
}
