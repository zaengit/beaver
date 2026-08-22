# @zbeaver/create-beaver

Interactive project initializer for Beaver CMS.

```bash
npm create @zbeaver/beaver
```

The wizard asks for the project folder, starter template, package manager, and
initial Super Admin credentials. It then generates the configuration, installs
the Astro/Beaver dependencies, runs the database migration, seeds the base
roles and permissions, imports the selected template data, and prints the local
website and admin URLs.

For CI or scripted setup, pass options after `--`:

```bash
npm create @zbeaver/beaver -- --yes --project my-site
```

The initializer is backed by `@zbeaver/beaver`, which remains the runtime CMS
package used by the generated project.
