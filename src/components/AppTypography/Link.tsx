import React from 'react';
import styled from 'styled-components';

interface TypographyLinkProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const StyledTypographyLink = styled.a<TypographyLinkProps>`
  ${(props) => {
    switch (props.size) {
      case 'sm':
        return 'font-size: var(--sm-font-size); line-height: var(--sm-line-height);';
      case 'md':
        return 'font-size: var(--md-font-size); line-height: var(--md-line-height);';
      case 'lg':
        return 'font-size: var(--lg-font-size); line-height: var(--lg-line-height);';
    }
  }}
  text-decoration: underline;
  cursor: pointer;
`;

const TypographyLink: React.FC<TypographyLinkProps> = ({ children, style, className, onClick, size = 'sm' }) => {
  return (
    <StyledTypographyLink className={className} style={style} onClick={onClick} size={size}>
      {children}
    </StyledTypographyLink>
  );
};

export default TypographyLink;
