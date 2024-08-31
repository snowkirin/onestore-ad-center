import React from 'react';
import styled from 'styled-components';

interface AppPageFooterProps {
  children: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

const StyledAppPageFooter = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const AppPageFooter: React.FC<AppPageFooterProps> = ({ children, extra, ...props }) => {
  return (
    <StyledAppPageFooter {...props}>
      <div>{children}</div>
      {extra && <div style={{ position: 'absolute', left: 30 }}>{extra}</div>}
    </StyledAppPageFooter>
  );
};

export default AppPageFooter;
