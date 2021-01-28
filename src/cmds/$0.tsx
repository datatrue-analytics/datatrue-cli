import { render } from "ink";
import React from "react";
import { App } from "../ui/App";

export const command = "$0";
export const desc = "interactive mode";
export const builder = (): void => { };
export const handler = (): void => {
  render(<App />);
};
