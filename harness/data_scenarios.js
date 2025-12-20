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
  simple_pivot: {
    config: { show_row_numbers: true },
    data: [
      {
        "users.state": { value: "California" },
        "users.count": {
          "2023-01": { value: 100, rendered: "100" },
          "2023-02": { value: 120, rendered: "120" },
        },
      },
      {
        "users.state": { value: "New York" },
        "users.count": {
          "2023-01": { value: 80, rendered: "80" },
          "2023-02": { value: 90, rendered: "90" },
        },
      },
    ],
    queryResponse: {
      fields: {
        dimensions: [
          { name: "users.state", label_short: "State", label: "State" },
        ],
        measures: [
          { name: "users.count", label_short: "Count", label: "Count" },
        ],
        pivots: [
          {
            name: "users.created_month",
            label_short: "Created Month",
            label: "Created Month",
          },
        ],
      },
      pivots: [
        {
          key: "2023-01",
          is_total: false,
          data: { "users.created_month": "2023-01" },
          metadata: {},
        },
        {
          key: "2023-02",
          is_total: false,
          data: { "users.created_month": "2023-02" },
          metadata: {},
        },
      ],
    },
  },
};