import * as DataTrue from "@datatrue/api";
import { MultiBar } from "cli-progress";
import { Table } from "console-table-printer";
import open from "open";
import restoreCursor from "restore-cursor";
import { Argv } from "yargs";
import { cp, mv, progress, rm } from "../util";

export const command = ["test", "t"];
export const description = "interact with tests";
export const builder = (yargs: Argv): Argv => {
  return yargs
    .command("run <tests..>", "run tests", yargs => {
      return yargs
        .positional("tests", {
          type: "number",
          array: true,
          describe: "the IDs of the tests to run",
          demandOption: true,
        })
        .option("follow", {
          alias: "f",
          type: "boolean",
          describe: "view the progress of the test as they run",
          default: false,
        })
        .option("email-users", {
          alias: "e",
          type: "number",
          array: true,
          describe: "IDs of the users you want to receive an email containing the test results",
          default: [] as number[],
        })
        .option("variables", {
          alias: "V",
          type: "string",
          describe: "variables to set for the test run",
          default: {} as Record<string, string>,
        });
    }, argv => {
      restoreCursor();

      const multiBar = new MultiBar({
        autopadding: true,
        format: "[{bar}] {percentage}% | {duration_formatted} | {status} | {id}: {name}",
        hideCursor: true,
        stopOnComplete: true,
      });

      argv.tests.forEach(testID => {
        const testPromise = DataTrue.Test.fromID(testID);
        const runPromise = testPromise.then(test => test.run(
          argv["email-users"],
          argv.variables
        ));

        Promise.all([testPromise, runPromise])
          .then(([test, _]) => {
            if (argv.follow) {
              progress(test, multiBar);
            }
          })
          .catch((e: Error) => {
            console.error(e.message);
            process.exitCode = 1;
          });
      });
    })
    .command("ls <suite>", "list tests within a suite", yargs => {
      return yargs
        .positional("suite", {
          type: "number",
          describe: "the ID of the suite to list tests for",
          demandOption: true,
        });
    }, argv => {
      DataTrue.Suite.fromID(argv.suite)
        .then(suite => {
          return suite.getTests();
        })
        .then(tests => {
          const table = new Table();
          const rows: any[] = [];
          tests.forEach(test => {
            const row: Record<string, any> = {
              ID: test.getResourceID(),
              Name: test.name,
              "Test Type": DataTrue.TestTypes[test.testType],
            };

            rows.push(row);
          });
          if (rows.length) {
            table.addRows(rows);
            table.printTable();
          }
        })
        .catch(() => {
          console.error(`Unable to list tests for suite ${argv.suite}`);
          process.exitCode = 1;
        });
    })
    .command("cp <test> <suite>", "copy a test", yargs => {
      return yargs
        .positional("test", {
          type: "number",
          describe: "the ID of the test to copy",
          demandOption: true,
        })
        .positional("suite", {
          type: "number",
          describe: "the ID of the suite to copy the test to",
          demandOption: true,
        });
    }, argv => {
      return cp(DataTrue.Test, "test", "suite", argv.test, argv.suite);
    })
    .command("mv <test> <suite>", "move a test", yargs => {
      return yargs
        .positional("test", {
          type: "number",
          describe: "the ID of the test to move",
          demandOption: true,
        })
        .positional("suite", {
          type: "number",
          describe: "the ID of the suite to move the test to",
          demandOption: true,
        });
    }, argv => {
      return mv(DataTrue.Test, "test", "suite", argv.test, argv.suite);
    })
    .command("rm <tests..>", "delete tests", yargs => {
      return yargs
        .positional("tests", {
          type: "number",
          array: true,
          describe: "the IDs of the tests to delete",
          demandOption: true,
        });
    }, argv => {
      return rm(DataTrue.Test, argv.tests);
    })
    .command("view <test>", "view a test", yargs => {
      return yargs
        .positional("test", {
          type: "number",
          describe: "the ID of the test to view",
          demandOption: true,
        })
        .option("web", {
          alias: "w",
          type: "boolean",
          describe: "open the test in your web browser",
        });
    }, async argv => {
      if (argv.web) {
        open(`${DataTrue.config.apiEndpoint}/tests/${argv.test}`)
          .catch(() => {
            console.error(`Failed to open test ${argv.test}`);
            process.exitCode = 1;
          });
      } else {
        const test = await DataTrue.Test.fromID(argv.test);
        console.log(JSON.stringify(await test.toJSON(), undefined, 2));
      }
    })
    .demandCommand()
    .help()
    .alias("help", "h");
};
export const handler = (): any => { };
