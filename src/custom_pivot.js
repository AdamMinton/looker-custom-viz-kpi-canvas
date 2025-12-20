import React from 'react'
import ReactDOM from 'react-dom'
import { PivotTable } from './PivotTable'



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
    num_grid_columns: {
      type: 'number',
      label: 'Number of Value Columns',
      default: 2,
      section: 'Layout'
    },
    // We'll support up to 4 custom headers statically to keep it simple
    col_1_header: { type: 'string', label: 'Column 1 Header', default: 'Result', section: 'Layout Headers' },
    col_2_header: { type: 'string', label: 'Column 2 Header', default: 'Result 2', section: 'Layout Headers' },
    col_3_header: { type: 'string', label: 'Column 3 Header', default: 'Result 3', section: 'Layout Headers' },
    col_4_header: { type: 'string', label: 'Column 4 Header', default: 'Result 4', section: 'Layout Headers' },

    row_label_header: {
      type: 'string',
      label: 'Metric Name Header',
      default: 'Metric Name',
      section: 'Layout Headers'
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
    this.clearErrors();

    // DYNAMIC OPTIONS GENERATION
    // We need to generate a "Column Index" option for every measure in the query.
    if (queryResponse && queryResponse.fields && queryResponse.fields.measures) {
      const dynamicOptions = { ...this.options };
      queryResponse.fields.measures.forEach(measure => {
        const optionKey = `measure_${measure.name}_col`;
        dynamicOptions[optionKey] = {
          label: `Column for ${measure.label_short || measure.label}`,
          type: 'number',
          default: 1, // Default to Col 1
          min: 1,
          max: 4, // Match our static headers support
          section: 'Measure Mapping'
        };
      });

      // Only trigger option registration if the keys have changed, to avoid infinite loops if Looker is sensitive.
      // However, standard pattern is safe to call trigger('registerOptions').
      this.trigger('registerOptions', dynamicOptions);
    }

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
