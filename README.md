# Looker KPI Canvas Visualization

A custom Looker visualization that provides a **drag-and-drop canvas** for building freeform KPI scorecards. It allows users to arrange metrics, add static text, and style elements individually on a responsive grid.

## 🏗️ Architecture Overview

The project is a **React** application wrapped in the **Looker Visualization API**.

### Core Files

*   **`src/kpi_canvas.js`**
    *   **Role**: The Entry Point & Adapter.
    *   **Function**: Registers the viz with `looker.plugins.visualizations.add`.
    *   **Logic**: Bridges Looker's lifecycle (`create`, `updateAsync`) to React's `ReactDOM.render`. Handles error clearing and config updates.

*   **`src/CanvasApp.jsx`**
    *   **Role**: Main Application Container.
    *   **Function**: Orchestrates the state management and drag-and-drop logic.
    *   **Key Logic**:
        *   **State**: Manages the `items` array (position, size, content).
        *   **Hydration**: Merges saved layout data (`canvas_layout_state`) with live query data (`tokens`).
        *   **Persistence**: Debounces saves to Looker's `onConfigChange` to avoid API spam.

*   **`src/components/GridCanvas.jsx`**
    *   **Role**: The Layout Engine.
    *   **Library**: Uses `react-grid-layout` (RGL).
    *   **Logic**:
        *   Renders the grid.
        *   Handles `onDrop`, `onDragStop`, `onResizeStop` events.
        *   **Crucial Implementation Detail**: Uses a **Fallback Drop Handler** on the wrapper logic to ensure HTML5 drag events are valid even if RGL misses them.

*   **`src/components/Sidebar.jsx`**
    *   **Role**: The Editor UI.
    *   **Function**: Provides the "Metric Palette" and "Properties Panel".
    *   **Logic**: Allows dragging new metrics (Dimensions/Measures) onto the canvas and editing properties (Color, Font Size, Alignment) of selected items.

*   **`src/utils/token_utils.js`**
    *   **Role**: Data Transformer.
    *   **Function**: Converts Looker's `queryResponse` and `data` objects into flattened "Tokens" that can be easily bound to canvas items.

---

## 🚀 Development Guide

### 1. Installation
```bash
yarn install
```

### 2. Running Locally (The Harness)
To avoid deploying to Looker for every change, we use a local HTML harness.

```bash
yarn dev
```
*   Opens `https://localhost:8082/harness/kpi_harness.html` (Note: Must accept self-signed cert).
*   **Harness Features**: Mocks Looker API (`trigger`, `clearErrors`), provides mock data, simulated Edit/View mode toggle.

### 3. Building for Production
```bash
yarn build
```
*   Generates `dist/kpi_canvas.js`.
*   Upload this file to your Looker project or host it externally.

---

## 🧩 Key Implementation Details

### State Persistence
The visualization saves its entire layout state (positions, styles) into a **single stringified JSON option** called `canvas_layout_state`.
*   **Why?** Looker's API is designed for simple key-value options. Complex layouts must be serialized.
*   **Where?** Look in `src/kpi_canvas.js` -> `onSave`.

### React Grid Layout & Webpack
This project uses a custom `require` pattern for `react-grid-layout` to avoid ESM/CommonJS compatibility issues with Webpack 5.
*   *See `src/components/GridCanvas.jsx` for the specific implementation.*

### HTML5 Drag & Drop
The drag functionality relies on standard HTML5 events.
*   **Note**: The `Sidebar` uses `unselectable="on"` and `draggable={true}` to initiate drags.
*   **Note**: The `GridCanvas` wrapper handles `onDragOver` with `event.preventDefault()` to explicitly allow drops.

## Local Harness (Custom Viz Builder)

We have created a local 'harness' that mimics the Looker Custom Visualization Builder, allowing development without a full Looker instance.

### How to Run
1.  Start a local HTTP server in the repository root:
    ```bash
    python3 -m http.server 8081
    ```
2.  Open the harness in your browser:
    [http://localhost:8081/harness/builder.html](http://localhost:8081/harness/builder.html)

### Features
- **Config/Data/Query Editors**: Modify the visualization inputs on the fly.
- **Collapsible Sidebar**: Maximize the visualization viewing area.
- **Auto-Reload**: Clicking 'RUN' immediately updates the visualization.

## References

This project utilizes resources from the following Looker Open Source repositories:
-   **Custom Visualizations v2**: [https://github.com/looker-open-source/custom_visualizations_v2](https://github.com/looker-open-source/custom_visualizations_v2) (Source for visualization examples and docs)
-   **Custom Viz Builder**: [https://github.com/looker-open-source/custom-viz-builder](https://github.com/looker-open-source/custom-viz-builder) (Reference for the local harness)

