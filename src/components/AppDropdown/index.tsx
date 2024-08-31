import React from 'react';
import { Dropdown, DropdownProps } from 'rsuite';
// import './style.less';
import { DropdownMenuItemProps } from 'rsuite/esm/Dropdown/DropdownItem';

interface AppDropdownProps extends React.FC<DropdownProps> {
  Item: React.FC<DropdownMenuItemProps>;
}

const AppDropdown: AppDropdownProps = ({ ...props }) => {
  return <Dropdown {...props} />;
};
AppDropdown.Item = ({ ...props }) => {
  return <Dropdown.Item {...props} />;
};

export default AppDropdown;
