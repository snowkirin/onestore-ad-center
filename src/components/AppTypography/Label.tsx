import React from 'react';
import styled, { css } from 'styled-components';

interface TypographyLabelProps {
  children: React.ReactNode;
  isRequired?: boolean;
  style?: React.CSSProperties;
  className?: string;
  accepter?: React.ElementType;
}

const StyledTypographyLabel = styled.p<TypographyLabelProps>`
  font-size: var(--md-font-size);
  line-height: var(--md-line-height);
  font-weight: 700;
  ${({ isRequired }) =>
    isRequired &&
    css`
      ::after {
        content: '*';
        color: var(--primary-color);
      }
    `}
`;

const TypographyLabel: React.FC<TypographyLabelProps> = ({ children, isRequired, style, className, accepter }) => {
  return (
    <StyledTypographyLabel as={accepter} isRequired={isRequired} className={className} style={style}>
      {children}
    </StyledTypographyLabel>
  );
};

export default TypographyLabel;
