import * as DataTrue from "@datatrue/api";
import { Table } from "console-table-printer";
import { Argv } from "yargs";
import { cp, mv, openResource, rm } from "../util";

export const command = ["data-layer-validation", "dlv"];
export const desc = "interact with data layer validations";
export const builder = (yargs: Argv): Argv => {
  return yargs
    .command("ls <step>", "display data layer validations", yargs => {
      return yargs
        .positional("step", {
          type: "number",
          describe: "the ID of the step to list data layer validations for",
          demandOption: true,
        })
        .option("enabled", {
          alias: "e",
          type: "boolean",
          describe: "display enabled",
          default: false,
        })
        .option("source", {
          alias: "o",
          type: "boolean",
          describe: "display source",
          default: false,
        })
        .option("selector", {
          alias: "s",
          type: "boolean",
          describe: "display selector",
          default: false,
        })
        .option("selector-type", {
          alias: "S",
          type: "boolean",
          describe: "display selector type",
          default: false,
        })
        .option("iframe-selector", {
          alias: "i",
          type: "boolean",
          describe: "display iframe selector",
          default: false,
        })
        .option("iframe-selector-type", {
          alias: "I",
          type: "boolean",
          describe: "display iframe selector type",
          default: false,
        })
        .option("attr", {
          alias: "a",
          type: "boolean",
          describe: "display attr",
          default: false,
        })
        .option("cookie-name", {
          alias: "c",
          type: "boolean",
          describe: "display cookie name",
          default: false,
        })
        .option("js-variable-name", {
          alias: "j",
          type: "boolean",
          describe: "display js variable name",
          default: false,
        })
        .option("regex", {
          alias: "r",
          type: "boolean",
          describe: "display regex",
          default: false,
        })
        .option("variable-name", {
          alias: "n",
          type: "boolean",
          describe: "display variable name",
          default: false,
        })
        .option("validation-enabled", {
          alias: "V",
          type: "boolean",
          describe: "display validation enabled",
          default: false,
        });
    }, argv => {
      DataTrue.Step.fromID(argv.step)
        .then(step => {
          const table = new Table();
          const rows: any[] = [];
          const dataLayerValidations = step.getDataLayerValidations();
          dataLayerValidations.forEach(dataLayerValidation => {
            const row: Record<string, any> = {
              ID: dataLayerValidation.getResourceID(),
              Name: dataLayerValidation.name,
            };

            if (argv.enabled) {
              row["Enabled"] = dataLayerValidation.options.enabled;
            }

            if (argv.source) {
              row["Source"] = dataLayerValidation.options.source;
            }

            if (argv.selector) {
              row["Selector"] = dataLayerValidation.options.selector;
            }

            if (argv["selector-type"]) {
              row["Selector Type"] = dataLayerValidation.options.selector_type;
            }

            if (argv["iframe-selector"]) {
              row["IFrame Selector"] = dataLayerValidation.options.iframe_selector;
            }

            if (argv["iframe-selector-type"]) {
              row["IFrame Selector Type"] = dataLayerValidation.options.iframe_selector_type;
            }

            if (argv.attr) {
              row["Attr"] = dataLayerValidation.options.attr;
            }

            if (argv["cookie-name"]) {
              row["Cookie Name"] = dataLayerValidation.options.cookie_name;
            }

            if (argv["js-variable-name"]) {
              row["JS Variable Name"] = dataLayerValidation.options.js_variable_name;
            }

            if (argv.regex) {
              row["Regex"] = dataLayerValidation.options.regex;
            }

            if (argv["variable-name"]) {
              row["Variable Name"] = dataLayerValidation.options.variable_name;
            }

            if (argv["validation-enabled"]) {
              row["Validation Enabled"] = dataLayerValidation.options.validation_enabled;
            }

            rows.push(row);
          });
          if (rows.length) {
            table.addRows(rows);
            table.printTable();
          }
        }).catch(() => {
          console.error(
            `Unable to list data layer validations for step ${argv.step}`
          );
          process.exitCode = 1;
        });
    })
    .command("cp <data-layer-validation> <step>", "copy a data layer validation", yargs => {
      return yargs
        .positional("data-layer-validation", {
          type: "number",
          describe: "the ID of the data layer validation to copy",
          demandOption: true,
        })
        .positional("step", {
          type: "number",
          describe: "the ID of the step to copy the data layer validation to",
          demandOption: true,
        });
    }, argv => {
      return cp(
        DataTrue.DataLayerValidation,
        "data layer validation",
        "step",
        argv["data-layer-validation"],
        argv.step
      );
    })
    .command("mv <data-layer-validation> <step>", "move a data layer validation", yargs => {
      return yargs
        .positional("data-layer-validation", {
          type: "number",
          describe: "the ID of the data layer validation to move",
          demandOption: true,
        })
        .positional("step", {
          type: "number",
          describe: "the ID of the step to move the data layer validation to",
          demandOption: true,
        });
    }, argv => {
      return mv(
        DataTrue.DataLayerValidation,
        "data layer validation",
        "step",
        argv["data-layer-validation"],
        argv.step
      );
    })
    .command("rm <data-layer-validations..>", "delete data layer validations", yargs => {
      return yargs
        .positional("data-layer-validations", {
          type: "number",
          array: true,
          describe: "the IDs of the data layer validations to delete",
          demandOption: true,
        });
    }, argv => {
      return rm(DataTrue.DataLayerValidation, argv["data-layer-validations"]);
    })
    .command("view <data-layer-validation>", "view a data layer validation", yargs => {
      return yargs
        .positional("data-layer-validation", {
          type: "number",
          describe: "the ID of the data layer validation to view",
          demandOption: true,
        })
        .option("web", {
          alias: "w",
          type: "boolean",
          describe: "open the data layer validation in your web browser",
        });
    }, async argv => {
      try {
        const dataLayerValidation = await DataTrue.DataLayerValidation.fromID(
          argv["data-layer-validation"]
        );

        if (argv.web) {
          await openResource(dataLayerValidation);
        } else {
          console.log(
            JSON.stringify(await dataLayerValidation.toJSON(), undefined, 2)
          );
        }
      } catch (e) {
        console.error(
          `Failed to open data layer validation ${argv["data-layer-validation"]}`
        );
        process.exitCode = 1;
      }
    })
    .demandCommand()
    .help()
    .alias("help", "h");
};
export const handler = (): any => { };
