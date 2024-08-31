import React from 'react';
import AppStepItem from '@components/AppStep/AppStepItem';
import styled from 'styled-components';

interface AppStepProps {
  children: React.ReactNode;
}

const StyledAppStep = styled<any>(styled.div``)`
  display: flex;
`;
const AppStep = ({ children, ...rest }: AppStepProps) => {
  return <StyledAppStep {...rest}>{children}</StyledAppStep>;
};

AppStep.Item = AppStepItem;

export default AppStep;
