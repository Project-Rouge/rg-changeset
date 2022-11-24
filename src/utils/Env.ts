export const Env = {
  /** branch this action is running on */
  thisBranch: process.env.GITHUB_REF_NAME as string,
  /** branch targeted on PR */
  thisPrBranch: process.env.GITHUB_BASE_REF as string,
}