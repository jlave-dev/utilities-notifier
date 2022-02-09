import * as DateStrings from "./DateStrings";
import * as Configuration from "./Configuration";
import * as Transactions from "./Transactions";
import * as Splitwise from "./Splitwise";
import { ExtendedConfigurationObject } from "./types";

// Load configuration from file
const config: ExtendedConfigurationObject =
  Configuration.getConfig() as ExtendedConfigurationObject;

// Get date strings
config.firstOfMonth = DateStrings.getFirstOfMonth();
config.lastOfMonth = DateStrings.getLastOfMonth();
config.fullMonth = DateStrings.getFullMonth();

const transactions = Transactions.getTransactions(config);
let transactionDetails = Transactions.getDetails(config);

// Calculate and log totals
const utilitiesTotal = transactions.reduce((total, tx) => tx.amount + total, 0);
const utilitiesShare = utilitiesTotal / 2;

transactionDetails += `Utilities total: $${utilitiesTotal.toFixed(2)}\n`;
transactionDetails += `Utilities share: $${utilitiesShare.toFixed(2)}`;
console.log(transactionDetails);
console.log("---------------");

Splitwise.createExpense(config, utilitiesTotal, transactionDetails);

console.log("Done!");
