import React from 'react';
import { SelectPicker, SelectPickerProps } from 'rsuite';
import styled from 'styled-components';

interface AppSelectPickerProps extends SelectPickerProps<any> {
  data: any;
}

const StyledSelectPicker = styled(SelectPicker)`
  .rs-picker-toggle.rs-btn.rs-btn-default.rs-btn-md {
    height: 32px;
    padding: 6px 15px 6px;
    border: solid 1px #9a9a9a;
  }

  &.rs-picker-default .rs-picker-toggle.rs-btn {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  &.rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret,
  &.rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }

  //.rs-checkbox.rs-checkbox-checker.rs-checkbox-wrapper {
  //  top: 8px;
  //}
  //.rs-picker-toggle.rs-btn .rs-picker-toggle-caret,
  //.rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
  //  top: 14px !important;
  //}
  //.rs-picker-toggle.rs-btn-sm {
  //  font-size: 12px;
  //}
  //.rs-picker-default .rs-picker-toggle.rs-picker-toggle-active.rs-btn {
  //  padding: 15px;
  //}
  //.rs-picker-toggle.rs-btn.rs-btn-default.rs-btn-md,
  //.rs-picker-toggle.rs-btn.rs-btn-default.rs-btn-sm {
  //  border-color: var(--border-line);
  //}
  //.rs-btn-md {
  //  .rs-picker-toggle {
  //    line-height: 19px;
  //  }
  //}
  //.rs-btn-sm {
  //  height: 28px;
  //  .rs-picker-toggle-placeholder {
  //    display: block;
  //    line-height: 14px;
  //  }
  //  .rs-picker-toggle-clean.rs-btn-close {
  //    display: block;
  //    height: 28px;
  //  }
  //}
  //.rs-btn-md {
  //  height: 34px;
  //}
  //.rs-picker-toggle {
  //  line-height: 18px;
  //}
  //.rs-picker-default.rs-picker-toggle.rs-btn {
  //  padding: 7px 12px 6px;
  //}
  //.rs-picker-toggle-value {
  //  display: block;
  //  line-height: 18px;
  //}
  //.rs-picker-toggle-clean.rs-btn-close {
  //  display: block;
  //  line-height: 14px;
  //}
`;

const AppSelectPicker: React.FC<AppSelectPickerProps> = ({ data, ...props }) => {
  return <StyledSelectPicker {...props} data={data || []} />;
};

export default AppSelectPicker;
