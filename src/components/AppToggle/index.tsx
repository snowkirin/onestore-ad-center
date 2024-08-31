import React from 'react';
import { Toggle, ToggleProps } from 'rsuite';
import styled from 'styled-components';

interface AppToggleProps extends ToggleProps {}

const StyledToggle = styled(Toggle)`
  & .rs-toggle-presentation {
    min-width: 30px;
    height: 16px;
    &:after {
      width: 12px;
      height: 12px;
    }
  }

  &.rs-toggle-checked .rs-toggle-presentation::after {
    margin-left: -14px;
  }
  &.rs-toggle-sm .rs-toggle-loader {
    margin: 0;
    left: 6px;
    top: 0;
  }
`;

const AppToggle: React.FC<AppToggleProps> = ({ ...props }) => {
  return <StyledToggle {...props} size={'sm'} />;
};

export default AppToggle;
