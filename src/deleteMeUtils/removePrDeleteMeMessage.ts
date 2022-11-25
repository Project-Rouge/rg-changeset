import { getPR } from "../utils/getPR";
import { upsertPr } from "../utils/upsertPr";
import { deleteMeMessage } from "./deleteMePrMessage";

export async function removePrDeleteMeMessage({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {

  const pr = (await getPR({ baseBranch, prBranch }))!;

  const coreDeleteMsg = deleteMeMessage(prBranch, true);
  const deleteMsg = deleteMeMessage(prBranch).split('\n');
  const deleteMsgCoreIndex = deleteMsg.indexOf(coreDeleteMsg);

  const bodySplit = pr.body!.split('\n');
  const messageIndex = bodySplit.indexOf(coreDeleteMsg);

  bodySplit.splice(messageIndex - deleteMsgCoreIndex, deleteMsg.length);

  const body = bodySplit.join('\n');

  console.log('body after removing bot message');
  console.log(body);

  await upsertPr({
    baseBranch,
    prBranch,
    title: pr.title,
    body,
  })

}