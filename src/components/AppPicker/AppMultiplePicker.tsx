import { CheckPicker as RsuiteCheckPicker, CheckPickerProps } from 'rsuite';
import styled from 'styled-components';
// import './style.less';
import React from 'react';

const StyledMultiPicker = styled(RsuiteCheckPicker)`
  &.rs-picker-default .rs-picker-toggle.rs-btn-md {
    height: 32px;
    padding: 6px 32px 6px 15px;
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
  //border-radius: 4px;
  //color: var(--text-color);
  //font-size: 12px;
  //min-height: 28px;
  //.rs-picker-toggle.rs-btn.rs-btn-default.rs-btn-md {
  //  height: 32px;
  //  padding: 6px 15px 6px;
  //}
  //.rs-checkbox.rs-checkbox-checker.rs-checkbox-wrapper {
  //  top: 8px;
  //}
  .rs-picker-number-box {
    display: inline-block;
    width: 30px;
    height: 18px;
    background-color: var(--primary-color);
    border-radius: 9px;
    color: white;
    text-align: center;
    align-items: center;
    justify-items: center;
    margin-left: 4px;
  }
`;

const renderStatusValue = (value: any, items: any) => {
  return (
    <div>
      <span>{items[0]?.label}</span>
      <div className={'rs-picker-number-box'}>{`${value?.length}`}</div>
    </div>
  );
};

const AppMultiPicker = (props: CheckPickerProps<any>) => {
  return <StyledMultiPicker {...props} renderValue={renderStatusValue} cleanable />;
};

export default AppMultiPicker;
