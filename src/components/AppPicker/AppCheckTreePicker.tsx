import { CheckTreePicker as RsuiteCheckTreePicker, CheckTreeProps } from 'rsuite';
import styled from 'styled-components';
// import './style.less';
import React from 'react';

const StyledCheckTreePicker = styled(RsuiteCheckTreePicker)`
  .rs-picker-value-count {
    background: var(--primary-color);
  }
`;

const renderStatusValue = (value: any, items: any) => {
  return (
    <div>
      <span>{items[0].label}</span>
      <div className={'rs-picker-number-box'}>{`${value.length}`}</div>
    </div>
  );
};

const AppCheckTreePicker = (props: CheckTreeProps) => {
  return <StyledCheckTreePicker {...props} renderValue={renderStatusValue} cleanable />;
};

export default AppCheckTreePicker;
