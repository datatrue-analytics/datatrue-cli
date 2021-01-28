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

interface SuitesParams {
  accountId: number,
}

export const Suites = (props: RouteComponentProps<SuitesParams>): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [suites, setSuites] = useState<readonly DataTrue.Suite[] | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<number | null>(null);

  const { running, setRunning } = useContext(runningContext);

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  useEffect(() => {
    let isCancelled = false;

    DataTrue.Account.fromID(props.match.params.accountId)
      .then(account => {
        return account.getSuites();
      })
      .then(suites => {
        if (!isCancelled) {
          setSuites(suites);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSuites([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [props.match.params.accountId]);

  const handleSelect = (item: Item<number | "..">): void => {
    if (item.value === "..") {
      props.history.goBack();
    } else {
      setSelectedSuite(item.value);
      setDisplayDialog(true);
    }
  };

  if (suites === null) {
    return <Loading text="Loading Suites" />;
  } else {
    const items: Item<number | "..">[] = [
      { label: "..", value: ".." },
      ...suites.map(
        suite => {
          return {
            label: suite.name,
            value: suite.getResourceID()!,
          };
        }
      ),
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
                  await openResource(suites.find(suite => {
                    return suite.getResourceID() === selectedSuite;
                  })!);
                  setDisplayDialog(false);
                },
              },
              {
                label: "Run suite",
                value: "run",
                handler: async () => {
                  const suite = suites.find(suite => {
                    return suite.getResourceID() === selectedSuite;
                  });
                  if (suite !== undefined) {
                    await suite.run();
                    setRunning([...running, suite]);
                  }
                  setDisplayDialog(false);
                },
              },
              {
                label: "View tests",
                value: "tests",
                handler: () => {
                  props.history.push(`/suites/${selectedSuite!}/tests`);
                },
              },
              {
                label: "Delete suite",
                value: "delete",
                handler: async () => {
                  const suite = suites.find(suite => {
                    return suite.getResourceID() === selectedSuite;
                  });
                  if (suite !== undefined) {
                    await suite.delete();
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
