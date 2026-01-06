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
  min-height: ${props => (props.isEditMode || props.scaleToFit) ? '100%' : 'auto'};
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
    onDrop,
    rowIntegrity,
    compactMode,
    scaleToFit
}) => {
    const wrapperRef = useRef(null);
    const [width, setWidth] = useState(1200);
    const [height, setHeight] = useState(800);

    // Resize Observer to handle dynamic width
    useEffect(() => {
        if (!wrapperRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // allow width to shrink so items flow down
                setWidth(entry.contentRect.width);
                setHeight(entry.contentRect.height);
            }
        });

        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    console.log("GridCanvas rendering. isEditMode:", isEditMode, "width:", width);

    // Scaling Logic
    let scale = 1;
    let gridStyle = {};

    // Safety check for empty items to avoid invalid math
    const maxY = items.length > 0 ? Math.max(...items.map(i => i.y + i.h)) : 0;
    const rowH = compactMode ? 30 : 50;
    // Estimated content height (maxY * rowHeight + padding/margin buffer)
    // Reduce buffer to ensure tight fit, especially in compact mode
    const buffer = compactMode ? 10 : 20;
    const contentHeight = maxY * rowH + buffer;

    if (scaleToFit && height > 0 && contentHeight > 0) {
        // Calculate scale needed to fit content height into container height
        const scaleY = height / contentHeight;
        // Cap scale at 1 (don't zoom in if content is smaller, unless desired? usually fit means shrink)
        // Let's cap at 1 to prevent pixelation invalidation, or maybe allow it?
        // "Scale to fix layout" usually means shrink.
        scale = Math.min(1, scaleY);
    }

    if (scaleToFit) {
        gridStyle = {
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            // When scaling down, we might want to occupy the full width visually.
            // If we just scale, width shrinks.
            // To keep width: set width = containerWidth / scale
            width: `${width / scale}px`,
            minHeight: `${contentHeight}px` // Ensure RGL has enough height
        };
    } else {
        gridStyle = {
            minHeight: items.length > 0
                ? (contentHeight + 'px')
                : (compactMode ? '60px' : '100px')
        };
    }

    return (
        <GridWrapper
            ref={wrapperRef}
            isEditMode={isEditMode}
            scaleToFit={scaleToFit}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
                e.preventDefault();
                // Fallback drop handler if RGL doesn't catch it
                onDrop(items, { x: 0, y: Infinity, w: 2, h: 2, i: 'dropped_fallback' }, e);
            }}
            style={scaleToFit ? { overflow: 'hidden' } : {}} // Hide scrollbars if scaling to fit
        >
            <div style={gridStyle}>
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                // Responsive columns to allow items to stack/flow down on smaller screens
                // We permit stacking on mobile (xs) for readability
                    // IF rowIntegrity is true, we force 12 columns everywhere to prevent wrapping
                    cols={rowIntegrity
                        ? { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }
                        : { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
                    }
                    rowHeight={compactMode ? 30 : 50}
                    margin={compactMode ? [5, 5] : [10, 10]}
                    width={scaleToFit ? (width / scale) : width}
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
            >
                {items.map(item => (
                    <div key={item.i}>
                        <CanvasItem
                            item={item}
                            isEditMode={isEditMode}
                            onRemove={onRemoveItem}
                            onClick={() => onSelectItem(item.i)}
                            isSelected={selectedItemId === item.i}
                            compactMode={compactMode}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
            </div>
        </GridWrapper>
    );
};
