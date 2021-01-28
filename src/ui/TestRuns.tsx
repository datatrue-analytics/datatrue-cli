import { Box, Text, useInput } from "ink";
import Divider from "ink-divider";
import useStdoutDimensions from "ink-use-stdout-dimensions";
import React, { useContext, useEffect, useState } from "react";
import { runStatus } from "../util";
import { runningContext } from "./App";

interface Progress {
  id: number,
  name: string,
  percent: number,
  status: string,
}

export const TestRuns = (): JSX.Element => {
  const [columns, _rows] = useStdoutDimensions();
  const { running, setRunning } = useContext(runningContext);
  const [progresses, setProgresses] = useState<Progress[]>([]);

  useInput((input, _key) => {
    if (input === "c") {
      setRunning(progresses.flatMap((progress, i) => {
        if (progress.status === "queued" || progress.status === "working") {
          return [running[i]];
        } else {
          return [];
        }
      }));
    }
  });

  useEffect(() => {
    let isCancelled = false;

    const func = (): void => {
      Promise.all(running.map(run => run.progress()))
        .then(progs => {
          if (!isCancelled) {
            setProgresses(progs.map((prog, i) => {
              return {
                id: running[i].getResourceID()!,
                name: running[i].name,
                percent: prog.progress?.percentage || 0,
                status: runStatus(prog),
              };
            }));
          }
        })
        .catch(() => {
          // handle this
        });
    };

    func();

    const timer = setInterval(func, 2000);

    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [running]);

  if (running.length) {
    return (
      <>
        <Divider title="Test Runs" padding={0} width={columns} dividerColor="white" />
        {
          progresses.map((pr, index) => {
            return (
              <Box key={index}>
                <Text>
                  {`${pr.percent.toString().padStart(3)}% | ${pr.status.padStart(9)} | ${pr.id}: ${pr.name}`}
                </Text>
              </Box>
            );
          })
        }
      </>
    );
  } else {
    return <></>;
  }
};
