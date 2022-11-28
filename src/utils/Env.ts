export abstract class Env {
  /** branch this action is running on */
  static get thisBranch() { return process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME as string };
  /** branch targeted on PR */
  static get thisPrBranch() { return process.env.GITHUB_BASE_REF as string };
}