const childProcess = require('child_process');
const Splitwise = require('splitwise');
const fs = require('fs');

// Set required date variables
const firstOfMonth = new Date();
firstOfMonth.setDate(1);
firstOfMonth.setHours(0, 0, 0, 0);
const firstOfMonthString = firstOfMonth.toISOString().split('T')[0];
const lastOfMonth = new Date();
lastOfMonth.setMonth(firstOfMonth.getMonth() + 1);
lastOfMonth.setDate(0);
lastOfMonth.setHours(11, 59, 59, 0);
const lastOfMonthString = lastOfMonth.toISOString().split('T')[0];
const fullMonthString = firstOfMonth.toLocaleString('default', { month: 'long' });

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

console.log(`Getting bank transactions from ${firstOfMonthString} to ${lastOfMonthString}`);
console.log('---------------');

// process.exit(0);

// Get transactions from bank
const json = childProcess.execSync(
  `plaid-cli transactions ${process.env.PLAID_CLI_INST_ALIAS} -f ${firstOfMonthString} -t ${lastOfMonthString}`,
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

// process.exit(0);

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
  description: `${fullMonthString} utilities`,
  category_id: 1,
  split_equally: true,
});

console.log('Done!');
