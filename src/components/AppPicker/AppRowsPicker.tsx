import React from 'react';
import { SelectPicker, SelectPickerProps } from 'rsuite';
import styled from 'styled-components';

interface AppSelectPickerProps extends SelectPickerProps<any> {
  data: any;
}

const StyledRowsPicker = styled(SelectPicker)`
  .rs-picker-toggle.rs-btn.rs-btn-default {
    height: 22px;
    padding: 1px 15px 1px;
    border: solid 1px #e1e1e1;
    font-size: 12px;
  }
  .rs-picker-toggle-value {
    top: 0 !important;
  }
  .rs-picker-toggle-caret.rs-icon {
    top: -1px !important;
  }
`;

const AppRowsPicker: React.FC<AppSelectPickerProps> = ({ data, ...props }) => {
  return <StyledRowsPicker {...props} data={data || []} />;
};

export default AppRowsPicker;
