import React from 'react';
import styled, { css } from 'styled-components';

interface TypographySubTitleProps {
  level: 1 | 2;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StyledTypographySubTitle = styled.div<TypographySubTitleProps>`
  ${({ level }) =>
    level === 1 &&
    css`
      font-size: var(--xl-font-size);
      line-height: var(--xl-line-height);
    `}
  ${({ level }) =>
    level === 2 &&
    css`
      font-size: var(--lg-font-size);
      line-height: var(--lg-line-height);
    `}
`;

const TypographySubTitle: React.FC<TypographySubTitleProps> = ({ level = 1, children, className, style, ...props }) => {
  const HeadingTag = `h${level + 1}` as keyof JSX.IntrinsicElements;
  return (
    <StyledTypographySubTitle as={HeadingTag} level={level} className={className} style={style} {...props}>
      {children}
    </StyledTypographySubTitle>
  );
};

export default TypographySubTitle;
