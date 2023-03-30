import { existsSync } from "fs";

export function isInPreReleaseMode() {
  return existsSync('.changeset/pre.json')
}