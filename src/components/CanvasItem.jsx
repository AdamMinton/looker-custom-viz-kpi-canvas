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
  padding: 8px;
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
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-weight: bold;
  white-space: nowrap;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CanvasItem = ({ item, isEditMode, onRemove, onClick, isSelected, ...props }) => {
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
  // We mock a token object using 'value_raw' if available in item (which comes from hydration)
  if (rules && rules.length > 0) {
    // NOTE: We rely on 'item' having value_raw populated during hydration in CanvasApp
    const effectiveStyle = evaluateRules({ value_raw: item.value_raw }, rules, itemStyle);
    itemStyle = { ...itemStyle, ...effectiveStyle };
  }

  const renderIcon = () => {
    // Default icon or specific one from rules?
    // For now, let's just use some logic or a default Circle
    // If we implement icon selection in rules, we'd read it from itemStyle.icon or similar?
    // But the spec says "Status Indicator" is a traffic light.

    const IconComponent = Circle; // Default
    // We could map specific icon names if we extended the rule system to return icon names.
    // For MVP "traffic light", the Color is the main thing.

    return <IconComponent size={parseInt(itemStyle.fontSize) || 24} color={itemStyle.color} fill={itemStyle.color} />;
  };

  return (
    <ItemContainer 
      isEditMode={isEditMode} 
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
            <div>{content}</div>
      ) : type === 'status_indicator' ? (
        <>
          <Label>{staticLabel || label || 'Status'}</Label>
          <IconWrapper>
            {renderIcon()}
          </IconWrapper>
        </>
        ) : (
            <>
              {/* Debugging: display value_raw in label for a moment if needed, or just log */}
              {/* <div style={{fontSize: 8}}>{JSON.stringify(item.value_raw)}</div> */}
              <Label>{staticLabel || label}</Label>
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
