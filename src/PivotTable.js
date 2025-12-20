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
  const pivotFields = fields.pivots;

  // Flatten headers
  // For simple pivot (1 level), we have dimensions + (measures * pivots)

  // Note: Looker queryResponse.pivots contains the pivot keys/labels
  /*
    queryResponse.pivots = [
        { key: "2023-01", label: "2023-01", is_total: false, ... },
        { key: "2023-02", ... }
    ]
  */

  // Columns Structure:
  // [Dim 1, Dim 2, ...] + [Pivot1-Meas1, Pivot1-Meas2, ...] + [Pivot2-Meas1, ...]

  const headers = [];

  // Dimension Headers
  dimensions.forEach(dim => {
    headers.push({ label: dim.label_short || dim.label, type: 'dimension', name: dim.name });
  });

  // Pivot Headers
  // If we have pivots, we iterate them.
  // For each pivot key, we add columns for each measure.
  if (pivots && pivots.length > 0) {
    pivots.forEach(pivot => {
      const pivotLabel = pivot.label_short || pivot.label || pivot.key;
      measures.forEach(measure => {
        headers.push({
          label: `${pivotLabel} - ${measure.label_short || measure.label}`,
          type: 'measure',
          pivotKey: pivot.key,
          measureName: measure.name
        });
      });
    });
  } else {
    // No pivots, just measures
    measures.forEach(measure => {
      headers.push({ label: measure.label_short || measure.label, type: 'measure', measureName: measure.name });
    });
  }

  const handleDrill = (links, event) => {
    // LookerCharts global might not exist in all contexts
    if (window.LookerCharts && window.LookerCharts.Utils && window.LookerCharts.Utils.openDrillMenu) {
      window.LookerCharts.Utils.openDrillMenu({
        links: links,
        event: event.nativeEvent || event
      });
    } else {
      console.log('Drill menu clicked', links);
    }
  };

  return (
    <Table fontSize={config.font_size}>
      <thead>
        <tr>
          {config.show_row_numbers && <Th bgColor={config.header_bg_color}>#</Th>}
          {headers.map((col, idx) => (
            <Th key={idx} bgColor={config.header_bg_color}>{col.label}</Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <Tr key={rowIdx} evenColor={config.even_row_color} oddColor={config.odd_row_color}>
            {config.show_row_numbers && <Td>{rowIdx + 1}</Td>}

            {dimensions.map(dim => {
              const cell = row[dim.name];
              return (
                <Td key={dim.name}>
                  {cell ? (cell.rendered || cell.value) : ''}
                </Td>
              );
            })}

            {(!pivots || pivots.length === 0) && measures.map(measure => {
              const cell = row[measure.name];
              const links = cell.links || [];
              return (
                <Td key={measure.name} onClick={(e) => links.length ? handleDrill(links, e) : null}>
                  {cell ? (cell.rendered || cell.value) : ''}
                </Td>
              );
            })}

            {pivots && pivots.map(pivot => {
              return measures.map(measure => {
                // Accessing pivoted data: row[measure.name][pivot.key]
                const cell = row[measure.name] && row[measure.name][pivot.key];
                const key = `${pivot.key}-${measure.name}`;
                const links = cell ? (cell.links || []) : [];

                return (
                  <Td key={key} onClick={(e) => links.length ? handleDrill(links, e) : null}>
                    {cell ? (cell.rendered || cell.value) : ''}
                  </Td>
                );
              });
            })}
          </Tr>
        ))}
      </tbody>
    </Table>
  );
};
