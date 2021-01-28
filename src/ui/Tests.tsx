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

interface TestParams {
  suiteId: number,
}

export const Tests = (props: RouteComponentProps<TestParams>): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [tests, setTests] = useState<readonly DataTrue.Test[] | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);

  const { running, setRunning } = useContext(runningContext);

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  useEffect(() => {
    let isCancelled = false;

    DataTrue.Suite.fromID(props.match.params.suiteId)
      .then(suite => {
        return suite.getTests();
      })
      .then(tests => {
        if (!isCancelled) {
          setTests(tests);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setTests([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [props.match.params.suiteId]);

  const handleSelect = (item: Item<number | "..">): void => {
    if (item.value === "..") {
      props.history.goBack();
    } else {
      setSelectedTest(item.value);
      setDisplayDialog(true);
    }
  };

  if (tests === null) {
    return <Loading text="Loading Tests" />;
  } else {
    const items: Item<number | "..">[] = [
      { label: "..", value: ".." },
      ...tests.map(test => {
        return {
          label: test.name,
          value: test.getResourceID()!,
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
                  await openResource(tests.find(test => {
                    return test.getResourceID() === selectedTest;
                  })!);
                  setDisplayDialog(false);
                },
              },
              {
                label: "Run test",
                value: "run",
                handler: async () => {
                  const test = tests.find(test => {
                    return test.getResourceID() === selectedTest;
                  });
                  if (test !== undefined) {
                    await test.run();
                    setRunning([...running, test]);
                  }
                  setDisplayDialog(false);
                },
              },
              {
                label: "View steps",
                value: "steps",
                handler: () => {
                  props.history.push(`/tests/${selectedTest!}/steps`);
                },
              },
              {
                label: "View tag validations",
                value: "tagValidations",
                handler: () => {
                  props.history.push(`/tests/${selectedTest!}/tagValidations`);
                },
              },
              {
                label: "Delete test",
                value: "delete",
                handler: async () => {
                  const test = tests.find(test => {
                    return test.getResourceID() === selectedTest;
                  });
                  if (test !== undefined) {
                    await test.delete();
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
