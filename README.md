# rg-changeset

Github action to handle changesets in `rg-suite`.

:package: [npm](https://www.npmjs.com/package/@project-rouge/rg-changeset)

The NPM package does nothing, but is a quick way to test that the release process works.


## How to use

In your PR github actions add this at the end.

```yml
- uses: project-rouge/rg-changeset@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

In your main and dev branches on merge action, make sure you have a build ready to be packed.

Then add this.

```yml
- uses: project-rouge/rg-changeset@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
