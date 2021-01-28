import * as DataTrue from "@datatrue/api";
import { Table } from "console-table-printer";
import open from "open";
import { Argv } from "yargs";

export const command = ["account", "a"];
export const desc = "interact with accounts";
export const builder = (yargs: Argv): Argv => {
  return yargs
    .command("ls", "list accounts", yargs => {
      return yargs
        .option("steps-total", {
          alias: "t",
          type: "boolean",
          describe: "show steps total",
          default: false,
        })
        .option("steps-used", {
          alias: "u",
          type: "boolean",
          describe: "show steps used",
          default: false,
        });
    }, argv => {
      DataTrue.Account.getAccounts()
        .then(accounts => {
          const table = new Table({
            sort: (
              row1: { ID: number },
              row2: { ID: number }
            ) => row1.ID - row2.ID,
          });
          const rows: any[] = [];
          accounts.forEach(account => {
            const row: Record<string, any> = {
              ID: account.getResourceID(),
              Name: account.name,
            };

            if (argv["steps-total"]) {
              row["Total Steps"] = account.stepsTotal?.toString();
            }

            if (argv["steps-used"]) {
              row["Used Steps"] = account.stepsUsed?.toString();
            }

            rows.push(row);
          });
          if (rows.length) {
            table.addRows(rows);
            table.printTable();
          }
        })
        .catch(() => {
          console.error("Failed to list accounts");
          process.exitCode = 1;
        });
    })
    .command("view <account>", "view an account", yargs => {
      return yargs
        .positional("account", {
          type: "number",
          describe: "the ID of the account to view",
          demandOption: true,
        })
        .option("web", {
          alias: "w",
          type: "boolean",
          describe: "open the account in your web browser",
        });
    }, async argv => {
      try {
        if (argv.web) {
          await open(
            `${DataTrue.config.apiEndpoint}/update_current_account/${argv.account}`
          );
        } else {
          const account = await DataTrue.Account.fromID(argv.account);
          console.log(JSON.stringify(await account.toJSON(), undefined, 2));
        }
      } catch (e) {
        console.error(`Failed to open account ${argv.account}`);
        process.exitCode = 1;
      }
    })
    .demandCommand()
    .help()
    .alias("help", "h");
};
export const handler = (): any => { };
