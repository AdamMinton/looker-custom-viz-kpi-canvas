// harness/mocks.js
window.looker = {
  plugins: {
    visualizations: {
      add: function (viz) {
        console.log("Registered visualization:", viz);
        window.currentViz = viz; // Store for the runner to access
      },
    },
  },
};

// Mock the LookerCharts utility library required by hello_world.js
window.LookerCharts = {
  Utils: {
    htmlForCell: (cell) => {
      // Basic mock: just return the escaped value
      return cell.value ? String(cell.value) : "";
    },
    textForCell: (cell) => cell.value,
  },
};