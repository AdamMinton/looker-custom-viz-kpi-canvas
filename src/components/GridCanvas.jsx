import React from 'react';
import styled from 'styled-components';
import { CanvasItem } from './CanvasItem';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const RGL = require('react-grid-layout');
const ResponsiveGridLayout = RGL.Responsive;

const GridWrapper = styled.div`
  background: ${props => props.isEditMode ? '#fafafa' : 'transparent'};
  min-height: 100%;
  position: relative;
  
  .react-grid-item.react-grid-placeholder {
      background: rgba(0,0,0,0.1) !important;
      opacity: 0.5;
  }
  
  .selected-item {
      outline: 2px solid #1a73e8;
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

    // We map internal items to the layout format expected by RGL if needed, 
    // but usually 'layout' prop is sufficient if kept in sync.
    // Spec says state has "items" which contain "layout props" (x,y,w,h).
    // So we can just generate the Children.

    console.log("GridCanvas rendering. isEditMode:", isEditMode, "isDroppable:", isEditMode, "width:", 1200);
    return (
        <GridWrapper
            isEditMode={isEditMode}
            onDragOver={(e) => { e.preventDefault(); console.log("DragOver wrapper"); }}
            onDrop={(e) => {
                e.preventDefault();
                console.log("Wrapper onDrop fired!");
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
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={50}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                isDroppable={isEditMode}
                onLayoutChange={(currentLayout) => onLayoutChange(currentLayout)}
                onDrop={onDrop}
                droppingItem={{ i: 'dropping', w: 2, h: 2 }}
                measureBeforeMount={false}
                useCSSTransforms={true}
                style={{ minHeight: '600px', border: '5px solid red' }}
                onDragEnter={(e) => console.log("Grid DragEnter")}
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
