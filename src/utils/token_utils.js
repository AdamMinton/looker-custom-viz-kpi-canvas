export const transformDataToTokens = (data, queryResponse) => {
  if (!data || !data.length || !queryResponse || !queryResponse.fields) {
    return [];
  }

  const { measures, dimensions, table_calculations } = queryResponse.fields;
  const tokens = [];

  // Iterate through EVERY row of data
  data.forEach((row, rowIndex) => {

    // 1. Build Row Context (Dimension Values)
    // Used to distinguish this row from others in labels (e.g. "Shipped, 2026-01")
    const rowContextParts = [];
    if (dimensions) {
      dimensions.forEach(dim => {
        if (row[dim.name] && row[dim.name].value) {
          rowContextParts.push(row[dim.name].value);
        }
      });
    }
    const rowContextString = rowContextParts.join(', ');

    // Helper to process a list of fields
    const processFields = (fields, type) => {
      if (!fields) return;
      fields.forEach(field => {
        const name = field.name;
        const cell = row[name];

        if (!cell) return; // Sparsity check

        // Check if this is a pivoted measure (value is NOT directly available, but it has keys)
        // Standard Looker cell has { value, rendered, html, ... }
        // Pivoted cell has { "pivot_key": { value... }, "pivot_key_2": { value... } }
        const isPivoted = !Object.prototype.hasOwnProperty.call(cell, 'value') &&
          Object.keys(cell).length > 0;

        if (isPivoted) {
          // Iterate Pivot Keys
          Object.keys(cell).forEach(pivotKey => {
            const subCell = cell[pivotKey];
            // Some pivot keys might be metadata keys if Looker adds any? 
            // Usually specific pivot keys look like "2026|FIELD|..." or are just strings.
            // We check if subCell looks like a valid value object
            if (!subCell || typeof subCell !== 'object') return;

            // Extract Values
            const value = subCell.rendered || subCell.value || '--';
            const value_raw = subCell.value;
            const html = subCell.html;

            // Generate Label (Field + Row Context + Pivot Context + Value)
            let label = field.label_short || field.label;

            // Pivot Context: "2026|FIELD|2025-12-29" -> "2026, 2025-12-29"
            const pivotContext = pivotKey.replace(/\|FIELD\|/g, ', ');

            // Composite Label
            // Format: "Count (Shipped, 2026-01 | 2026, 2025-12-29 : 86)"
            const contextParts = [];
            if (rowContextString) contextParts.push(rowContextString);
            if (pivotContext) contextParts.push(pivotContext);

            // Add view name context if merged (heuristic: name has parts)
            const nameParts = name.split('.');
            const viewName = nameParts.length > 0 ? nameParts[0] : '';

            if (viewName && !label.includes(viewName)) {
              contextParts.push(viewName);
            }

            // If viewName is just the standard view, it might be redundant, but good for safety.

            label = `${label} (${contextParts.join(' | ')} : ${value})`;

            tokens.push({
              id: `${name}:${rowIndex}:${pivotKey}`,
              label: label,
              value: value,
              value_raw: value_raw,
              html: html,
              type: type,
              is_numeric: field.is_numeric
            });
          });
        } else {
          // Standard Field (Not Pivoted)
          const value = cell.rendered || cell.value || '--';
          const value_raw = cell.value;
          const html = cell.html;

          let label = field.label_short || field.label;

          // For simple dimensions/measures, include Row Context only if it's NOT the dimension itself
          // Actually, for dimensions, the value IS the context. 
          // For measures, we want the row context.

          if (type === 'dimension') {
            // Dimension Token: "Status (Shipped)"
            // Or just "Status : Shipped"
            label = `${label} (${value})`;
          } else {
            // Measure Token: "Count (Shipped, 2026-01 : 86)"
            const contextParts = [];
            if (rowContextString) contextParts.push(rowContextString);

            // Add view name context if merged (heuristic: name has parts)
            const nameParts = name.split('.');
            const viewName = nameParts.length > 0 ? nameParts[0] : '';
            if (viewName && !label.includes(viewName)) {
              contextParts.push(viewName);
            }

            // Composite Label
            label = `${label} (${contextParts.join(' | ')} : ${value})`;
          }

          tokens.push({
            id: `${name}:${rowIndex}`,
            label: label,
            value: value,
            value_raw: value_raw,
            html: html,
            type: type,
            is_numeric: field.is_numeric
          });
        }
      });
    };

    processFields(measures, 'measure');
    processFields(dimensions, 'dimension');
    processFields(table_calculations, 'table_calculation');
  });

  return tokens;
};
