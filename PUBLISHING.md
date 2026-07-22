# Publishing checklist

A manual, step-by-step guide to shipping `dados-br-faker` to npm. The first
release is done by hand; subsequent releases are automated with Changesets.

## 0. One-time repository setup

1. Create the GitHub repository and push `main`.
2. Add the npm token as a repository secret so the release workflow can publish:
   - Create an **Automation** token at npmjs.com → _Access Tokens_ (or a
     Granular token scoped to publish this package).
   - GitHub → repo **Settings → Secrets and variables → Actions → New repository
     secret**: name it `NPM_TOKEN`, paste the token.
3. (Optional) Update the badges: in both READMEs, the CI badge expects
   `https://github.com/<OWNER>/dados-br-faker/actions/workflows/ci.yml/badge.svg`
   — replace `<OWNER>` with your GitHub user/org.

## 1. Pre-flight (local)

```bash
pnpm install
pnpm check      # typecheck + lint + tests — must be green
pnpm build      # produces dist/ (ESM + CJS + .d.ts)
```

Verify the tarball contents before publishing:

```bash
npm pack --dry-run
# Expect only: dist/**, README.md, LICENSE, package.json
```

Confirm the name is available (first release only):

```bash
npm view dados-br-faker   # should 404 the first time
```

## 2. First release — v0.2.0 (manual)

```bash
npm login                        # authenticate your npm account
npm publish --access public      # prepublishOnly rebuilds dist automatically
```

## 3. Post-publish verification

```bash
npm view dados-br-faker version  # should print 0.2.0

# Smoke-test in a clean project:
mkdir /tmp/dbf-esm && cd /tmp/dbf-esm && npm init -y && npm i dados-br-faker
node --input-type=module -e "import {createFaker} from 'dados-br-faker'; console.log(createFaker({seed:1}).pessoa().endereco.cep)"

mkdir /tmp/dbf-cjs && cd /tmp/dbf-cjs && npm init -y && npm i dados-br-faker
node -e "const {cpf, validarCpf} = require('dados-br-faker'); console.log(validarCpf(cpf()))"
```

Both should run without errors (ESM import and CJS require).

## 4. Subsequent releases (automated)

1. For each user-facing change, add a changeset: `pnpm changeset`.
2. Merge to `main`. The **Release** workflow opens a "Version Packages" PR that
   bumps the version and updates `CHANGELOG.md`.
3. Merge that PR → the workflow runs `pnpm release` (`changeset publish`) and
   publishes the new version to npm with provenance.

## Rollback

`npm` does not allow re-publishing a version. If a bad version ships:

```bash
npm deprecate dados-br-faker@<bad-version> "Use <good-version> instead"
```

Then release a fixed version through the normal flow.
