import childProcess from 'child_process';
import Splitwise from 'splitwise';
import fs from 'fs';
import * as DateStrings from './DateStrings';
import * as Configuration from './Configuration';

// Get date strings
const firstOfMonth = DateStrings.getFirstOfMonth();
const lastOfMonth = DateStrings.getLastOfMonth();
const fullMonth = DateStrings.getFullMonth();

// Load configuration from file
const config = Configuration.getConfig();

let adjustments;
try {
  console.log('Reading user adjustments from file');
  const adjustmentsJson = fs.readFileSync('./adjustments.json', { encoding: 'utf-8' });
  adjustments = JSON.parse(adjustmentsJson);
} catch (error) {
  console.log('No adjustments found. Continuing.');
  adjustments = [];
} finally {
  console.log('---------------');
}

console.log(`Getting bank transactions from ${firstOfMonth} to ${lastOfMonth}`);
console.log('---------------');

// process.exit(0);

// Get transactions from bank
const json = childProcess.execSync(
  `plaid-cli transactions ${process.env.PLAID_CLI_INST_ALIAS} -f ${firstOfMonth} -t ${lastOfMonth}`,
  { encoding: 'utf-8' },
);

const transactions = JSON.parse(json);

// Check whether all configured utilities were returned
let utilitiesTransactions = transactions.filter((tx) => tx.name.toLowerCase().match(`(${process.env.UTILS_REGEX})`));
const utilities = process.env.UTILS_REGEX.split('|');
if (utilitiesTransactions.length !== utilities.length) {
  console.error('⚠️ Did not fetch all configured utilities');
}

// Add user-defined adjustments, if any
utilitiesTransactions = [...utilitiesTransactions, ...adjustments];

// Build transactions log string
let details = '';
utilitiesTransactions.forEach((tx) => {
  details += `${tx.name}: $${tx.amount.toFixed(2)}\n`;
});
details += '---------------\n';

// Calculate and log totals
const utilitiesTotal = utilitiesTransactions.reduce((total, tx) => tx.amount + total, 0);
const utilitiesShare = utilitiesTotal / 2;

details += `Utilities total: $${utilitiesTotal.toFixed(2)}\n`;
details += `Utilities share: $${utilitiesShare.toFixed(2)}`;
console.log(details);
console.log('---------------');

// -------------------------------

process.exit(0);

console.log('Creating Splitwise expense');
console.log('---------------');

const sw = Splitwise({
  consumerKey: process.env.SW_CONSUMER_KEY,
  consumerSecret: process.env.SW_CONSUMER_SECRET,
});

sw.createExpense({
  cost: utilitiesTotal,
  details,
  group_id: process.env.SW_GROUP_ID,
  description: `${fullMonth} utilities`,
  category_id: 1,
  split_equally: true,
});

console.log('Done!');
