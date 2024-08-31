import React from 'react';

interface AppErrorMessageProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const AppErrorMessage: React.FC<AppErrorMessageProps> = ({ children, style }) => {
  return <div style={{ color: 'var(--rs-state-error)', ...style }}>{children} </div>;
};

export default AppErrorMessage;
