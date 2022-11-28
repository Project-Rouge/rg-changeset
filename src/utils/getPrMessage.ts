import { Globals } from "./Globals";

export enum PrType {
  release,
  sync,
}

export function getPrMessage(branch: string, prType = PrType.release) {

  if (prType === PrType.release) return [
    `This PR was opened by the ${Globals.mdLink} GitHub action. When you're ready to do a release, you can merge this and the packages will be published to npm automatically. If you're not ready to do a release yet, that's fine, whenever you add more changesets to \`${branch}\`, this PR will be updated.`
  ].join('\n')

  return [
    `This PR was opened by the ${Globals.mdLink} GitHub action. When you're ready to sync \`main\` into \`next\`, you can merge this. If you're not ready to sync these branches yet, that's fine, whenever you add more changes to \`${branch}\`, this PR will be updated.`,
    `If this PR has conflicts, follow [these instructions](${Globals.actionRepo}/blob/main/docs/main-to-next-conflicts.md) to solve them.`
  ].join('\n')


}