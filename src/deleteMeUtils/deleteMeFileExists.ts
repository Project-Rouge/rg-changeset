import { existsSync } from "fs";
import { deleteFile } from "./addDeleteMeFile";

/** check if DELETE_ME.md file exists */
export function deleteMeFileExists() {
  return existsSync(deleteFile);
}