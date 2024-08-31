import { CheckPicker as RsuiteCheckPicker } from 'rsuite';
import styled from 'styled-components';

const AppCheckPicker = styled(RsuiteCheckPicker)`
  .rs-picker-toggle {
    font-size: 12px;
  }
  &.rs-picker-default .rs-picker-toggle.rs-btn {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  &.rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret {
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
`;

export default AppCheckPicker;
