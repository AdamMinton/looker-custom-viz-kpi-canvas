### **Agent 1: The `VizDeveloper**`

**Goal:** Write valid Looker visualization code that compiles.

* **The "Textbook" (Context Files):**
You must pin these specific files to this agent's context. They contain the API rules.
1. `docs/api_reference.md`: This is the bible. It teaches the agent about `updateAsync`, `create`, and how to handle the `queryResponse`.
2. `docs/getting_started.md`: This teaches the agent the basic structure ("Hello World") and how to use `looker.plugins.visualizations.add`.
3. `webpack.config.js`: Necessary so the agent knows how the code is bundled (e.g., entry points and output paths).
4. `src/examples/hello_world/hello_world.js`: A "Few-Shot Example." This shows the agent a working pattern to mimic.


* **System Prompt / Instructions:**
> "You are an expert Looker Visualization Developer.
> 1. **API Strictness:** Always use the `updateAsync` function, never `update`, as per the API reference.
> 2. **Lifecycle:** You must always call the `done()` callback when rendering is finished to ensure PDF compatibility.
> 3. **Data Handling:** Use `LookerCharts.Utils.htmlForCell(cell)` to safely render HTML content.
> 4. **Configuration:** Define user options in the `options` object (e.g., `type: "string"`, `display: "select"`).
> 5. **Build:** When you edit code, run `yarn build` to update the `dist/` folder."
> 
> 



### **Agent 2: The `HarnessEngineer**`

**Goal:** Mock the Looker environment so the code runs locally.

* **The "Textbook" (Context Files):**
1. `docs/api_reference.md`: It needs this to reverse-engineer the API. If the docs say "The API calls `create(element, config)`", this agent knows it must write code that *calls* `create(element, config)`.
2. `test/looker_stub.js`: A primitive example of how to stub the `looker` object.
3. `src/examples/types/types.ts`: (Optional) Useful if you want strong typing for your mocks.


* **System Prompt / Instructions:**
> "You are the Simulation Architect.
> 1. **Mocking:** You must create a browser-based harness (`harness/index.html`) that defines `looker.plugins.visualizations.add`.
> 2. **Data Injection:** You must create a `scenarios` object containing mock data. The data shape must match the 'Rendering Data' section of the API docs (rows with cell objects containing `value` and `rendered` properties).
> 3. **Utility Mocking:** You must mock `LookerCharts.Utils` methods like `htmlForCell` and `textForCell` or the visualization will crash."
> 
> 



### **Agent 3: The `Auditor**`

**Goal:** Verify the visualization meets Looker Marketplace guidelines.

* **The "Textbook" (Context Files):**
1. `docs/api_reference.md`: Specifically the sections on "Handling Errors" (`addError`, `clearErrors`) and the `done` function.
2. `CONTRIBUTING.md`: For general code style alignment.


* **System Prompt / Instructions:**
> "You are the Marketplace Auditor. You verify the running visualization in the browser.
> 1. **Error Check:** When the `HarnessEngineer` loads the 'Empty Data' scenario, verify that the visualization calls `this.addError()` and displays a user-friendly message.
> 2. **Completion Check:** Monitor the console. You must see a log indicating `done()` was called. If not, the visualization fails the 'PDF Support' requirement.
> 3. **Drill Menu:** If the `VizDeveloper` implements drilling, verify they pass the `event` object to `LookerCharts.Utils.openDrillMenu` to position the menu correctly."
> 
> 

### Testing the functionality of the visualization

Test the new visualization by applying it to an appropriate Explore or Look on your Looker instance:

1. Navigate to the Look or Explore.  
2. If on a Look, click **Edit** to edit the Look.  
3. Click the three-dot menu in the visualization type menu to open the drop-down list of visualizations.  
4. Select your custom visualization.  
5. Click **Save** to save the change to the Look. Note any dashboards that may be impacted by this change.

Looker requires these functions in the visualizations available from the Looker Marketplace:

| Function | Required |
| :---- | :---- |
| Support for drilling into visualization | Yes |
| Ability to inherit Looker's color palettes | Yes |
| Responsiveness to browser and screen size | Yes |
| Consistent font family: `font-family`: `Helvetica`, `Arial`, `sans-serif` | Yes |
| Font sizing | Yes |
| Ability to toggle Value Labels and Axis Labels in the visualization configuration panel | Yes |
| Visualization of pivoted data | Yes (when applicable) |
| Visualization updates based on user interactivity using the `updateAsync` function or `is update function` | Yes |
| Clear error messages (for example, This visualization requires 1 dimension and 2 measures) | Yes |
| All options in visualization configuration panel make an apparent change to the visualization | Yes |
| Use of field's `value` formatting by default | Yes (when applicable) |
| Error is thrown when a query returns no results | Yes |


## **Lessons Learned / Development Guide**

### **1. Integration & Hosting Strategy**
*   **Avoid "Raw Gist" Hosting**: Browsers block scripts served from `gist.githubusercontent.com` because they are served with `Content-Type: text/plain`. This causes silent failures (script downloads but doesn't execute).
*   **Preferred Method**: **Drag & Drop Upload**.
    *   Upload the built `dist/bundle.js` directly into the Looker IDE.
    *   Reference it in `manifest.lkml` using `file: "bundle.js"`.
    *   This bypasses all SSL/Reference errors and is the most reliable deployment method.
*   **Localhost Development (If strictly necessary)**:
    *   Requires a trusted SSL certificate (`mkcert` is recommended).
    *   Requires specific CORS and "Private Network Access" headers in `webpack-dev-server`.
    *   Often triggers "Mixed Content" or "Private Network" blocks in Chrome unless flags (`chrome://flags/#allow-insecure-localhost`) are enabled.

### **2. Development Workflow**
*   **The "Harness" is King**: Developing against a local HTML test harness (`index.html` with mock data) is infinitely faster and more reliable than trying to hook into a live Looker instance during development.
    *   Mock the `looker` object (`looker.plugins.visualizations.add`).
    *   Mock `LookerCharts.Utils` if used.
    *   Iterate locally using `yarn dev`, then `yarn build` for the final artifact.
*   **Verbose Logging**:
    *   Always add `console.log('VIZ: create called')`, `console.log('VIZ: updateAsync called')` to early lifecycle methods.
    *   This distinguishes between "File not loaded" (404/MIME error) vs "File loaded but crashed" (Runtime error).

### **3. Code Best Practices**
*   **Global Variable Safety**:
    *   `LookerCharts` is **not always available**, especially in certain contexts (like PDF rendering or public embeds).
    *   **Always guard checks**: `if (window.LookerCharts && ...)` before accessing utility methods.
    *   Provide fallbacks (e.g., render raw value if `textForCell` is missing).
*   **React Integration**:
    *   Use a clear "Wrapper" pattern: `create` method sets up a container `div`, `updateAsync` calls `ReactDOM.render`.
    *   Ensure strict cleanup if necessary, though Looker usually manages the iframe lifecycle.
*   **Dependencies**:
    *   `styled-components` is excellent for isolating visualization styles from Looker's global CSS.
    *   `yarn` is preferred over `npm` for consistent dependency locking in this repo.
