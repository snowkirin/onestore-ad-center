import React from 'react';
import AppDiver from '@components/AppDivider';
import AppTypography from '@components/AppTypography';
import styled from 'styled-components';
import clsx from 'clsx';

interface AppPageHeaderProps {
  title: React.ReactNode;
  extra?: React.ReactNode;
}
const StyledAppHeader = styled.div<{ extra?: React.ReactNode }>`
  & > div {
    padding: 0 30px;
  }
  .include-extra {
    display: flex;
    align-items: center;
  }
`;

const AppPageHeader: React.FC<AppPageHeaderProps> = ({ title, extra }) => {
  return (
    <StyledAppHeader>
      <div className={clsx({ 'include-extra': extra })}>
        <AppTypography.Headline style={{ lineHeight: '32px' }}>{title}</AppTypography.Headline>
        {extra && <div style={{ marginLeft: 15 }}>{extra}</div>}
      </div>
      <AppDiver style={{ margin: '14px 0' }} />
    </StyledAppHeader>
  );
};

export default AppPageHeader;
