import React from 'react'
import ReactDOM from 'react-dom'
import { PivotTable } from './PivotTable'

console.log('CUSTOM PIVOT: Loaded');

looker.plugins.visualizations.add({
  // The id must match the key in looker.plugins.visualizations
  id: 'custom_pivot', // Suggest using a more unique id in production
  label: 'Custom Pivot Table',
  options: {
    font_size: {
      type: 'string',
      label: 'Font Size',
      values: [
        { 'Large': 'large' },
        { 'Small': 'small' }
      ],
      display: 'select',
      default: 'large'
    },
    show_row_numbers: {
      type: 'boolean',
      label: 'Show Row Numbers',
      default: true
    },
    header_bg_color: {
      type: 'string',
      label: 'Header Background Color',
      display: 'color',
      default: '#f5f5f5'
    },
    even_row_color: {
      type: 'string',
      label: 'Even Row Color',
      display: 'color',
      default: '#ffffff'
    },
    odd_row_color: {
      type: 'string',
      label: 'Odd Row Color',
      display: 'color',
      default: '#f9f9f9'
    }
  },

  // Set up the initial state of the visualization
  create: function (element, config) {
    console.log('CUSTOM PIVOT: create called');
    element.innerHTML = `
      <style>
        .custom-pivot-container {
          width: 100%;
          height: 100%;
          overflow: auto;
          font-family: 'Open Sans', 'Helvetica', sans-serif;
        }
      </style>
    `;

    // Create a specific container for React to render into
    this._container = element.appendChild(document.createElement("div"));
    this._container.className = "custom-pivot-container";
  },

  // Render in response to the data or settings changing
  updateAsync: function (data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates
    this.clearErrors();

    // specific error handling
    if (!queryResponse || !queryResponse.pivots || queryResponse.pivots.length === 0) {
      // Technically we can render non-pivoted data too, but the name implies pivot.
      // For now let's just warn or allow it.
      // this.addError({ title: "No Pivots", message: "This visualization requires a pivot." });
      // return;
    }

    const { options } = this;

    // Render the React Component
    // We pass done() as a callback to React's render if needed, or call it after.
    // React 17/18 might behave async different but for now ReactDOM.render is sync-ish for initial render usually.
    ReactDOM.render(
      <PivotTable
        data={data}
        config={config}
        queryResponse={queryResponse}
        details={details}
        done={done}
      />,
      this._container
    );

    done();
  }
})
