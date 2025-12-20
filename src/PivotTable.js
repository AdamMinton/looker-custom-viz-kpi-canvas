import React from 'react';
import styled from 'styled-components';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.fontSize === 'large' ? '16px' : '12px'};
`;

const Th = styled.th`
  background-color: ${props => props.bgColor || '#f5f5f5'};
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.evenColor || '#ffffff'};
  }
  &:nth-child(odd) {
    background-color: ${props => props.oddColor || '#f9f9f9'};
  }
`;

export const PivotTable = ({ data, config, queryResponse, details, done }) => {
  const { pivots, fields } = queryResponse;
  const dimensions = fields.dimensions;
  const measures = fields.measures;

  // Render Logic
  // Matrix/Grid Layout based on user config.
  // We group measures into "Output Rows" based on their column assignment.
  // Implicit Logic: We assume N columns (config.num_grid_columns or 2).
  //
  // Algorithm:
  // 1. Group measures by their assigned Column Index (default 1).
  // 2. But user wants "Row 1 = M1(Col1), M2(Col2)".
  //    This implies we pair them by SEQUENCE.
  //    Actually, if user says M1 -> Col 1, M2 -> Col 2. They form a row together.
  //    If user says M3 -> Col 1, M4 -> Col 2. They form the NEXT row together.
  // 3. So we should bucket measures into "Grid Cells" based on (ColIndex).
  //    Then we "Zip" them into rows.
  // 4. Row 1 = [Col1_List[0], Col2_List[0], ...]
  // 5. Row 2 = [Col1_List[1], Col2_List[1], ...]
  // 6. Max Rows = Length of longest column list.

  const numCols = config.num_grid_columns || 2;
  const columns = Array.from({ length: numCols }, () => []);

  // Distribute measures into columns
  measures.forEach(measure => {
    // Get assigned column from config option, default to 1 (0-indexed logic)
    const colIdx = (config[`measure_${measure.name}_col`] || 1) - 1;
    // Safety check
    if (columns[colIdx]) {
      columns[colIdx].push(measure);
    } else {
      // If out of bounds fallback to col 0
      columns[0].push(measure);
    }
  });

  // Calculate number of output rows needed per data record
  const maxRows = Math.max(...columns.map(c => c.length));

  const handleDrill = (links, event) => {
    if (window.LookerCharts && window.LookerCharts.Utils && window.LookerCharts.Utils.openDrillMenu) {
      window.LookerCharts.Utils.openDrillMenu({
        links: links,
        event: event.nativeEvent || event
      });
    }
  };

  return (
    <Table fontSize={config.font_size}>
      <thead>
        <tr>
          {/* Row Number Header */}
          {config.show_row_numbers && <Th bgColor={config.header_bg_color}>#</Th>}

          {/* Dimension Headers (Standard) */}
          {dimensions.map((dim, idx) => (
            <Th key={`dim-${idx}`} bgColor={config.header_bg_color}>
              {dim.label_short || dim.label}
            </Th>
          ))}

          {/* User Custom Headers for Value Columns */}
          {/* Left-most metric name header */}
          <Th bgColor={config.header_bg_color}>{config.row_label_header || "Metric Name"}</Th>

          {/* Dynamic Value Columns Headers */}
          {Array.from({ length: numCols }).map((_, i) => (
            <Th key={`col-header-${i}`} bgColor={config.header_bg_color}>
              {config[`col_${i + 1}_header`] || `Result ${i + 1}`}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => {
          // For each data record, we render 'maxRows' table rows
          const rowsBuffer = [];
          for (let i = 0; i < maxRows; i++) {
            rowsBuffer.push(
              <Tr key={`${rowIdx}-${i}`} evenColor={config.even_row_color} oddColor={config.odd_row_color}>
                {/* Static Columns (Row #, Dims) - Span all rows for this record */}
                {i === 0 && config.show_row_numbers && (
                  <Td rowSpan={maxRows} style={{ verticalAlign: 'top' }}>{rowIdx + 1}</Td>
                )}

                    {i === 0 && dimensions.map(dim => {
                      const cell = row[dim.name];
                      return (
                            <Td key={dim.name} rowSpan={maxRows} style={{ verticalAlign: 'top' }}>
                              {cell ? (cell.rendered || cell.value) : ''}
                            </Td>
                          );
                        })}

                    {/* Metric Label Column - Taken from the measure in the FIRST column for this row */}
                    {/* If Column 1 has a measure at this index, use its label. Else empty. */}
                    {(() => {
                      const labelMeas = columns[0][i]; // Default label source is Col 1
                      return <Td style={{ fontWeight: 'bold' }}>{labelMeas ? (labelMeas.label_short || labelMeas.label) : ''}</Td>
                    })()}

                    {/* Value Columns */}
                    {columns.map((colMeasures, colIdx) => {
                      const measure = colMeasures[i];
                      if (!measure) {
                        return <Td key={`empty-${colIdx}`} />;
                      }

                      // Get cell data
                      // Note: We ignore PIVOTS in this specific layout request (User example was flat).
                      // If data IS pivoted, this usually breaks or we pick first pivot? 
                      // User example showed flat data: "Measure 1 | 100".
                      // If pivots exist, queryResponse.pivots.length > 0.
                      // We will just sum them or pick first? Standard flat usage implies generic value.
                      // But usually `row[measure.name]` object has `.value` for flat, 
                      // and `row[measure.name][pivotKey].value` for pivots.
                      // We will try to render 'value' if flat, or aggregate/warn if pivot?
                      // Safe fallback: JSON stringify if object? No.
                      // For now assume Flat Measures as per example.

                      const cellInfo = row[measure.name];
                      let content = '';
                      let links = [];

                          if (cellInfo && cellInfo.value !== undefined) {
                            // Flat data
                            content = cellInfo.rendered || cellInfo.value;
                            links = cellInfo.links || [];
                          } else if (cellInfo) {
                            // Pivoted data usually structure: { "pivot_key": { value: 10 }, ... }
                            // If user runs this on pivoted data, let's just grab the first pivot value as a fallback
                            // or join them? Joining is safest to "show" something.
                            content = Object.keys(cellInfo).filter(k => k !== 'links').map(k => cellInfo[k].rendered || cellInfo[k].value).join(' | ');
                          }

                          return (
                              <Td key={`val-${colIdx}`} onClick={(e) => links.length ? handleDrill(links, e) : null}>
                                {content}
                              </Td>
                          )
                        })}
                  </Tr>
                );
          }
          return rowsBuffer;
        })}
      </tbody>
    </Table>
  );
};
