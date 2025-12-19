// harness/data_scenarios.js
const scenarios = {
  simple: {
    config: { font_size: "large" },
    data: [{ "users.count": { value: 42, rendered: "42" } }],
    queryResponse: {
      fields: {
        dimensions: [{ name: "users.count", label_short: "Count" }],
        measures: [],
      },
    },
  },
  empty: {
    config: {},
    data: [], // No data rows
    queryResponse: { fields: { dimensions: [], measures: [] } },
  },
};