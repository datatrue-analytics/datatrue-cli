import * as DataTrue from "@datatrue/api";
import { Route, Router, Switch } from "@giusto/ink-router";
import { Box, useApp, useInput } from "ink";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import React, { createContext, useState } from "react";
import { Accounts } from "./Accounts";
import { DataLayerValidations } from "./DataLayerValidations";
import { Steps } from "./Steps";
import { Suites } from "./Suites";
import { TagValidations } from "./TagValidations";
import { TestRuns } from "./TestRuns";
import { Tests } from "./Tests";

export interface RunningContext {
  running: (DataTrue.Resource & DataTrue.Runnable)[],
  setRunning: (running: (DataTrue.Resource & DataTrue.Runnable)[]) => void,
}

const defaultRunningContext: RunningContext = {
  running: [],
  setRunning: () => { },
};

export const runningContext = createContext<RunningContext>(
  defaultRunningContext
);

export const App = (): JSX.Element => {
  const [_columns, rows] = useStdoutDimensions();
  const [running, setRunning] = useState<(DataTrue.Resource & DataTrue.Runnable)[]>([]);

  const value: RunningContext = { running, setRunning };

  let height = rows - 1;

  if (running.length) {
    height -= 1 + running.length;
  }

  const { exit } = useApp();
  useInput((input, _key) => {
    if (input === "q") {
      exit();
    }
  });

  return (
    <runningContext.Provider value={value}>
      <Box height={height}>
        <Router initialEntries={["/accounts"]}>
          <Switch>
            <Route exact path="/accounts" component={Accounts} />
            <Route exact path="/accounts/:accountId/suites" component={Suites} />
            <Route exact path="/suites/:suiteId/tests" component={Tests} />
            <Route exact path="/tests/:testId/steps" component={Steps} />
            <Route exact path="/tests/:testId/tagValidations" component={TagValidations} />
            <Route exact path="/steps/:stepId/tagValidations" component={TagValidations} />
            <Route exact path="/steps/:stepId/dataLayerValidations" component={DataLayerValidations} />
          </Switch>
        </Router>
      </Box>
      <TestRuns />
    </runningContext.Provider>
  );
};
