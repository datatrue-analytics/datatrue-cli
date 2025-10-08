import * as DataTrue from "@datatrue/api";
import { MultiBar } from "cli-progress";
import { Table } from "console-table-printer";
import restoreCursor from "restore-cursor";
import { Argv } from "yargs";
import { cp, mv, openResource, progress, rm } from "../util";

export const command = ["suite", "s"];
export const desc = "interact with suites";
export const builder = (yargs: Argv): Argv => {
  return yargs
    .command("run <suites..>", "run suites", yargs => {
      return yargs
        .positional("suites", {
          type: "number",
          array: true,
          describe: "the IDs of the suites to run",
          demandOption: true,
        })
        .option("concurrent", {
          alias: "c",
          type: "boolean",
          describe: "whether to run the tests individually",
          default: false,
        })
        .option("follow", {
          alias: "f",
          type: "boolean",
          describe: "view the progress of the suite as they run",
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
          describe: "variables to set for the suite run",
          default: {} as Record<string, string>,
          coerce: arg => {
            try {
              return JSON.parse(arg) as Record<string, string>;
            } catch {
              throw new Error("Variables must be a valid JSON object");
            }
          }
        });
    }, async argv => {
      restoreCursor();

      const promises: Promise<string | void>[] = [];
      const multiBar = new MultiBar({
        autopadding: true,
        format: "[{bar}] {percentage}% | {duration_formatted} | {status} | {id}: {name}",
        hideCursor: true,
        stopOnComplete: true,
      });

      for (const suiteID of argv.suites) {
        try {
          const suite = await DataTrue.Suite.fromID(suiteID);
          const tests = await suite.getTests();
          if (argv.concurrent) {
            promises.push(...tests.map(test => {
              return test.run(argv["email-users"], argv.variables)
                .then(_ => {
                  if (argv.follow) {
                    progress(test, multiBar);
                  }
                })
                .catch(() => {
                  console.error(
                    `Failed to run test ${test.getResourceID()!} from suite ${suiteID}`
                  );
                  process.exitCode = 1;
                });
            }));
          } else {
            promises.push(suite.run(argv["email-users"], argv.variables)
              .then(_ => {
                if (argv.follow) {
                  progress(suite, multiBar);
                }
              })
              .catch((e: Error) => {
                console.error(e.message);
                process.exitCode = 1;
              }));
          }
        } catch (e) {
          if (e instanceof Error) {
            console.error(e.message);
          }
          process.exitCode = 1;
        }
      }
    })
    .command("ls <account>", "list suites", yargs => {
      return yargs
        .positional("account", {
          type: "number",
          describe: "the ID of the account to list suites for",
          demandOption: true,
        });
    }, argv => {
      DataTrue.Account.fromID(argv.account)
        .then(account => {
          return account.getSuites();
        })
        .then(suites => {
          const table = new Table();
          const rows: any[] = [];
          suites.forEach(suite => {
            const row: Record<string, any> = {
              ID: suite.getResourceID(),
              Name: suite.name,
              "Suite Type": suite.options.suite_type,
            };

            rows.push(row);
          });
          if (rows.length) {
            table.addRows(rows);
            table.printTable();
          }
        })
        .catch(() => {
          console.error(`Unable to list suites for account ${argv.account}`);
        });
    })
    .command("cp <suite> <account>", "copy a suite", yargs => {
      return yargs
        .positional("suite", {
          type: "number",
          describe: "the ID of the suite to copy",
          demandOption: true,
        })
        .positional("account", {
          type: "number",
          describe: "the ID of the account to copy the suite to",
          demandOption: true,
        });
    }, argv => {
      return cp(DataTrue.Suite, "suite", "account", argv.suite, argv.account);
    })
    .command("mv <suite> <account>", "move a suite to a different account", yargs => {
      return yargs
        .positional("suite", {
          type: "number",
          describe: "the ID of the suite to move",
          demandOption: true,
        })
        .positional("account", {
          type: "number",
          describe: "the ID of the account to move the suite to",
          demandOption: true,
        });
    }, argv => {
      return mv(DataTrue.Suite, "suite", "account", argv.suite, argv.account);
    })
    .command("rm <suites..>", "delete suites", yargs => {
      return yargs
        .positional("suites", {
          type: "number",
          array: true,
          describe: "the IDs of the suites to delete",
          demandOption: true,
        });
    }, argv => {
      return rm(DataTrue.Suite, argv.suites);
    })
    .command("view <suite>", "view a suite", yargs => {
      return yargs
        .positional("suite", {
          type: "number",
          describe: "the ID of the suite to view",
          demandOption: true,
        })
        .option("web", {
          alias: "w",
          type: "boolean",
          describe: "open the suite in your web browser",
        });
    }, async argv => {
      try {
        const suite = await DataTrue.Suite.fromID(argv.suite);

        if (argv.web) {
          await openResource(suite);
        } else {
          console.log(JSON.stringify(await suite.toJSON(), undefined, 2));
        }
      } catch (e) {
        console.error(`Failed to open suite ${argv.suite}`);
        process.exitCode = 1;
      }
    })
    .demandCommand()
    .help()
    .alias("help", "h");
};
export const handler = (): any => { };
