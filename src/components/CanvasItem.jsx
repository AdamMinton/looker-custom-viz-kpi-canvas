import React from 'react';
import styled from 'styled-components';
import { X, Circle, ArrowUp, ArrowDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { evaluateRules } from '../utils/rules_utils';

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
  padding: ${props => props.compactMode ? '4px' : '8px'};
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.isEditMode ? 'pointer' : 'default'};
  
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
  font-size: ${props => props.compactMode ? '10px' : '12px'};
  color: #666;
  margin-bottom: ${props => props.compactMode ? '2px' : '4px'};
`;

const Value = styled.div`
  font-weight: bold;
  white-space: nowrap;

  /* Force inner HTML to inherit font-size in case of inline styles from Looker */
  & * {
    font-size: inherit !important;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CanvasItem = ({ item, isEditMode = false, onRemove, onClick, isSelected, compactMode, ...props }) => {
  const { style, staticLabel, label, value, type, content, rules, value_raw } = item;

  // Merge default styles with item styles
  let itemStyle = {
    color: style?.color || '#333',
    fontSize: style?.fontSize || '24px',
    textAlign: style?.textAlign || 'center',
    fontWeight: style?.fontWeight || 'bold',
    ...style
  };

  // Apply Conditional Logic
  if (rules && rules.length > 0) {
    const effectiveStyle = evaluateRules({ value_raw: item.value_raw }, rules, itemStyle);
    itemStyle = { ...itemStyle, ...effectiveStyle };
  }

  const renderIcon = () => {
    const IconComponent = Circle; 
    return <IconComponent size={parseInt(itemStyle.fontSize) || 24} color={itemStyle.color} fill={itemStyle.color} />;
  };

  return (
    <ItemContainer 
      isEditMode={isEditMode} 
      compactMode={compactMode}
      style={itemStyle} 
      className={isSelected ? 'selected-item' : ''}
      onClick={isEditMode ? (e) => {
        e.stopPropagation();
        onClick();
      } : undefined}
      {...props} 
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
        <div style={{ fontSize: itemStyle.fontSize, color: itemStyle.color }}>
          {content}
        </div>
      ) : type === 'status_indicator' ? (
        <>
            <Label compactMode={compactMode}>{staticLabel || label || 'Status'}</Label>
          <IconWrapper>
            {renderIcon()}
          </IconWrapper>
        </>
        ) : (
            <>
              {(item.showLabel !== false) && <Label compactMode={compactMode}>{staticLabel || label}</Label>}
              {item.html ? (
                <Value
                  style={{ fontSize: itemStyle.fontSize, color: itemStyle.color }}
                  dangerouslySetInnerHTML={{ __html: item.html }}
                />
              ) : (
                  <Value style={{ fontSize: itemStyle.fontSize, color: itemStyle.color }}>{value}</Value>
              )}
            </>
        )}
    </ItemContainer>
  );
};
