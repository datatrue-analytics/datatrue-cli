#!/usr/bin/env node

import * as DataTrue from "@datatrue/api";
import yargs from "yargs";

const auth: yargs.MiddlewareFunction<{
  "user-token": string,
  host: string,
}> = argv => {
  DataTrue.config.userToken = argv["user-token"];
  DataTrue.config.apiEndpoint = argv.host;
};

yargs
  .option("user-token", {
    alias: "U",
    type: "string",
    describe: "your DataTrue user API token",
    demandOption: true,
    global: true,
  })
  .option("host", {
    alias: "H",
    type: "string",
    describe: "the DataTrue host you wish to connect to",
    default: "http://datatrue.com",
    global: true,
  })
  .middleware(auth)
  .commandDir("cmds")
  .demandCommand()
  .completion()
  .env("DATATRUE")
  .version()
  .help()
  .alias("help", "h")
  .alias("version", "v")
  .argv;
