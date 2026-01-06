// harness/data_scenarios.js
window.scenarios = {
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
  user_request: {
    config: {
      canvas_layout_state: JSON.stringify({ "timestamp": 1767629603201, "items": [{ "i": "ly33kx92u", "type": "text", "x": 0, "y": 0, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center", "color": "#e20303" }, "staticLabel": "My Metric", "content": "My Metric" }, { "i": "wuiue8m71", "fieldId": "order_items.total_sale_price", "type": "measure", "x": 3, "y": 1, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center" }, "value": "$95,769", "value_raw": 95769.21036791801, "rules": [{ "id": "1766202858443", "operator": "gt", "threshold": 0, "styleTarget": "text", "effectValue": "#4ab42d" }] }, { "i": "6f6b75kc8", "fieldId": "order_items.total_sale_price", "type": "measure", "x": 0, "y": 1, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center" }, "value": "$95,769", "value_raw": 95769.21036791801, "rules": [{ "id": "1766202851843", "operator": "gt", "threshold": 0, "styleTarget": "background", "effectValue": "#ff0000" }] }, { "i": "697qch8gk", "type": "text", "x": 3, "y": 0, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center", "color": "#6545a1" }, "staticLabel": "Last Year", "content": "Last Year" }, { "i": "gyg94bjf9", "fieldId": "order_items.count", "type": "status_indicator", "x": 6, "y": 1, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center" }, "staticLabel": "Current", "value": "2,049", "value_raw": 2049, "html": "\n  3.1K\n   ", "rules": [{ "id": "1766202867175", "operator": "gt", "threshold": 0, "styleTarget": "text", "effectValue": "#859a1d" }] }, { "i": "8bl97ghm2", "type": "text", "x": 6, "y": 0, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center", "color": "#d69494" }, "staticLabel": "Status", "content": "Status" }, { "i": "cgo1bbuoi", "fieldId": "order_items.total_sale_price", "type": "status_indicator", "x": 9, "y": 1, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center" }, "staticLabel": "Overall Status", "value": "$95,769", "value_raw": 95769.21036791801, "html": "\n  $140.0K\n   ", "rules": [{ "id": "1766205412181", "operator": "gt", "threshold": 0, "styleTarget": "text", "effectValue": "#5225bb" }] }, { "i": "g03m1ugc6", "fieldId": "order_items.average_sale_price", "type": "measure", "x": 6, "y": 2, "w": 3, "h": 2, "style": { "fontSize": "24px", "textAlign": "center" }, "value": "$47", "value_raw": 46.73948773446468, "html": "\n  $46\n   " }, { "i": "jn3db0i1q", "fieldId": "order_items.average_sale_price", "type": "measure", "x": 3, "y": 2, "w": 3, "h": 2, "style": { "fontSize": "24px", "textAlign": "center" }, "value": "$47", "value_raw": 46.73948773446468, "html": "\n  $46\n   " }, { "i": "43po3hrvr", "fieldId": "order_items.total_sale_price", "type": "measure", "x": 0, "y": 2, "w": 3, "h": 2, "style": { "fontSize": "24px", "textAlign": "center" }, "value": "$95,769", "value_raw": 95769.21036791801, "html": "\n  $140.0K\n   " }, { "i": "6ku7c6dts", "type": "status_indicator", "x": 9, "y": 2, "w": 3, "h": 2, "style": { "fontSize": "24px", "textAlign": "center" }, "value": "missing", "value_raw": null }, { "i": "dsououskf", "type": "text", "x": 9, "y": 0, "w": 3, "h": 1, "style": { "fontSize": "24px", "textAlign": "center", "color": "#d24141" }, "content": "New Text" }] })
    },
    data: [
      {
        "order_items.total_sale_price": { "value": 95769.21036791801, "rendered": "$95,769" },
        "order_items.count": { "value": 2049, "rendered": "2,049" },
        "order_items.average_sale_price": { "value": 46.73948773446468, "rendered": "$47" }
      }
    ],
    queryResponse: {
      fields: {
        dimensions: [],
        measures: [
          { name: "order_items.total_sale_price", label: "Total Sale Price", is_numeric: true, type: "sum_distinct", value_format: "$#,##0" },
          { name: "order_items.count", label: "Count", is_numeric: true, type: "count_distinct", value_format: "0" },
          { name: "order_items.average_sale_price", label: "Average Sale Price", is_numeric: true, type: "average", value_format: "$#,##0" }
        ]
      }
    }
  }
};