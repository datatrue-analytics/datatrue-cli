# datatrue-cli

CLI to interact with DataTrue.

- [datatrue-cli](#datatrue-cli)
  - [Install](#install)
  - [Usage](#usage)
    - [Accounts](#accounts)
    - [Data Layer Validations](#data-layer-validations)
    - [Steps](#steps)
    - [Suites](#suites)
    - [Tag Validations](#tag-validations)
    - [Tests](#tests)

## Install

```sh
$ npm i @datatrue/cli -g
```

## Usage

Your DataTrue user API token must be specified either using the `--user-token`
option or the `DATATRUE_USER_TOKEN` environment variable.

```sh
$ dt --help
dt

interactive mode

Commands:
  dt                         interactive mode                          [default]
  dt account                 interact with accounts                 [aliases: a]
  dt data-layer-validation   interact with data layer validations [aliases: dlv]
  dt step                    interact with steps                   [aliases: st]
  dt suite                   interact with suites                   [aliases: s]
  dt tag-validation          interact with tag validations         [aliases: tv]
  dt test                    interact with tests                    [aliases: t]
  dt completion              generate completion script

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

### Accounts

```sh
$ dt account --help
dt account

interact with accounts

Commands:
  dt account ls              list accounts
  dt account view <account>  view an account

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

### Data Layer Validations

```sh
$ dt data-layer-validations --help
dt data-layer-validations

interact with data layer validations

Commands:
  dt data-layer-validations ls <step>       display data layer validations
  dt data-layer-validations cp              copy a data layer validation
  <data-layer-validation> <step>
  dt data-layer-validations mv              move a data layer validation
  <data-layer-validation> <step>
  dt data-layer-validations rm              delete data layer validations
  <data-layer-validations..>
  dt data-layer-validations view            view a data layer validation
  <data-layer-validation>

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

### Steps

```sh
$ dt step --help
dt step

interact with steps

Commands:
  dt step ls <test>         list steps within a test
  dt step cp <step> <test>  copy a step
  dt step mv <step> <test>  move a step
  dt step rm <steps..>      delete steps
  dt step view <step>       view a step

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

### Suites

```sh
$ dt suite --help
dt suite

interact with suites

Commands:
  dt suite run <suites..>        run suites
  dt suite ls <account>          list suites
  dt suite cp <suite> <account>  copy a suite
  dt suite mv <suite> <account>  move a suite to a different account
  dt suite rm <suites..>         delete suites
  dt suite view <suite>          view a suite

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

### Tag Validations

```sh
$ dt tag-validation --help
dt tag-validation

interact with tag validations

Commands:
  dt tag-validation ls <parent>             list tag validations
  dt tag-validation cp <tag-validation>     copy a tag validation
  <parent>
  dt tag-validation mv <tag-validation>     move a tag validation
  <parent>
  dt tag-validation rm <tag-validations..>  delete tag validations
  dt tag-validation view <tag-validation>   view a tag validation

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```

### Tests

```sh
$ dt test --help
dt test

interact with tests

Commands:
  dt test run <tests..>      run tests
  dt test ls <suite>         list tests within a suite
  dt test cp <test> <suite>  copy a test
  dt test mv <test> <suite>  move a test
  dt test rm <tests..>       delete tests
  dt test view <test>        view a test

Options:
  -U, --user-token  your DataTrue user API token             [string] [required]
  -H, --host        the DataTrue host you wish to connect to
                                       [string] [default: "http://datatrue.com"]
  -v, --version     Show version number                                [boolean]
  -h, --help        Show help                                          [boolean]
```
