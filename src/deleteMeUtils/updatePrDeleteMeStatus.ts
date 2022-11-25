import { deleteFile } from "./addDeleteMeFile";
import { deleteMeFileExists } from "./deleteMeFileExists";
import { hasPrDeleteMeMessage } from "./hasPrDeleteMeMessage";
import { removePrDeleteMeMessage } from "./removePrDeleteMeMessage";

export async function updatePrDeleteMeStatus({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {
  if (deleteMeFileExists()) throw new Error(`You need to manually delete \`${deleteFile}\``);

  if (await hasPrDeleteMeMessage({ baseBranch, prBranch })) {
    await removePrDeleteMeMessage({ baseBranch, prBranch });
  }
}