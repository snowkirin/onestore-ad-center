import React from 'react';
import styled from 'styled-components';

interface WrapButtonsProps {
  children: React.ReactNode;
  extra?: React.ReactNode;
}

const StyledWrapButtons = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  .extra__button {
    position: absolute;
    left: 0;
  }
`;

const WrapButtons: React.FC<WrapButtonsProps> = ({ children, extra }) => {
  return (
    <StyledWrapButtons>
      {children}
      {extra && <div className="extra__button">{extra}</div>}
    </StyledWrapButtons>
  );
};

export default WrapButtons;
