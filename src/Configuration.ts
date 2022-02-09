import fs from "fs";
import path from "path";
import validate from "validate.js";
import { ConfigurationObject } from "./types";

const argsParser = require("args-parser");

const constraints = {
  "plaid.institutionAlias": { presence: true },
  "plaid.accountId": { presence: true },
  "splitwise.consumerKey": { presence: true },
  "splitwise.consumerSecret": { presence: true },
  "splitwise.groupId": { presence: true },
  utilsRegex: { presence: true },
};

export function getConfig() {
  const args = argsParser(process.argv);

  let configContent: string;
  let config: ConfigurationObject;

  let configFilePath;
  if (!args.config) {
    configFilePath = path.join(process.cwd(), "config.json");
  } else if (path.isAbsolute(args.config)) {
    configFilePath = args.config;
  } else {
    configFilePath = path.join(process.cwd(), args.config);
  }

  try {
    configContent = fs.readFileSync(configFilePath, {
      encoding: "utf-8",
    });
  } catch (error: any) {
    console.error("Could not read configuration from file:");
    console.error(error.message);
    process.exit(1);
  }

  try {
    config = JSON.parse(configContent);
  } catch (error: any) {
    console.error("Could not parse configuration file as JSON:");
    console.error(error.message);
    process.exit(1);
  }

  try {
    const validationResult = validate(config, constraints);
    if (validationResult) throw new Error(JSON.stringify(validationResult));
  } catch (error: any) {
    console.error("Invalid configuration:");
    console.error(error.message);
    process.exit(1);
  }

  return config;
}
