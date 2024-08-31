import { Popover as RsuitePopover } from 'rsuite';
import styled, { css } from 'styled-components';

const themeMapper = {
  white: css`
    background-color: var(--w000);
    color: var(--primary-color);
  `,
  orange: css`
    background-color: var(--sub-color02);
    color: var(--w000);
    &.rs-popover[class*='placement-right'] > .rs-popover-arrow::after {
      border-right-color: var(--sub-color02);
    }
    &.rs-popover[class*='placement-left'] > .rs-popover-arrow::after {
      border-left-color: var(--sub-color02);
    }
    &.rs-popover[class*='placement-top'] > .rs-popover-arrow::after {
      border-top-color: var(--sub-color02);
    }
    &.rs-popover[class*='placement-bottom'] > .rs-popover-arrow::after {
      border-bottom-color: var(--sub-color02);
    }
  `,
};

const sizeMapper = {
  md: css`
    padding: 20px;
  `,
  sm: css`
    padding: 8px 15px;
  `,
};

type PopoverProps = {
  theme: 'white' | 'orange';
  size: 'md' | 'sm';
};
const AppPopover = styled(RsuitePopover)`
  ${({ theme = 'white' }: PopoverProps) => themeMapper[theme]};
  ${({ size = 'md' }: PopoverProps) => sizeMapper[size]};
`;

export default AppPopover;
export const PopoverContainer = styled.div`
  max-width: 15em;
  text-overflow: ellipsis;
  word-break: break-all;
`;
