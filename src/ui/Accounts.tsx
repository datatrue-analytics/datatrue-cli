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

export const Accounts = (props: RouteComponentProps): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [accounts, setAccounts] = useState<DataTrue.Account[] | null>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const { running } = useContext(runningContext);

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  useEffect(() => {
    let isCancelled = false;

    DataTrue.Account.getAccounts()
      .then(accounts => {
        if (!isCancelled) {
          setAccounts(accounts.sort((a1, a2) => {
            if (a1.name.toLowerCase() < a2.name.toLowerCase()) {
              return -1;
            } else if (a1.name.toLowerCase() === a2.name.toLowerCase()) {
              return 0;
            } else {
              return 1;
            }
          }));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setAccounts([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSelect = (item: Item<number>): void => {
    setSelectedAccount(item.value);
    setDisplayDialog(true);
  };

  if (accounts === null) {
    return <Loading text="Loading Accounts" />;
  } else {
    const items: Item<number>[] = accounts.map(account => {
      return {
        label: account.name,
        value: account.getResourceID()!,
      };
    });

    return (
      displayDialog ?
        <Dialog
          options={
            [
              {
                label: "Open in browser",
                value: "open",
                handler: async () => {
                  await openResource(accounts.find(account => {
                    return account.getResourceID() === selectedAccount;
                  })!);
                  setDisplayDialog(false);
                },
              },
              {
                label: "View suites",
                value: "suites",
                handler: () => {
                  props.history.push(`/accounts/${selectedAccount!}/suites`);
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
