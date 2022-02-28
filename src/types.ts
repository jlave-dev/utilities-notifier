export interface ConfigurationObject {
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
  utilsRegex: string;
  adjustments?: [{ name: string; amount: number }];
  failOnMissingTransactions?: boolean;
}

export interface ExtendedConfigurationObject extends ConfigurationObject {
  firstOfMonth: string;
  lastOfMonth: string;
  fullMonth: string;
}

export interface PlaidTransaction {
  name: string;
  amount: number;
}
