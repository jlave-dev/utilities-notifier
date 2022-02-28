import childProcess from "child_process";
import { ExtendedConfigurationObject, PlaidTransaction } from "./types";

let transactions: PlaidTransaction[];

function checkForRequiredTransactions(config: ExtendedConfigurationObject) {
  // Check whether all configured utilities were returned
  const utilities = config.utilsRegex.split("|");
  if (transactions.length !== utilities.length) {
    console.error("⚠️ Did not fetch all configured utilities");
  }
  if (config.failOnMissingTransactions) {
    process.exit(1);
  }
}

export function getTransactions(config: ExtendedConfigurationObject) {
  console.log(
    `Getting bank transactions from ${config.firstOfMonth} to ${config.lastOfMonth}`
  );
  console.log("---------------");

  // Get transactions from bank
  const json = childProcess.execSync(
    `plaid-cli transactions ${config.plaid.institutionAlias} -f ${config.firstOfMonth} -t ${config.lastOfMonth}`,
    { encoding: "utf-8" }
  );

  transactions = JSON.parse(json).filter((tx) =>
    tx.name.toLowerCase().match(`(${config.utilsRegex})`)
  );

  checkForRequiredTransactions(config);

  // Add user-defined adjustments, if any
  const adjustments = config.adjustments || [];
  transactions = [...transactions, ...adjustments];

  return transactions;
}

export function getDetails(config: ExtendedConfigurationObject) {
  if (!transactions) {
    getTransactions(config);
  }

  // Build transactions log string
  let details = "";
  transactions.forEach((tx) => {
    details += `${tx.name}: $${tx.amount.toFixed(2)}\n`;
  });
  details += "---------------\n";
  return details;
}
