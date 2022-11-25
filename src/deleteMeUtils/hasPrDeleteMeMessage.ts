import { context } from "@actions/github";
import { getPR } from "../utils/getPR";
import { deleteMeMessage } from "./deleteMePrMessage";

/** has PR the DELETE ME message */
export async function hasPrDeleteMeMessage({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {

  const pr = (await getPR({ baseBranch, prBranch }))!;

  console.log(`prBranch: ${prBranch}`);
  console.log(`baseBranch: ${baseBranch}`);
  console.log(`process.env.GITHUB_REF_NAME: ${process.env.GITHUB_REF_NAME}`);
  console.log(`process.env.GITHUB_BASE_REF: ${process.env.GITHUB_BASE_REF}`);
  console.log(`process.env.GITHUB_REF: ${process.env.GITHUB_REF}`);
  console.log(`process.env.GITHUB_HEAD_REF: ${process.env.GITHUB_HEAD_REF}`);
  console.log(`context.ref: ${context.ref}`);

  const message = deleteMeMessage(prBranch);

  console.log(pr.body);
  console.log('--vs--');
  console.log(message);

  const body = pr.body || '';

  const hasMessage = body.includes(message);

  return hasMessage;

}