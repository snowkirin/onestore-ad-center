import React from 'react';
import styled from 'styled-components';

interface ColProps {
  children?: React.ReactNode;
  isLabel?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const StyledCol = styled.div<ColProps>`
  ${(props) => (props.isLabel ? 'flex: 0 0 120px' : 'flex: 1 1 auto')}
`;

const Col: React.FC<ColProps> = ({ children, isLabel, style, className }) => {
  return (
    <StyledCol isLabel={isLabel} style={style} className={className}>
      {children}
    </StyledCol>
  );
};

export default Col;
