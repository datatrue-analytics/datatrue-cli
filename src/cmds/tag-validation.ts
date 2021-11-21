import * as DataTrue from "@datatrue/api";
import { Table } from "console-table-printer";
import { Argv } from "yargs";
import { openResource, rm } from "../util";

interface TagValidationParent {
  getTagValidations: () => readonly DataTrue.TagValidation[],
}

interface TagValidationParentResource {
  fromID: (id: number) => Promise<TagValidationParent>,
}

const tagValidationParentTypes: readonly DataTrue.TagValidationContexts[] = [
  DataTrue.TagValidationContexts.STEP,
  DataTrue.TagValidationContexts.TEST,
];

export const command = ["tag-validation", "tv"];
export const desc = "interact with tag validations";
export const builder = (yargs: Argv): Argv => {
  return yargs
    .command("ls <parent>", "list tag validations", yargs => {
      return yargs
        .positional("parent", {
          type: "number",
          describe: "the ID of the parent to list tag validations for",
          demandOption: true,
        })
        .option("parent-type", {
          alias: "p",
          describe: "the type of the parent",
          choices: tagValidationParentTypes,
          default: DataTrue.TagValidationContexts.STEP,
        })
        .option("enabled", {
          alias: "e",
          type: "boolean",
          describe: "display enabled",
          default: false,
        })
        .option("do-validation", {
          alias: "d",
          type: "boolean",
          describe: "display do validation",
          default: false,
        })
        .option("detect-duplicates", {
          alias: "D",
          type: "boolean",
          describe: "display detect duplicates",
          default: false,
        })
        .option("validate-absence", {
          alias: "V",
          type: "boolean",
          describe: "display validate absence",
          default: false,
        })
        .option("hostname-validation", {
          alias: "o",
          type: "boolean",
          describe: "display hostname validation",
          default: false,
        })
        .option("hostname-detection", {
          alias: "O",
          type: "boolean",
          describe: "display hostname detection",
          default: false,
        })
        .option("pathname-validation", {
          alias: "p",
          type: "boolean",
          describe: "display pathname validation",
          default: false,
        })
        .option("pathname-detection", {
          alias: "P",
          type: "boolean",
          describe: "display pathname detection",
          default: false,
        })
        .option("query-detection", {
          alias: "q",
          type: "boolean",
          describe: "display query detection",
          default: false,
        })
        .option("account-id", {
          alias: "a",
          type: "boolean",
          describe: "display account ID",
          default: false,
        })
        .option("intercept", {
          alias: "i",
          type: "boolean",
          describe: "display intercept",
          default: false,
        })
        .option("intercept-status", {
          alias: "I",
          type: "boolean",
          describe: "display intercept status",
          default: false,
        })
        .option("intercept-headers", {
          alias: "n",
          type: "boolean",
          describe: "display intercept headers",
          default: false,
        });
    }, argv => {
      const ls = (resourceType: TagValidationParentResource): any => {
        return resourceType.fromID(argv.parent)
          .then(parent => {
            const table = new Table();
            const rows: any[] = [];
            const tagValidations = parent.getTagValidations();
            tagValidations.forEach(tagValidation => {
              const row: Record<string, any> = {
                ID: tagValidation.getResourceID(),
                Name: tagValidation.name,
                "Tag Definition": tagValidation.tagDefinition.key,
              };

              if (argv.enabled) {
                row["enabled"] = tagValidation.options.enabled;
              }

              if (argv["do-validation"]) {
                row["Do Validation"] = tagValidation.options.do_validation;
              }

              if (argv["detect-duplicates"]) {
                row["Detect Duplicates"] = tagValidation.options.detect_duplicates;
              }

              if (argv["validate-absence"]) {
                row["Validate Absence"] = tagValidation.options.validate_absence;
              }

              if (argv["hostname-validation"]) {
                row["Hostname Validation"] = tagValidation.options.hostname_validation;
              }

              if (argv["hostname-detection"]) {
                row["Hostname Detection"] = tagValidation.options.hostname_detection;
              }

              if (argv["pathname-validation"]) {
                row["Pathname Validation"] = tagValidation.options.pathname_detection;
              }

              if (argv["query-detection"]) {
                row["Query Detection"] = tagValidation.options.query_detection;
              }

              if (argv["account-id"]) {
                row["Account ID"] = tagValidation.options.account_id;
              }

              if (argv.intercept) {
                row["Intercept"] = tagValidation.options.interception?.intercept;
              }

              if (argv["intercept-status"]) {
                row["Intercept Status"] = tagValidation.options.interception?.intercept_status;
              }

              if (argv["intercept-headers"]) {
                row["Intercept Headers"] = tagValidation.options.interception?.intercept_headers;
              }

              rows.push(row);
            });
            if (rows.length) {
              table.addRows(rows);
              table.printTable();
            }
          }).catch(() => {
            console.error(
              `Unable to list tag validations for ${argv["parent-type"]} ${argv.parent}`
            );
            process.exitCode = 1;
          });
      };

      if (argv["parent-type"] === DataTrue.TagValidationContexts.STEP) {
        ls(DataTrue.Step);
      } else if (argv["parent-type"] === DataTrue.TagValidationContexts.TEST) {
        ls(DataTrue.Test);
      }
    })
    .command("cp <tag-validation> <parent>", "copy a tag validation", yargs => {
      return yargs
        .positional("tag-validation", {
          type: "number",
          describe: "the ID of the tag-validation to copy",
          demandOption: true,
        })
        .positional("parent", {
          type: "number",
          describe: "the ID of the parent to copy the tag validation to",
          demandOption: true,
        })
        .option("parent-type", {
          alias: "p",
          describe: "the type of the parent",
          choices: tagValidationParentTypes,
          default: DataTrue.TagValidationContexts.STEP,
        });
    }, async argv => {
      try {
        const resource = await DataTrue.TagValidation.fromID(
          argv["tag-validation"]
        );
        const copy = DataTrue.TagValidation.fromJSON(
          await resource.toJSON(),
          true,
        );
        copy.setContextID(argv.parent);
        copy.setContextType(argv["parent-type"]);
        return copy.save();
      } catch (e) {
        console.error(
          `Failed to copy tag validation ${argv["tag-validation"]} to ${argv["parent-type"]} ${argv.parent}`
        );
        process.exitCode = 1;
      }
    })
    .command("mv <tag-validation> <parent>", "move a tag validation", yargs => {
      return yargs
        .positional("tag-validation", {
          type: "number",
          describe: "the ID of the tag-validation to move",
          demandOption: true,
        })
        .positional("parent", {
          type: "number",
          describe: "the ID of the parent to move the tag validation to",
          demandOption: true,
        })
        .option("parent-type", {
          describe: "the type of the parent",
          choices: tagValidationParentTypes,
          default: DataTrue.TagValidationContexts.STEP,
        });
    }, async argv => {
      try {
        const resource = await DataTrue.TagValidation.fromID(
          argv["tag-validation"]
        );
        const copy = DataTrue.TagValidation.fromJSON(
          await resource.toJSON(),
          true,
        );
        copy.setContextID(argv.parent);
        copy.setContextType(argv["parent-type"]);
        await copy.save();
        return await resource.delete();
      } catch (e) {
        console.error(
          `Failed to move tag validation ${argv["tag-validation"]} to ${argv["parent-type"]} ${argv.parent}`
        );
        process.exitCode = 1;
      }
    })
    .command("rm <tag-validations..>", "delete tag validations", yargs => {
      return yargs
        .positional("tag-validations", {
          type: "number",
          array: true,
          describe: "the IDs of the tag validations to delete",
          demandOption: true,
        });
    }, argv => {
      return rm(DataTrue.TagValidation, argv["tag-validations"]);
    })
    .command("view <tag-validation>", "view a tag validation", yargs => {
      return yargs
        .positional("tag-validation", {
          type: "number",
          describe: "the ID of the tag validation to view",
          demandOption: true,
        })
        .option("web", {
          alias: "w",
          type: "boolean",
          description: "open tag validation in your web browser",
        });
    }, async argv => {
      try {
        const tagValidation = await DataTrue.TagValidation.fromID(argv["tag-validation"]);

        if (argv.web) {
          await openResource(tagValidation);
        } else {
          console.log(JSON.stringify(await tagValidation.toJSON(), undefined, 2));
        }
      } catch (e) {
        console.error(`Failed to open tag validation ${argv["tag-validation"]}`);
        process.exitCode = 1;
      }
    })
    .demandCommand()
    .help()
    .alias("help", "h");
};
export const handler = (): any => { };
