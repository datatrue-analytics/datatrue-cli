import * as DataTrue from "@datatrue/api";
import { Table } from "console-table-printer";
import { Argv } from "yargs";
import { cp, mv, openResource, rm } from "../util";

export const command = ["step", "st"];
export const desc = "interact with steps";
export const builder = (yargs: Argv): Argv => {
  return yargs
    .command("ls <test>", "list steps within a test", yargs => {
      return yargs
        .positional("test", {
          type: "number",
          describe: "the ID of the test to list steps for",
          demandOption: true,
        })
        .option("target", {
          alias: "t",
          type: "boolean",
          describe: "display target",
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
        .option("pause", {
          alias: "p",
          type: "boolean",
          describe: "display pause",
          default: false,
        })
        .option("wait-while-present", {
          alias: "w",
          type: "boolean",
          describe: "display wait while present",
          default: false,
        })
        .option("strategy", {
          alias: "a",
          type: "boolean",
          describe: "display strategy",
          default: false,
        })
        .option("obey-robots", {
          alias: "r",
          type: "boolean",
          describe: "display obey robots",
          default: false,
        })
        .option("template-detection", {
          alias: "T",
          type: "boolean",
          describe: "display template detection",
          default: false,
        })
        .option("common-tag-validations", {
          alias: "c",
          type: "boolean",
          describe: "display common tag validations",
          default: false,
        });
    }, argv => {
      DataTrue.Test.fromID(argv.test)
        .then(test => {
          const table = new Table();
          const rows: any[] = [];
          const steps = test.getSteps();
          steps.forEach(step => {
            const row: Record<string, any> = {
              ID: step.getResourceID(),
              Name: step.name,
              "Step Action": step.action,
            };

            if (argv.target) {
              row["Target"] = step.options.target;
            }

            if (argv.selector) {
              row["Selector"] = step.options.selector;
            }

            if (argv["selector-type"]) {
              row["Selector Type"] = step.options.selector_type;
            }

            if (argv["iframe-selector"]) {
              row["IFrame Selector"] = step.options.iframe_selector;
            }

            if (argv["iframe-selector-type"]) {
              row["IFrame Selector Type"] = step.options.iframe_selector_type;
            }

            if (argv.pause) {
              row["Pause"] = step.options.pause?.toString();
            }

            if (argv["wait-while-present"]) {
              row["Wait While Present"] = step.options.wait_while_present;
            }

            if (argv["common-tag-validations"]) {
              row["Use Common Tag Validations"] = step.options.use_common_tag_validations;
            }

            if (argv.strategy) {
              row["Strategy"] = step.options.settings?.strategy;
            }

            if (argv["obey-robots"]) {
              row["Obey Robots"] = step.options.settings?.obey_robots;
            }

            if (argv["template-detection"]) {
              row["Template Detection"] = step.options.settings?.template_detection;
            }

            rows.push(row);
          });
          if (rows.length) {
            table.addRows(rows);
            table.printTable();
          }
        }).catch(() => {
          console.error(`Unable to list steps for test ${argv.test}`);
          process.exitCode = 1;
        });
    })
    .command("cp <step> <test>", "copy a step", yargs => {
      return yargs
        .positional("step", {
          type: "number",
          describe: "the ID of the step to copy",
          demandOption: true,
        })
        .positional("test", {
          type: "number",
          describe: "the ID of the test to copy the step to",
          demandOption: true,
        });
    }, argv => {
      return cp(DataTrue.Step, "step", "test", argv.step, argv.test);
    })
    .command("mv <step> <test>", "move a step", yargs => {
      return yargs
        .positional("step", {
          type: "number",
          describe: "the ID of the step to move",
          demandOption: true,
        })
        .positional("test", {
          type: "number",
          describe: "the ID of the test to move the step to",
          demandOption: true,
        });
    }, argv => {
      return mv(DataTrue.Step, "step", "test", argv.step, argv.test);
    })
    .command("rm <steps..>", "delete steps", yargs => {
      return yargs
        .positional("steps", {
          type: "number",
          array: true,
          describe: "the IDs of the steps to delete",
          demandOption: true,
        });
    }, argv => {
      return rm(DataTrue.Step, argv.steps);
    })
    .command("view <step>", "view a step", yargs => {
      return yargs
        .positional("step", {
          type: "number",
          describe: "the ID of the step to view",
          demandOption: true,
        })
        .option("web", {
          alias: "w",
          type: "boolean",
          describe: "open the step in your web browser",
        });
    }, async argv => {
      try {
        const step = await DataTrue.Step.fromID(argv.step);

        if (argv.web) {
          await openResource(step);
        } else {
          console.log(JSON.stringify(await step.toJSON(), undefined, 2));
        }
      } catch (e) {
        console.error(`Failed to open step ${argv.step}`);
        process.exitCode = 1;
      }
    })
    .demandCommand()
    .help()
    .alias("help", "h");
};
export const handler = (): any => { };
