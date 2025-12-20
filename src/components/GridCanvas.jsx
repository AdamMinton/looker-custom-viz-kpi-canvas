import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { CanvasItem } from './CanvasItem';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const RGL = require('react-grid-layout');
const ResponsiveGridLayout = RGL.Responsive;

const GridWrapper = styled.div`
  background: ${props => props.isEditMode ?
        `linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
     linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)`
        : 'transparent'};
  background-size: 20px 20px;
  min-height: 100%;
  position: relative;
  
  .react-grid-item.react-grid-placeholder {
      background: rgba(26, 115, 232, 0.2) !important;
      opacity: 0.5;
      border-radius: 4px;
  }
  
  .selected-item {
      outline: 2px solid #1a73e8;
      z-index: 100;
  }
`;

export const GridCanvas = ({
    layout,
    items,
    isEditMode,
    onLayoutChange,
    onRemoveItem,
    onSelectItem,
    selectedItemId,
    onDrop
}) => {
    const wrapperRef = useRef(null);
    const [width, setWidth] = useState(1200);

    // Resize Observer to handle dynamic width
    useEffect(() => {
        if (!wrapperRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // allow width to shrink so items flow down
                setWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    console.log("GridCanvas rendering. isEditMode:", isEditMode, "width:", width);

    return (
        <GridWrapper
            ref={wrapperRef}
            isEditMode={isEditMode}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
                e.preventDefault();
                // Fallback drop handler if RGL doesn't catch it
                // We fake a layout item at 0,Infinity (end) or 0,0
                // The handler in CanvasApp expects (layout, layoutItem, event)
                // We pass 'items' as layout.
                onDrop(items, { x: 0, y: Infinity, w: 2, h: 2, i: 'dropped_fallback' }, e);
            }}
        >
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                // Responsive columns to allow items to stack/flow down on smaller screens
                // We permit stacking on mobile (xs) for readability
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={50}
                width={width}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                isDroppable={isEditMode}
                onLayoutChange={(currentLayout, allLayouts) => {
                    // We DO NOT sync back to the parent 'items' state here anymore.
                    // Doing so would capture "responsive reflows" (e.g. stacking on mobile)
                    // and permanently overwrite the desktop layout.
                    console.log("RGL Layout Change (Reflow/Interaction) - Ignoring for persistence", currentLayout);
                }}
                onDragStop={(layout) => {
                    // Only save state when the user explicitly finishes a drag action
                    console.log("Drag Stop - Saving Layout");
                    onLayoutChange(layout);
                }}
                onResizeStop={(layout) => {
                    // Only save state when the user explicitly finishes a resize action
                    console.log("Resize Stop - Saving Layout");
                    onLayoutChange(layout);
                }}
                onDrop={onDrop}
                droppingItem={{ i: 'dropping', w: 2, h: 2, placeholder: true }}
                measureBeforeMount={false}
                useCSSTransforms={true}
                // Calculate dynamic minHeight based on items to avoid "too large" canvas
                style={{
                    minHeight: items.length > 0
                        ? (Math.max(...items.map(i => i.y + i.h)) * 50 + 100) + 'px'
                        : '200px'
                }}
            >
                {items.map(item => (
                    <div key={item.i}>
                        <CanvasItem
                            item={item}
                            isEditMode={isEditMode}
                            onRemove={onRemoveItem}
                            onClick={() => onSelectItem(item.i)}
                            isSelected={selectedItemId === item.i}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </GridWrapper>
    );
};
