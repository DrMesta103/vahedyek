import type { CSSProperties } from 'react';

export const formControlStyle: CSSProperties = {
  width: '100%',
  minHeight: '42px',
  padding: '0 14px',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: '#374151',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
};

export const compactTextareaStyle: CSSProperties = {
  ...formControlStyle,
  minHeight: '96px',
  padding: '9px 14px',
  lineHeight: 1.7,
  resize: 'vertical',
};

export const formControlMutedDisabledStyle: CSSProperties = {
  background: '#f8fafc',
  color: '#9ca3af',
};

export const formLabelStyle: CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  marginBottom: '6px',
  display: 'block',
  fontWeight: '600',
};

export const formMetaLabelStyle: CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  marginBottom: '4px',
  display: 'block',
};

export const formErrorStyle: CSSProperties = {
  fontSize: '11px',
  color: '#ef4444',
  marginTop: '4px',
};

export const outlineButtonStyle: CSSProperties = {
  minHeight: '42px',
  padding: '0 16px',
  border: '1px solid #d1d5db',
  borderRadius: '999px',
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: '#4b5563',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
};

export const primaryButtonStyle: CSSProperties = {
  ...outlineButtonStyle,
  border: 'none',
  background: 'var(--dark-teal)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(0, 128, 128, 0.18)',
};

