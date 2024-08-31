import React from 'react';
import { Content } from 'rsuite';
import { Outlet } from 'react-router-dom';
import './style.less';

interface AppContentProps {
}

const AppContent: React.FC<AppContentProps> = () => {
  return (
    <Content className={'app-content'}>
      <Outlet />
    </Content>
  );
};

export default AppContent;