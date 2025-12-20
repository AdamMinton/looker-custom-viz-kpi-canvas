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
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                // Lock columns to 12 across all breakpoints to prevent reflow during sidebar toggle
                cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                rowHeight={50}
                width={width}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                isDroppable={isEditMode}
                onLayoutChange={(currentLayout) => onLayoutChange(currentLayout)}
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
                    <div key={item.i} data-grid={{ x: item.x, y: item.y, w: item.w, h: item.h }}>
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
