import React from 'react';
import styled from 'styled-components';

interface AppPageContentProps {
  children: React.ReactNode;
}

const StyledAppPageContent = styled.div``;

const AppPageContent: React.FC<AppPageContentProps> = ({ children }) => {
  return <StyledAppPageContent>{children}</StyledAppPageContent>;
};

export default AppPageContent;
