import { pipeLog } from "../utils/pipeLog";
import { deleteFile } from "./addDeleteMeFile";
import { deleteMeFileExists } from "./deleteMeFileExists";
import { hasPrDeleteMeMessage } from "./hasPrDeleteMeMessage";
import { removePrDeleteMeMessage } from "./removePrDeleteMeMessage";

export async function updatePrDeleteMeStatus({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {
  pipeLog('deleteMeFileExists');
  if (deleteMeFileExists()) throw new Error(`You need to manually delete \`${deleteFile}\``);

  pipeLog('hasPrDeleteMeMessage');
  if (await hasPrDeleteMeMessage({ baseBranch, prBranch })) {
    pipeLog('removePrDeleteMeMessage');
    await removePrDeleteMeMessage({ baseBranch, prBranch });
  }
}