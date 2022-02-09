// Export required date variables

export function getFirstOfMonth() {
  const today = new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split("T")[0];
}

export function getLastOfMonth() {
  const today = new Date();
  today.setMonth(today.getMonth() + 1);
  today.setDate(0);
  today.setHours(11, 59, 59, 0);
  return today.toISOString().split("T")[0];
}

export function getFullMonth() {
  const today = new Date();
  return today.toLocaleString("default", { month: "long" });
}
