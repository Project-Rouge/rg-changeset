import { exec } from "@actions/exec";

interface commitAndPushProps {
  message?: string,
  branch: string,
}

/** commit and force push */
export async function commitAndPush({ branch, message = `update ${branch}` }: commitAndPushProps) {
  await exec('git add .');
  await exec(`git commit -m "update ${message}"`)
  await exec(`git push origin ${branch} --force`);
}