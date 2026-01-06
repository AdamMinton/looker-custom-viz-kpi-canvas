import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export const CanvasApp = ({ tokens, initialLayout, isEditMode, onSave, rowIntegrity, compactMode, scaleToFit }) => {
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
        value_raw: token ? token.value_raw : null, // Ensure raw value available for logic
        label: token ? token.label : item.label, // Update label if it changed in LookML? Or keep stored?
        // Keep stored format/style
      };
    });
  };

  const [items, setItems] = useState(() => hydrateItems(initialLayout.items || []));
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Sync from prop (initialLayout) when it changes from Looker
  useEffect(() => {
    if (!initialLayout || !initialLayout.items) return;



    // Only update if looks different from current state (State Mismatch)
    // AND if the remote timestamp is newer or equal to our last local modification
    const remoteTimestamp = initialLayout.timestamp || 0;
    if (remoteTimestamp < lastModificationTime.current) {
      return;
    }

    const hydratedNewItems = hydrateItems(initialLayout.items);

    const isDifferent = JSON.stringify(items.map(i => ({ ...i, value: '' }))) !== JSON.stringify(hydratedNewItems.map(i => ({ ...i, value: '' })));

    if (isDifferent) {

      // Update our local timestamp to match the accepted remote one to prevent future false positives
      lastModificationTime.current = remoteTimestamp;
      setItems(hydratedNewItems);
    }
  }, [initialLayout]);

  // Sync tokens when data updates (view mode primarily, but also edit)
  useEffect(() => {
    setItems(currentItems => {
      // Re-hydrate but preserve current UI state
      return currentItems.map(item => {
        if (item.type === 'text') return item;
        const token = tokens.find(t => t.id === item.fieldId);
        return {
          ...item,
          value: token ? token.value : 'missing',
          value_raw: token ? token.value_raw : null // Ensure raw value available for logic
        };
      });
    });
  }, [tokens]);

  // Save Logic
  // Debounce the save to Looker
  const lastModificationTime = useRef(initialLayout?.timestamp || 0);

  // Debounce the save to Looker
  const debouncedSave = useCallback(
    debounce((currentItems, timestamp) => {
      const state = {
        timestamp,
        items: currentItems.map(item => ({
          i: item.i,
          fieldId: item.fieldId,
          type: item.type,
          x: item.x, y: item.y, w: item.w, h: item.h,
          style: item.style,
          staticLabel: item.staticLabel,
          value: item.value,
          value_raw: item.value_raw,
          html: item.html,
          content: item.content,
          rules: item.rules,
          showLabel: item.showLabel
        }))
      };
      onSave(state);
    }, 500),
    []
  );

  const updateItems = (newItems) => {
    const now = Date.now();
    lastModificationTime.current = now;
    setItems(newItems);
    if (isEditMode) {
      debouncedSave(newItems, now);
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

    // In some browsers/React versions, dataTransfer might be empty in the drop event if not handled correctly.
    // But let's check what we get.
    const dataStr = event.dataTransfer ? event.dataTransfer.getData("text/plain") : null;

    if (!dataStr) {
      return;
    }

    const token = JSON.parse(dataStr);
    const newItem = {
      i: generateId(),
      fieldId: token.id,
      type: token.type,
      label: token.label,
      value: token.value,
      value_raw: token.value_raw, // Ensure logic works immediately on drop
      html: token.html,
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
        // If we are updating the fieldId, we must immediately grab the new value/label from tokens
        if (updates.fieldId) {
          const token = tokens.find(t => t.id === updates.fieldId);
          // We can return early here with the fresh token data
          // We also want to preserve existing style unless overridden? 
          // Logic below handles style merging, so let's just prep the base new props
          const newProps = {
            ...item,
            ...updates,
            value: token ? token.value : 'missing',
            value_raw: token ? token.value_raw : null,
            html: token ? token.html : null,
            label: token ? token.label : item.label,
          };
          // deep merge helper for style (reusing existing logic below for consistency)
          const newStyle = updates.style ? { ...item.style, ...updates.style } : item.style;
          return { ...newProps, style: newStyle };
        }

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
          rowIntegrity={rowIntegrity}
          compactMode={compactMode}
          scaleToFit={scaleToFit}
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
