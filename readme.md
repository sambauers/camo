# Contentful Active Migration Organiser

Contentful Active Migration Organiser (CAMO) is a command line tool inspired by
[Ruby on Rails' Active Record migration](https://guides.rubyonrails.org/active_record_migrations.html)
methodology. It is designed to make the management of Contentful schema changes
easier while supplying some additional visibility on migration activity in the
Contentful interface.

CAMO uses a content type in Contentful itself where it stores details of each
migration that has been appiled to the target Contentful environment. It uses
some basic logic to assist with understanding whether a migration script should
be run or not, and it offers options to selectively run specific migrations.

Before using CAMO, you should be familiar with
[scripting Contentful migrations](https://www.contentful.com/developers/docs/tutorials/cli/scripting-migrations/).

## Install

### Install the NPM library

You can install CAMO as a development dependency in a discrete repository or in
your Contentful-based project repository.

For `npm` that looks like this:

```sh
# npm
$ npm install --save-dev @sambauers/camo

# or yarn
$ yarn add --dev @sambauers/camo

# or pnpm
$ pnpm add --save-dev @sambauers/camo
```

### Add a migrate script to your `package.json`

In your projects `package.json` add a `migrate` script in the `scripts`
definitions:

```json
{
  "scripts": {
    "migrate": "camo"
  }
}
```

### Specify Contentful connection details

CAMO will read `.env` files in your project using the pattern described by the
[dotenv package](https://github.com/motdotla/dotenv).

The relevant environment variables which control Contentful connection details
are:

```sh
# Contentful Active Migration Organiser (CAMO)
# The space ID to connect to
CONTENTFUL_MIGRATION_SPACE_ID='<your-contentful-space-id>'

# The environment ID to connect to
# - 'master' is the default
CONTENTFUL_MIGRATION_ENVIROMENT_ID='master'

# The access token to connect with
CONTENTFUL_MIGRATION_ACCESS_TOKEN='<your-contentful-access-token>'

# The content type ID to store and read the migrations
# - 'contentfulMigration' is the default
CONTENTFUL_MIGRATION_CONTENT_TYPE_ID='<your-contentful-content-type-id>'

# The content type name for the above content type
# - only relevant when creating the content type
# - 'Contentful Migration' is the default
CONTENTFUL_MIGRATION_CONTENT_TYPE_NAME='<your-contentful-content-type-name>'
```

You can set these in other ways too, as long as they end up in the `process.env`
object.

Alternatively, you can specify these values on the command line itself through
the equivalent command line options - see the CLI options in this document.

### Set up and specify the local migrations directory

The default directory to store local migrations scripts is a directory named
`migrations` in your project's root directory.

As above, you can add an enviroment variable to specify a custom directory that
contains local migration scripts, but unlike the above settings specifying the
migration directory on the command line is not possible.

```sh
# The local directory containing Contentful migration scripts
# - can be canonical (full) path or…
# - relative to the root of your repository (the location of package.json)
CONTENTFUL_MIGRATION_LOCAL_DIRECTORY='<path-to-your-local-migration-directory>'
```

If you have an existing Contentful schema, it will be ignored. The only tracking
of migrations that will occur will be from the point of installation of CAMO
onwards.

## Writing migrations

Once your local migrations directory is set up, you can add migration scripts to
it. The filenames for the migrations should be of this form:

```
[id]-[name].[extension]
```

### ID

The ID should be a unique numeric (integer) value. The IDs of the migration
files should be sequential, in the order that the migrations should be run.
Usually your newest migration will have the highest number.

### Name

The name should be descriptive of the change the migration will be making. Try
to keep migrations to one effect per file, or at least one set of logically
grouped interdependant changes per file.

### Extension

This tool is written in Typescript, and tested using Typescript migrations, so
`ts` is the prefered extension and language to use for your migrations. Plain
old Javascript `js` should work too though.

## CLI

### Command line options

You can access descriptions of all command line options by running CAMO with the
`--help` option:

```sh
# npm
$ npm run migrate --help

# or yarn
$ yarn migrate --help

# or pnpm
$ pnpm migrate --help
```

Note: This guide will just show commands using `npm` from here on, but you can
use your preferred package manager.

### Specifying individual migrations in command line options

Some command line options accept one or more specific migration files as
parameters. You can specify a migration in these situations in any mix of these
ways:

#### ID

Just specify the numeric ID of the migration, which is the same as thi filename
prefix.

#### Base name

This is the migration filename, without the extension.

#### File name

This is the full file name, without the path.

### Create migrations content type

Whenever you run CAMO, it will attempt to connect to the Contentful service and
while doing that it will check for the presence of the migrations content type.

If it does not find it, CAMO will ask you if you want to create it.

The safest way to trigger this process is to run a "list" command:

```sh
$ npm run migrate --list
```

The list returned by this command will probably be empty, but check the full
output to make sure that the content type was created.

### List migrations

You can list the status of migrations, including your local migration files, and
the migrations registered in Contentful.

Be aware that this simply checks the migration content type, and does no
checking to see if the migration was actually applied, or remains applied. It
simply looks for the migration entry in Contentful, and compares the filename
to the local set of migrations in your local migrations directory.

The most basic migration list grabs all migrations from all sources:

```sh
$ npm run migrate --list
```

You can also filter the list using some keywords:

```sh
# Narrow down list to only show migrations that exist in the local directory
$ npm run migrate --list local

# Only show migrations that are registered in Contentful
$ npm run migrate --list registered

# Only show migrations that are both local and registered
$ npm run migrate --list local registered

# Only show migrations that are local abut not registered in Contentful
$ npm run migrate --list unregistered
```

You can even list one or more migrations where you know their IDs or filenames:

```sh
# Just show the status of one migration
$ npm run migrate --list 210-add-author-to-post

# Show the status of many migrations
$ npm run migrate --list 210-add-author-to-post 105-add-posts.ts 240
```

### Apply migrations

By default, CAMO will run all the migrations in the migrations directory that
have not yet been applied on the target Contentful environment. It simply looks
at the migration content type in the target environment to determine what has
been applied and compares that to the migration scripts stored in the local
directory.

```sh
# Apply all local migrations that have not already been applied
$ npm run migrate
```

You can also select specific migrations to run where you know their IDs or
filenames:

```sh
# Apply a single selected migration
$ npm run migrate --migrations 110-add-tags-to-posts.ts

# Apply multiple selected migrations
$ npm run migrate --migrations 105-add-posts.ts 110 120-remove-author-title
```

If any of the requested migrations are already applied to the target Contentful
environment you will be asked to confirm whether you want to attempt to reapply
them.

There is also a "dry run" mode which allows you to test your migration settings
and parameters without impacting the Contentful target environment. Note that
CAMO will still attempt to set up the migrations content type if it is not
present.

```sh
# See a list of all the migrations that would have been applied
$ npm run migrate --dry
```

The `--dry` option can also be used when specifying migrations using the
`--migrations` option.
