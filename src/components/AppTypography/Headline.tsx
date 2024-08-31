import React from 'react';
import styled from 'styled-components';

interface TypographyHeadlineProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StyledTypographyHeadline = styled.h1<TypographyHeadlineProps>`
  font-size: var(--xxl-font-size);
  line-height: var(--xxl-line-height);
`;

const TypographyHeadline: React.FC<TypographyHeadlineProps> = ({ children, className, style, ...props }) => {
  return (
    <StyledTypographyHeadline className={className} style={style} {...props}>
      {children}
    </StyledTypographyHeadline>
  );
};

export default TypographyHeadline;
