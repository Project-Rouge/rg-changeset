import { getPR } from "../utils/getPR";
import { deleteMeMessage } from "./deleteMePrMessage";

/** has PR the DELETE ME message */
export async function hasPrDeleteMeMessage({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {

  const pr = (await getPR({ baseBranch, prBranch }))!;

  const message = deleteMeMessage(prBranch, true);

  const body = pr.body || '';

  const hasMessage = body.includes(message);

  return hasMessage;

}