import { context } from "@actions/github";
import { getPR } from "../utils/getPR";
import { deleteMeMessage } from "./deleteMePrMessage";

/** has PR the DELETE ME message */
export async function hasPrDeleteMeMessage({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {

  const pr = (await getPR({ baseBranch, prBranch }))!;

  const message = deleteMeMessage(prBranch);

  console.log(pr.body);
  console.log('--vs--');
  console.log(message);

  const body = pr.body || '';

  const hasMessage = body.includes(message);

  console.log(`hasMessage: ${hasMessage}`);
  
  console.log(`and now?: ${body.includes(message.trim())}`);
  

  return hasMessage;

}