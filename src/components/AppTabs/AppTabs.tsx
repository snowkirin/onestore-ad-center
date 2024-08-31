import React from 'react';
import { Nav, NavProps } from 'rsuite';
import styled from 'styled-components';

const StyledNav = styled(Nav)`
  &.rs-nav.rs-nav-horizontal .rs-nav-item {
    min-width: 120px;
    text-align: center;
    padding-bottom: 18px;
    font-size: 13px;
  }

  .rs-nav-item > .rs-nav-item-content {
    font-size: 13px;
    color: var(--b700);
    padding: 12px;
    height: 44px;
  }

  &.rs-nav-subtle.rs-nav-horizontal .rs-nav-item > .rs-nav-item-content::before {
    background-color: var(--primary-color);
  }
  &.rs-nav-subtle.rs-nav-horizontal .rs-nav-item.rs-nav-item-active::before {
    height: 4px;
  }
  &.rs-nav-subtle.rs-nav-horizontal .rs-nav-bar {
    border-top: 1px solid #e2e2e2;
  }

  .rs-nav-item.rs-nav-item-disabled > .rs-nav-item-content {
    color: var(--w700);
  }
  .rs-nav-item {
    color: var(--text-color);
    font-weight: bold;
  }
  &.rs-nav .rs-nav-item-active {
    color: var(--text-color);
    font-weight: bold;
  }
  &.rs-nav .rs-nav-item-active > .rs-nav-item-content {
    color: var(--primary-color);
    font-weight: bold;
  }

  .rs-nav-item:not(.rs-nav-item-disabled) > .rs-nav-item-content:hover,
  .rs-nav-item:not(.rs-nav-item-disabled) > .rs-nav-item-content:focus {
    color: var(--primary-color);
  }

  .rs-nav-item.rs-nav-item-active::before {
    background-color: var(--primary-color);
  }

  &.rs-nav-subtle.rs-nav-horizontal .rs-nav-waterline {
    border-top: 1px solid var(--w400);
    bottom: 1px;
  }
`;

const { Item: AppTab } = StyledNav;

const AppTabs: React.FC<NavProps> = ({ ...props }) => {
  return (
    <StyledNav appearance="subtle" {...props}>
      {props.children}
    </StyledNav>
  );
};

export default AppTabs;
export { AppTab };
