import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { debounce } from 'lodash';
import { GridCanvas } from './components/GridCanvas';
import { Sidebar } from './components/Sidebar';

const AppContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const CanvasArea = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background: ${props => props.isEditMode ? '#f0f0f0' : 'white'};
`;

const generateId = () => Math.random().toString(36).substr(2, 9);

export const CanvasApp = ({ tokens, initialLayout, isEditMode, onSave }) => {
  // State
  // We store 'items' which contains both content AND layout data
  // initialLayout structure: { items: [ { i, fieldId, x, y, w, h, ... } ] }

  // Merge tokens (values) into stored items (layout)
  // We need to hydrate the items with current values from tokens
  const hydrateItems = (storedItems) => {
    return storedItems.map(item => {
      if (item.type === 'text') return item;

      // Find current data token
      const token = tokens.find(t => t.id === item.fieldId);
      return {
        ...item,
        value: token ? token.value : 'missing',
        label: token ? token.label : item.label, // Update label if it changed in LookML? Or keep stored?
        // Keep stored format/style
      };
    });
  };

  const [items, setItems] = useState(() => hydrateItems(initialLayout.items || []));
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Sync tokens when data updates (view mode primarily, but also edit)
  useEffect(() => {
    setItems(currentItems => {
      // Re-hydrate but preserve current UI state
      return currentItems.map(item => {
        if (item.type === 'text') return item;
        const token = tokens.find(t => t.id === item.fieldId);
        return {
          ...item,
          value: token ? token.value : 'missing'
        };
      });
    });
  }, [tokens]);

  // Save Logic
  // Debounce the save to Looker
  const debouncedSave = useCallback(
    debounce((currentItems) => {
      const state = {
        items: currentItems.map(item => ({
          i: item.i,
          fieldId: item.fieldId,
          type: item.type,
          x: item.x, y: item.y, w: item.w, h: item.h,
          style: item.style,
          staticLabel: item.staticLabel,
          content: item.content
        }))
      };
      onSave(state);
    }, 1000),
    []
  );

  const updateItems = (newItems) => {
    setItems(newItems);
    if (isEditMode) {
      debouncedSave(newItems);
    }
  };

  const handleLayoutChange = (newLayout) => {
    // Merge new coordinates (newLayout) into our items state
    const updatedItems = items.map(item => {
      const layoutItem = newLayout.find(l => l.i === item.i);
      if (layoutItem) {
        return { ...item, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h };
      }
      return item;
    });
    updateItems(updatedItems);
  };

  const handleDrop = (layout, layoutItem, _event) => {
    // The _event in RGL onDrop matches the drag event
    // We parse the dataTransfer to get the token
    const event = _event.nativeEvent || _event;
    const dataStr = event.dataTransfer.getData("text/plain");
    if (!dataStr) return;

    const token = JSON.parse(dataStr);
    const newItem = {
      i: generateId(),
      fieldId: token.id,
      type: token.type,
      label: token.label,
      value: token.value,
      content: token.content,
      x: layoutItem.x,
      y: layoutItem.y,
      w: 2,
      h: 2,
      style: {
        fontSize: '24px',
        textAlign: 'center'
      }
    };

    const newItems = [...items, newItem];
    updateItems(newItems);
    setSelectedItemId(newItem.i); // Auto-select dropped item
  };

  const handleRemoveItem = (id) => {
    updateItems(items.filter(i => i.i !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleUpdateItem = (id, updates) => {
    const updatedItems = items.map(item => {
      if (item.i === id) {
        // deep merge helper for style
        const newStyle = updates.style ? { ...item.style, ...updates.style } : item.style;
        return { ...item, ...updates, style: newStyle };
      }
      return item;
    });
    updateItems(updatedItems);
  };

  const selectedItem = items.find(i => i.i === selectedItemId);

  return (
    <AppContainer>
      <CanvasArea isEditMode={isEditMode} onClick={() => setSelectedItemId(null)}>
        <GridCanvas
          layout={items} // RGL accepts array of objects with x,y,w,h
          items={items}
          isEditMode={isEditMode}
          onLayoutChange={handleLayoutChange}
          onDrop={handleDrop}
          onRemoveItem={handleRemoveItem}
          onSelectItem={(id) => setSelectedItemId(id)}
          selectedItemId={selectedItemId}
        />
      </CanvasArea>

      {isEditMode && (
        <Sidebar
          tokens={tokens}
          selectedItem={selectedItem}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </AppContainer>
  );
};
