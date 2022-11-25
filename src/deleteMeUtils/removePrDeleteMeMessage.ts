import { getPR } from "../utils/getPR";
import { upsertPr } from "../utils/upsertPr";
import { deleteMeMessage } from "./deleteMePrMessage";

export async function removePrDeleteMeMessage({ baseBranch, prBranch }: { baseBranch: string; prBranch: string; }) {

  const pr = (await getPR({ baseBranch, prBranch }))!;

  const body = pr.body!.replace(deleteMeMessage(prBranch), '');

  await upsertPr({
    baseBranch,
    prBranch,
    title: pr.title,
    body,
  })

}