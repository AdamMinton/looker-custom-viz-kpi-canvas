import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';

const ItemContainer = styled.div`
  height: 100%;
  width: 100%;
  background: white;
  border: ${props => props.isEditMode ? '1px dashed #ccc' : 'none'};
  box-shadow: ${props => props.isEditMode ? 'none' : 'none'}; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${props => props.style.textAlign || 'center'};
  padding: 8px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  
  &:hover .delete-btn {
    display: flex;
  }
`;

const DeleteButton = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  background: #ffcccc;
  border-radius: 4px;
  padding: 2px;
  display: none;
  z-index: 10;
`;

const Label = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-weight: bold;
  white-space: nowrap;
`;

export const CanvasItem = ({ item, isEditMode, onRemove, onClick, isSelected, ...props }) => {
  const { style, staticLabel, label, value, type, content } = item;

  // Merge default styles with item styles
  const itemStyle = {
    color: style?.color || '#333',
    fontSize: style?.fontSize || '24px',
    textAlign: style?.textAlign || 'center',
    fontWeight: style?.fontWeight || 'bold',
    ...style
  };

  return (
    <ItemContainer 
      isEditMode={isEditMode} 
      style={itemStyle} 
      className={isSelected ? 'selected-item' : ''}
      onClick={isEditMode ? onClick : undefined}
      {...props} // Pass props from react-grid-layout (style, className, onMouseDown, etc.)
    >
        {isEditMode && (
         <DeleteButton className="delete-btn" onClick={(e) => {
             e.stopPropagation();
             onRemove(item.i);
         }}>
             <X size={12} color="red" />
         </DeleteButton>
        )}

        {type === 'text' ? (
            <div>{content}</div>
        ) : (
            <>
                <Label>{staticLabel || label}</Label>
                <Value style={{ fontSize: itemStyle.fontSize }}>{value}</Value>
            </>
        )}
    </ItemContainer>
  );
};
