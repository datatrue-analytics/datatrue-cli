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

interface DataLayerValidationsParams {
  stepId: number,
}

export const DataLayerValidations = (props: RouteComponentProps<DataLayerValidationsParams>): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [dataLayerValidations, setDataLayerValidations] = useState<readonly DataTrue.DataLayerValidation[] | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedDataLayerValidation, setSelectedDataLayerValidation] = useState<number | null>(null);

  const { running } = useContext(runningContext);

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  useEffect(() => {
    let isCancelled = false;

    DataTrue.Step.fromID(props.match.params.stepId)
      .then(step => {
        if (!isCancelled) {
          setDataLayerValidations(step.getDataLayerValidations());
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setDataLayerValidations([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [props.match.params.stepId]);

  const handleSelect = (item: Item<number | "..">): void => {
    if (item.value === "..") {
      props.history.goBack();
    } else {
      setSelectedDataLayerValidation(item.value);
      setDisplayDialog(true);
    }
  };

  if (dataLayerValidations === null) {
    return <Loading text="Loading Data Layer Validations" />;
  } else {
    const items: Item<number | "..">[] = [
      { label: "..", value: ".." },
      ...dataLayerValidations.map(dataLayerValidation => {
        return {
          label: dataLayerValidation.name,
          value: dataLayerValidation.getResourceID()!,
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
                  await openResource(dataLayerValidations.find(
                    dataLayerValidation => {
                      return dataLayerValidation.getResourceID() === selectedDataLayerValidation;
                    })!
                  );
                  setDisplayDialog(false);
                },
              },
              {
                label: "Delete tag validation",
                value: "delete",
                handler: async () => {
                  const dataLayerValidation = dataLayerValidations.find(
                    dataLayerValidation => {
                      return dataLayerValidation.getResourceID() === selectedDataLayerValidation;
                    });
                  if (dataLayerValidation !== undefined) {
                    await dataLayerValidation.delete();
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
};
