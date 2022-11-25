import { exec } from "@actions/exec";

interface prepPrBranchProps {
  /** new or existing PR branch */
  prBranch: string,
  /** branch `prBranch` is based on */
  sourceBranch: string,
}

/** create or update branch */
export async function upsertBranch({ sourceBranch, prBranch }: prepPrBranchProps) {

  await exec('git reset --hard');
  await exec(`git checkout ${sourceBranch}`);
  await exec(`git checkout -b ${prBranch}`);
  await exec(`git merge ${sourceBranch} --no-edit --no-commit`);

}