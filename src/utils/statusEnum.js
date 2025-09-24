const statusEnum = {
  0: "New",
  1: "Assigned",
  2: "Open",
  3: "InProgress",
  4: "Resolved",
  5: "Closed",
  6: "OnHold",
  7: "Reopened"
};

export const reverseStatusEnum = Object.fromEntries(
  Object.entries(statusEnum).map(([key, value]) => [value, parseInt(key)])
);

export default statusEnum;
