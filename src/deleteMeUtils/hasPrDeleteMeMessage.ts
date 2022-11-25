import { deleteMeMessage } from "./deleteMePrMessage";
import { getPR } from "../utils/getPR";

/** has PR the DELETE ME message */
export async function hasPrDeleteMeMessage({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {

  const pr = (await getPR({ baseBranch, prBranch }))!;

  const message = deleteMeMessage(prBranch);

  return (pr.body || '').includes(message);

}