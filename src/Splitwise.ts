import Splitwise from "splitwise";
import { ExtendedConfigurationObject } from "./types";

export function createExpense(
  config: ExtendedConfigurationObject,
  cost: number,
  details: string
) {
  console.log(
    `Creating Splitwise expense \`${
      config.fullMonth
    } utilities\` with cost $${cost.toFixed(2)}`
  );
  console.log("---------------");

  const sw = Splitwise({
    consumerKey: config.splitwise.consumerKey,
    consumerSecret: config.splitwise.consumerSecret,
  });

  sw.createExpense({
    cost,
    details,
    group_id: config.splitwise.groupId,
    description: `${config.fullMonth} utilities`,
    category_id: 1,
    split_equally: true,
  });
}
