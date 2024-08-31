import React from 'react';
import { Divider, DividerProps } from 'rsuite';
import styled from 'styled-components';

interface AppDividerProps extends DividerProps {}
const StyledDivider = styled(Divider)`
  background-color: var(--guide-line);
`;

const AppDivider: React.FC<AppDividerProps> = ({ ...props }) => {
  return <StyledDivider {...props} />;
};

export default AppDivider;
export const FinalActionDivider = styled(StyledDivider)`
  margin: 30px 0 60px 0;
`;
