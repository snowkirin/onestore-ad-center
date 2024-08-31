import React from 'react';

interface AppStepItemProps {
  children?: React.ReactNode;
}

const AppStepItem: React.FC<AppStepItemProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default AppStepItem;
