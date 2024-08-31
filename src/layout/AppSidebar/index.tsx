import React from 'react';
import { Sidebar } from 'rsuite';
import AppSideNav from '@components/AppSideNavBar';

interface AppSidebarProps {}

const AppSidebar: React.FC<AppSidebarProps> = () => {
  return (
    <Sidebar
      width={160}
      style={{
        borderRight: '1px solid #d8d8d8',
      }}
    >
      <AppSideNav />
    </Sidebar>
  );
};

export default AppSidebar;
