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

interface TagValidationsParams {
  testId?: number,
  stepId?: number,
}

export const TagValidations = (props: RouteComponentProps<TagValidationsParams>): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [tagValidations, setTagValidations] = useState<readonly DataTrue.TagValidation[] | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedTagValidation, setSelectedTagValidation] = useState<number | null>(null);

  const { running } = useContext(runningContext);

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  useEffect(() => {
    let isCancelled = false;

    if (props.match.params.testId !== undefined) {
      DataTrue.Test.fromID(props.match.params.testId)
        .then(test => {
          if (!isCancelled) {
            setTagValidations(test.getTagValidations());
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setTagValidations([]);
          }
        });
    } else if (props.match.params.stepId !== undefined) {
      DataTrue.Step.fromID(props.match.params.stepId)
        .then(step => {
          if (!isCancelled) {
            setTagValidations(step.getTagValidations());
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setTagValidations([]);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [props.match.params.testId, props.match.params.stepId]);

  const handleSelect = (item: Item<number | "..">): void => {
    if (item.value === "..") {
      props.history.goBack();
    } else {
      setSelectedTagValidation(item.value);
      setDisplayDialog(true);
    }
  };

  if (tagValidations === null) {
    return <Loading text="Loading Tag Validations" />;
  } else {
    const items: Item<number | "..">[] = [
      { label: "..", value: ".." },
      ...tagValidations.map(tagValidation => {
        return {
          label: tagValidation.name,
          value: tagValidation.getResourceID()!,
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
                  await openResource(tagValidations.find(tagValidation => {
                    return tagValidation.getResourceID() === selectedTagValidation;
                  })!);
                  setDisplayDialog(false);
                },
              },
              {
                label: "Delete tag validation",
                value: "delete",
                handler: async () => {
                  const tagValidation = tagValidations.find(tagValidation => {
                    return tagValidation.getResourceID() === selectedTagValidation;
                  });
                  if (tagValidation !== undefined) {
                    await tagValidation.delete();
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
