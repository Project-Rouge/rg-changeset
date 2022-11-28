import { deleteMeFileExists } from "./deleteMeFileExists";

export function checkDeleteMeFile() {
  if (deleteMeFileExists()) {
    throw new Error("DELETE_ME.md file found, you need to delete this file in order to do a release");
  }
}