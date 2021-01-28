import * as DataTrue from "@datatrue/api";
import { RouteComponentProps } from "@giusto/ink-router";
import SelectInput from "ink-select-input";
import { Item } from "ink-select-input/build/SelectInput";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import React, { useContext, useEffect, useState } from "react";
import { openResource } from "../util";
import { runningContext } from "./App";
import { Dialog } from "./Dialog";
import { Loading } from "./Loading";

interface StepsParams {
  testId: number,
}

export const Steps = (props: RouteComponentProps<StepsParams>): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [steps, setSteps] = useState<readonly DataTrue.Step[] | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const { running } = useContext(runningContext);

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  useEffect(() => {
    let isCancelled = false;

    DataTrue.Test.fromID(props.match.params.testId)
      .then(test => {
        if (!isCancelled) {
          setSteps(test.getSteps());
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSteps([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [props.match.params.testId]);

  const handleSelect = (item: Item<number | "..">): void => {
    if (item.value === "..") {
      props.history.goBack();
    } else {
      setSelectedStep(item.value);
      setDisplayDialog(true);
    }
  };

  if (steps === null) {
    return <Loading text="Loading Steps" />;
  } else {
    const items: Item<number | "..">[] = [
      { label: "..", value: ".." },
      ...steps.map(step => {
        return {
          label: step.name,
          value: step.getResourceID()!,
        };
      }),
    ];

    return (
      displayDialog ?
        <Dialog
          options={
            [
              {
                label: "Open in browser",
                value: "open",
                handler: async () => {
                  await openResource(steps.find(step => {
                    return step.getResourceID() === selectedStep;
                  })!);
                  setDisplayDialog(false);
                },
              },
              {
                label: "View tag validations",
                value: "tagValidations",
                handler: () => {
                  props.history.push(`/steps/${selectedStep!}/tagValidations`);
                },
              },
              {
                label: "View data layer validations",
                value: "dataLayerValidations",
                handler: () => {
                  props.history.push(
                    `/steps/${selectedStep!}/dataLayerValidations`
                  );
                },
              },
              {
                label: "Delete step",
                value: "delete",
                handler: async () => {
                  const step = steps.find(
                    step => step.getResourceID() === selectedStep
                  );
                  if (step !== undefined) {
                    await step.delete();
                  }
                  props.history.replace("/temp");
                  props.history.replace(props.match.path);
                },
              },
              {
                label: "Cancel",
                value: "cancel",
                handler: () => {
                  setDisplayDialog(false);
                },
              },
            ]
          }
          limit={height} /> :
        <SelectInput items={items} onSelect={handleSelect} limit={height} />
    );
  }

  return <></>;
};
