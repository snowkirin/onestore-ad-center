import React from 'react';
import styled, { css } from 'styled-components';

interface TypographyTextProps {
  type?: 'body' | 'sub';
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  accepter?: React.ElementType;
  onClick?: () => void;
}

const StyledTypographyText = styled.p<TypographyTextProps>`
  ${({ type }) =>
    type === 'body' &&
    css`
      font-size: var(--md-font-size);
      line-height: var(--md-line-height);
    `}
  ${({ type }) =>
    type === 'sub' &&
    css`
      font-size: var(--sm-font-size);
      line-height: var(--sm-line-height);
      color: #9a9a9a;
    `}
`;

const TypographyText: React.FC<TypographyTextProps> = ({
  type = 'body',
  children,
  style,
  accepter,
  className,
  onClick,
}) => {
  return (
    <StyledTypographyText as={accepter} className={className} type={type} style={style} onClick={onClick}>
      {children}
    </StyledTypographyText>
  );
};

export default TypographyText;
