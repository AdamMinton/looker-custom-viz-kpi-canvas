import React from 'react';
import ReactDOM from 'react-dom';
import { CanvasApp } from './CanvasApp.jsx';
import { transformDataToTokens } from './utils/token_utils';

looker.plugins.visualizations.add({
  id: 'kpi_canvas',
  label: 'KPI Canvas',
  options: {
    edit_mode: {
      type: 'boolean',
      label: 'Edit Mode',
      default: false,
      section: 'Canvas Configuration',
      order: 1
    },
    row_integrity: {
      type: 'boolean',
      label: 'Row Integrity (Prevent Wrapping)',
      default: false,
      section: 'Canvas Configuration',
      order: 2
    },
    compact_mode: {
      type: 'boolean',
      label: 'Compact Mode',
      default: false,
      section: 'Canvas Configuration',
      default: false,
      section: 'Canvas Configuration',
      order: 3
    },
    scale_to_fit: {
      type: 'boolean',
      label: 'Scale to Fit (Zoom)',
      default: false,
      section: 'Canvas Configuration',
      order: 4
    },
    canvas_layout_state: {
      type: 'string',
      label: 'Layout State (Do Not Edit)',
      display: 'text', // Or 'hidden' if possible, usually 'text' is safest for debug
      default: '{}',
      section: 'System'
    }
  },

  create: function (element, config) {
    element.innerHTML = `
      <style>
        .kpi-canvas-root {
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Open Sans', 'Helvetica', sans-serif;
        }
      </style>
    `;
    this._container = element.appendChild(document.createElement("div"));
    this._container.className = "kpi-canvas-root";
  },

  updateAsync: function (data, element, config, queryResponse, details, done) {
    this.clearErrors && this.clearErrors();

    // 1. Transform Data
    const tokens = transformDataToTokens(data, queryResponse);

    // 2. Parse Layout
    let initialLayout = { items: [] };
    try {
      if (config.canvas_layout_state) {
        console.log("Parsing canvas_layout_state:", config.canvas_layout_state);
        initialLayout = JSON.parse(config.canvas_layout_state);
      } else {
        console.log("No canvas_layout_state found in config");
      }
    } catch (e) {
      console.error("KPI Canvas: Failed to parse layout state", e);
    }

    // 3. Render
    ReactDOM.render(
      <CanvasApp
        isEditMode={config.edit_mode}
        rowIntegrity={config.row_integrity}
        compactMode={config.compact_mode}
        showLabels={config.show_labels}
        scaleToFit={config.scale_to_fit}
        tokens={tokens}
        initialLayout={initialLayout}
        onSave={(newState) => {
          const updatePayload = [{ canvas_layout_state: JSON.stringify(newState) }];
          // Safety check for trigger
          if (this.trigger) {
            this.trigger('updateConfig', updatePayload);
          } else {
            console.warn("trigger not available on viz object", updatePayload);
          }
        }}
      />,
      this._container
    );

    done();
  }
});
