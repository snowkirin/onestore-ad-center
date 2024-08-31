import { InputNumber as RsuiteInputNumber } from 'rsuite';
import styled from 'styled-components';
// import './style.less';

const AppInputNumber = styled(RsuiteInputNumber)`
  &.error {
    border: 1px solid var(--primary-color);
    &.rs-input-group:not(.rs-input-group-inside):not(.rs-input-group-disabled):hover,
    &.rs-input-group:not(.rs-input-group-inside):not(.rs-input-group-disabled).rs-input-group-focus {
      border: 1px solid var(--primary-color);
    }
  }

  &.rs-input-group-disabled .rs-input {
    background-color: var(--w100);
    color: var(--b100);
  }

  &.rs-input-number > .rs-input {
    border-bottom-left-radius: 4px !important;
    border-top-left-radius: 4px !important;
  }
  &.rs-input-group:not(.rs-input-group-inside) > :last-child {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
  }

  .rs-input {
    border: 1px solid var(--w500);
    color: var(--b700);
    font-size: 12px;
    padding: 9px 12px;
    height: 30px;
  }

  border-radius: 4px;

  .rs-input-number-touchspin-up,
  .rs-input-number-touchspin-down {
    height: 15px;
  }
  .rs-input-number-btn-group-vertical:last-child .rs-input-number-touchspin-up {
    border-top-right-radius: 4px;
  }
  .rs-input-number-btn-group-vertical:last-child .rs-input-number-touchspin-down {
    border-bottom-right-radius: 4px;
  }
  &.rs-input-group:not(.rs-input-group-inside):not(.rs-input-group-disabled):hover,
  &.rs-input-group:not(.rs-input-group-inside):not(.rs-input-group-disabled).rs-input-group-focus {
    border-color: var(--primary-color);
  }
`;

export default AppInputNumber;
