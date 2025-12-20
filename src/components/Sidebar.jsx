import React from 'react';
import styled from 'styled-components';
import { Type, Grid, Settings, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Activity } from 'lucide-react';

const SidebarContainer = styled.div`
  width: 300px;
  background: white;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: -2px 0 5px rgba(0,0,0,0.05);
  overflow-y: auto;
`;

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DraggableItem = styled.div`
  background: #fdfdfd;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  
  &:hover {
    border-color: #1a73e8;
    background: #f0f7ff;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
  
  label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
  
  input, select {
    width: 100%;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
  }
  
  input[type="color"] {
    height: 32px;
    padding: 2px;
  }
`;

const IconGroup = styled.div`
  display: flex;
  gap: 8px;
  
  button {
    padding: 6px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.active {
      background: #e6f1fc;
      border-color: #1a73e8;
      color: #1a73e8;
    }
  }
`;

export const Sidebar = ({ tokens, selectedItem, onUpdateItem }) => {
    
    const handleDragStart = (e, token) => {
        // Transfer data for the drop
        e.dataTransfer.setData("text/plain", JSON.stringify(token));
        e.dataTransfer.dropEffect = "copy";
    };

    return (
        <SidebarContainer>
            {selectedItem ? (
                <Section>
                    <SectionTitle><Settings size={14} /> Properties</SectionTitle>
                    
                    <FormGroup>
                        <label>Label</label>
                        <input 
                            type="text" 
                            value={selectedItem.staticLabel || selectedItem.label || ''} 
                            onChange={(e) => onUpdateItem(selectedItem.i, { staticLabel: e.target.value })}
                        />
                    </FormGroup>

                    {(selectedItem.type === 'measure' || selectedItem.type === 'status_indicator') && (
                        <FormGroup>
                            <label>Data Binding</label>
                            <select
                                value={selectedItem.fieldId || ''}
                                onChange={(e) => onUpdateItem(selectedItem.i, { fieldId: e.target.value })}
                            >
                                <option value="">-- Select Metric --</option>
                                {tokens.map(token => (
                                    <option key={token.id} value={token.id}>{token.label}</option>
                                ))}
                            </select>
                        </FormGroup>
                    )}

                    {selectedItem.type === 'text' && (
                        <FormGroup>
                            <label>Content</label>
                            <input 
                                type="text" 
                                value={selectedItem.content || ''} 
                                onChange={(e) => onUpdateItem(selectedItem.i, { content: e.target.value })}
                            />
                        </FormGroup>
                    )}

                    <FormGroup>
                        <label>Font Size</label>
                        <input 
                            type="text" 
                            value={selectedItem.style?.fontSize || '24px'} 
                            onChange={(e) => onUpdateItem(selectedItem.i, { style: { ...selectedItem.style, fontSize: e.target.value } })}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Color</label>
                        <input 
                            type="color" 
                            value={selectedItem.style?.color || '#000000'} 
                            onChange={(e) => onUpdateItem(selectedItem.i, { style: { ...selectedItem.style, color: e.target.value } })}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Alignment</label>
                        <IconGroup>
                            {['left', 'center', 'right'].map(align => (
                                <button 
                                    key={align}
                                    className={selectedItem.style?.textAlign === align ? 'active' : ''}
                                    onClick={() => onUpdateItem(selectedItem.i, { style: { ...selectedItem.style, textAlign: align } })}
                                >
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                </button>
                            ))}
                        </IconGroup>
                    </FormGroup>

                    {/* Conditional Logic Editor */}
                    <Section style={{ borderBottom: 'none' }}>
                        <SectionTitle>
                            Conditional Logic
                            <button
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8' }}
                                onClick={() => {
                                    const newRule = {
                                        id: Date.now().toString(),
                                        operator: 'lt',
                                        threshold: 0,
                                        styleTarget: 'text',
                                        effectValue: '#ff0000'
                                    };
                                    const currentRules = selectedItem.rules || [];
                                    onUpdateItem(selectedItem.i, { rules: [...currentRules, newRule] });
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </SectionTitle>

                        {(selectedItem.rules || []).map((rule, idx) => (
                            <div key={rule.id} style={{ background: '#f8f9fa', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                    <select
                                        value={rule.operator}
                                        onChange={(e) => {
                                            const updatedRules = [...selectedItem.rules];
                                            updatedRules[idx] = { ...rule, operator: e.target.value };
                                            onUpdateItem(selectedItem.i, { rules: updatedRules });
                                        }}
                                        style={{ flex: 1, padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        <option value="gt">&gt;</option>
                                        <option value="lt">&lt;</option>
                                        <option value="gte">&ge;</option>
                                        <option value="lte">&le;</option>
                                        <option value="eq">=</option>
                                        <option value="between">Btwn</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={rule.threshold}
                                        onChange={(e) => {
                                            const updatedRules = [...selectedItem.rules];
                                            updatedRules[idx] = { ...rule, threshold: e.target.value };
                                            onUpdateItem(selectedItem.i, { rules: updatedRules });
                                        }}
                                        style={{ width: '60px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        placeholder="Val"
                                    />
                                </div>

                                {rule.operator === 'between' && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <input
                                            type="number"
                                            value={rule.threshold_secondary || 0}
                                            onChange={(e) => {
                                                const updatedRules = [...selectedItem.rules];
                                                updatedRules[idx] = { ...rule, threshold_secondary: e.target.value };
                                                onUpdateItem(selectedItem.i, { rules: updatedRules });
                                            }}
                                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                            placeholder="Secondary Val"
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <select
                                        value={rule.styleTarget}
                                        onChange={(e) => {
                                            const updatedRules = [...selectedItem.rules];
                                            updatedRules[idx] = { ...rule, styleTarget: e.target.value };
                                            onUpdateItem(selectedItem.i, { rules: updatedRules });
                                        }}
                                        style={{ flex: 1, padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        <option value="text">Text Color</option>
                                        <option value="background">Background</option>
                                        {/* Simple way to change icon color is using text color usually, or separate target? */}
                                        <option value="icon">Icon Color</option>
                                    </select>
                                    <input
                                        type="color"
                                        value={rule.effectValue}
                                        onChange={(e) => {
                                            const updatedRules = [...selectedItem.rules];
                                            updatedRules[idx] = { ...rule, effectValue: e.target.value };
                                            onUpdateItem(selectedItem.i, { rules: updatedRules });
                                        }}
                                        style={{ width: '30px', height: '28px', padding: '0', border: 'none' }}
                                    />
                                    <button
                                        onClick={() => {
                                            const updatedRules = selectedItem.rules.filter(r => r.id !== rule.id);
                                            onUpdateItem(selectedItem.i, { rules: updatedRules });
                                        }}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545', marginLeft: 'auto' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </Section>

                </Section>
            ) : (
                <Section style={{ padding: '32px 16px', textAlign: 'center', color: '#999' }}>
                    Select an item on the canvas to edit its properties.
                </Section>
            )}

            <Section>
                <SectionTitle><Grid size={14} /> Metric Palette</SectionTitle>
                {tokens.map(token => (
                    <DraggableItem 
                        key={token.id} 
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, { ...token, type: 'measure' })}
                        unselectable="on"
                    >
                        {token.label}
                    </DraggableItem>
                ))}
            </Section>

            <Section>
                <SectionTitle><Type size={14} /> Tools</SectionTitle>
                <DraggableItem 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, { type: 'text', content: 'New Text', label: 'Static Text' })}
                    unselectable="on"
                >
                    <Type size={14} /> Static Text Block
                </DraggableItem>
                <DraggableItem
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, { type: 'status_indicator', label: 'Status', rules: [] })}
                    unselectable="on"
                >
                    <Activity size={14} /> Status Indicator
                </DraggableItem>
            </Section>
        </SidebarContainer>
    );
};
