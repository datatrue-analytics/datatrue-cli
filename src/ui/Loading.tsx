import { Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";

export interface LoadingProps {
  text: string,
}

export const Loading = (props: LoadingProps): JSX.Element => {
  return (
    <Text color="green">
      <Spinner type="dots" />
      <Text color="white">{` ${props.text}`}</Text>
    </Text>
  );
};
