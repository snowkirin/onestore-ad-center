import React from 'react';
import styled from 'styled-components';
import clsx from 'clsx';

interface RowProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
  className?: string;
}

const StyledRow = styled.div<RowProps>`
  display: flex;
  align-items: ${(props) => props.align};
`;

const Row: React.FC<RowProps> = ({ children, align, style, className }) => {
  return (
    <StyledRow className={clsx('app-row', className)} align={align} style={style}>
      {children}
    </StyledRow>
  );
};

export default Row;
