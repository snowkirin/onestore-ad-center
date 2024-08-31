import React from 'react';
import { Header } from 'rsuite';
import AppGlobalNavBar from '@components/AppGlobalNavBar';

interface ComponentProps {}

const AppHeader: React.FC<ComponentProps> = () => {
  return (
    <Header>
      <AppGlobalNavBar />
    </Header>
  );
};

export default AppHeader;
