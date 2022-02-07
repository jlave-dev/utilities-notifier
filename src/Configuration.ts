import fs from 'fs';
import validate from 'validate.js';

interface UtilitiesNotifierConfiguration {
  plaid: {
    institutionAlias: string;
    accountId: string;
  };
  splitwise: {
    consumerKey: string;
    consumerSecret: string;
    groupId: string;
    payerId: string;
    owerId: string;
  };
  utilsRegex?: string;
  adjustments?: {
    [name: string]: number;
  }
}

const args = require('args-parser')(process.argv);

const constraints = {
  'plaid.institutionAlias': { presence: true },
  'plaid.accountId': { presence: true },
  'splitwise.consumerKey': { presence: true },
  'splitwise.consumerSecret': { presence: true },
  'splitwise.groupId': { presence: true },
  'splitwise.payerId': { presence: true },
  'splitwise.owerId': { presence: true },
};

export function getConfig() {
  let configContent: string;
  let config: UtilitiesNotifierConfiguration;

  try {
    configContent = fs.readFileSync(args.config || './config.json', { encoding: 'utf-8' });
  } catch (error: any) {
    console.error('Could not read configuration from file:');
    console.error(error.message);
    process.exit(2);
  }

  try {
    config = JSON.parse(configContent);
  } catch (error: any) {
    console.error('Could parse configuration file as JSON:');
    console.error(error.message);
    process.exit(2);
  }

  try {
    validate(config, constraints);
  } catch (error: any) {
    console.error('Could not read configuration from file. Exiting.');
    process.exit(2);
  }

  return config;
}
