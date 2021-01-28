import * as DataTrue from "@datatrue/api";
import chalk from "chalk";
import { MultiBar } from "cli-progress";
import open from "open";

export interface Resource {
  fromID: (id: number) => Promise<DataTrue.Resource>,
  fromJSON: (obj: Record<string, any>, copy: boolean) => DataTrue.Resource,
}

export async function cp(
  resourceType: Resource,
  fromType: string,
  toType: string,
  fromID: number,
  toID: number
): Promise<void> {
  try {
    const resource = await resourceType.fromID(fromID);
    const copy = resourceType.fromJSON(await resource.toJSON(), true);
    copy.setContextID(toID);

    if (
      (
        copy instanceof DataTrue.Suite ||
        copy instanceof DataTrue.Test
      ) && (
        resource.getContextID() !== toID
      )
    ) {
      copy.setOptions({ persona_id: undefined });
    }

    await copy.save();
  } catch (e) {
    console.error(`Failed to copy ${fromType} ${fromID} to ${toType} ${toID}`);
    process.exitCode = 1;
  }
}

export async function mv(
  resourceType: Resource,
  fromType: string,
  toType: string,
  fromID: number,
  toID: number
): Promise<void> {
  try {
    const resource = await resourceType.fromID(fromID);
    const copy = resourceType.fromJSON(await resource.toJSON(), true);
    copy.setContextID(toID);

    if (
      (
        copy instanceof DataTrue.Suite ||
        copy instanceof DataTrue.Test
      ) && (
        resource.getContextID() !== toID
      )
    ) {
      copy.setOptions({ persona_id: undefined });
    }

    await copy.save();
    await resource.delete();
  } catch (e) {
    console.error(`Failed to move ${fromType} ${fromID} to ${toType} ${toID}`);
    process.exitCode = 1;
  }
}

export function rm(
  resourceType: Resource,
  resourceIDs: number[]
): Promise<void[]> {
  return Promise.all(resourceIDs.map(resourceID => {
    return resourceType.fromID(resourceID)
      .then(resource => {
        return resource.delete();
      })
      .catch((e: Error) => {
        console.error(e.message);
        process.exitCode = 1;
      });
  }));
}

export async function openResource(resource: DataTrue.Resource): Promise<void> {
  if (resource instanceof DataTrue.Account) {
    await open(
      [
        DataTrue.config.apiEndpoint,
        "update_current_account",
        resource.getResourceID(),
      ].join("/")
    );
  } else if (resource instanceof DataTrue.Suite) {
    await open(
      [
        DataTrue.config.apiEndpoint,
        "accounts",
        resource.getContextID(),
        "suites",
        resource.getResourceID(),
      ].join("/")
    );
  } else if (resource instanceof DataTrue.Test) {
    await open(
      `${DataTrue.config.apiEndpoint}/tests/${resource.getResourceID()!}`
    );
  } else if (resource instanceof DataTrue.Step) {
    await open(
      [
        DataTrue.config.apiEndpoint,
        "tests",
        `${resource.getContextID()!}#step-${resource.getResourceID()!}`,
      ].join("/")
    );
  } else if (resource instanceof DataTrue.TagValidation) {
    if (resource.getContextType() === DataTrue.TagValidationContexts.TEST) {
      await open(
        [
          DataTrue.config.apiEndpoint,
          "tests",
          resource.getContextID(),
        ].join("/")
      );
    } else if (
      resource.getContextType() === DataTrue.TagValidationContexts.STEP
    ) {
      const step = await DataTrue.Step.fromID(resource.getContextID()!);
      await open(
        [
          DataTrue.config.apiEndpoint,
          "tests",
          `${step.getContextID()!}#steps-${step.getResourceID()!}`,
        ].join("/")
      );
    }
  } else if (resource instanceof DataTrue.DataLayerValidation) {
    const step = await DataTrue.Step.fromID(resource.getContextID()!);
    await open(
      [
        DataTrue.config.apiEndpoint,
        "tests",
        `${step.getContextID()!}#steps-${step.getResourceID()!}`,
      ].join("/")
    );
  }
}

export function runStatus(progress: DataTrue.JobStatus): string {
  if (
    progress.status !== "queued" &&
    progress.status !== "running" &&
    progress.progress?.tests !== undefined
  ) {
    const statuses = progress.progress?.tests.map(test => test.state);
    if (statuses.includes("aborted")) {
      return "aborted";
    } else if (statuses.includes("error")) {
      return "error";
    } else if (statuses.includes("failed")) {
      return "failed";
    } else {
      return "validated";
    }
  } else {
    return progress.status;
  }
}

export function progress(
  runnable: DataTrue.Runnable & DataTrue.Resource,
  multiBar: MultiBar,
): void {
  const bar = multiBar.create(100, 0, {
    id: runnable.getResourceID(),
    name: runnable.name,
    status: "queued".padStart(9),
  });

  let errors = 0;
  const maxErrors = 5;

  const interval = setInterval(() => {
    runnable.progress()
      .then(progress => {
        let status = runStatus(progress);
        if (status === "queued" || status === "running") {
          if (progress.progress?.percentage !== 100) {
            bar.update(progress.progress?.percentage || 0, {
              status: status.padStart(9),
            });
          }
        } else {
          if (status === "aborted") {
            status = chalk.black.bgBlue(status.padStart(9));
          } else if (status === "error") {
            status = chalk.black.bgYellow(status.padStart(9));
            process.exitCode = 3;
          } else if (status === "failed") {
            status = chalk.black.bgRed(status.padStart(9));
            process.exitCode = 3;
          } else {
            status = chalk.black.bgGreen("validated");
          }

          bar.update(progress.progress?.percentage || 0, {
            status: status,
          });
          bar.stop();
          clearInterval(interval);
        }
      })
      .catch(() => {
        errors += 1;
        if (errors >= maxErrors) {
          bar.stop();
          clearInterval(interval);
          process.exitCode = 1;
        }
      });
  }, 2000);
}
