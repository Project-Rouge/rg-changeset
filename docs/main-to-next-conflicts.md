# Main to next conflicts

If when trying to merge `main` into `next`, there are conflicts, make sure you resolve them as follow:

- `package.json` `version` should always be the one from `main`.
- Make sure `./changeset/pre.json` `changesets` is an empty array.
- Any code conflicts requires developer intervention.