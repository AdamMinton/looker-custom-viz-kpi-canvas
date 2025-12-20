export const transformDataToTokens = (data, queryResponse) => {
  if (!data || !data.length || !queryResponse || !queryResponse.fields) {
    return [];
  }

  const { measures, dimensions } = queryResponse.fields;
  const firstRow = data[0]; // We primarily focus on the first row for Scorecards

  const tokens = [];

  // Process Measures
  if (measures) {
    measures.forEach(measure => {
      const cell = firstRow[measure.name];
      // Looker data cell: { value: 123, rendered: "123", links: [] }
      // Sometimes just { value: 123 }
      const raw = cell && typeof cell.value !== 'undefined' ? cell.value : null;
      tokens.push({
        id: measure.name,
        label: measure.label_short || measure.label,
        value: cell ? (cell.rendered || cell.value) : '--',
        value_raw: raw,
        html: cell ? cell.html : null,
        type: 'measure',
        is_numeric: measure.is_numeric
      });
    });
  }

  // Process Dimensions (Secondary use case: Context)
  if (dimensions) {
    dimensions.forEach(dim => {
      const cell = firstRow[dim.name];
      tokens.push({
        id: dim.name,
        label: dim.label_short || dim.label,
        value: cell ? (cell.rendered || cell.value) : '--',
        value_raw: cell ? cell.value : null,
        type: 'dimension'
      });
    });
  }

  return tokens;
};
