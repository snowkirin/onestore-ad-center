import React from 'react';
import { Input as RsuiteInput, InputGroup as RsuitInputGroup, InputProps as RsuiteInputProps } from 'rsuite';
import styled from 'styled-components';
import numberWithCommas from '@utils/common';
// import './style.less';

const StyledInput = styled(RsuiteInput)`
  border: 1px solid var(--border-line);
  border-radius: 4px;
  color: var(--text-color);
  font-size: 12px;
  padding: 9px 12px;
  height: 32px;

  &.rs-input-sm {
    height: 28px;
    font-size: 12px;
  }

  &::placeholder {
    color: var(--sub-gray-color-disabled);
    font-size: 12px;
  }

  &.rs-input[disabled] {
    background-color: var(--disabled-input-background);
    color: var(--sub-gray-color-disabled);
  }

  &.rs-input:focus:not(.error):not([disabled]),
  &.rs-input:hover:not(.error):not([disabled]) {
    border-color: var(--text-color);
  }

  &.error {
    border: 1px solid var(--primary-color);
  }
`;
const AppInputGroup = styled(RsuitInputGroup)`
  &.rs-input-group {
    border-radius: 4px;
  }
  &.rs-input-group:not(.rs-input-group-inside):not(.error) {
    border: 1px solid var(--w500);
  }
  &.rs-input-group:not(.rs-input-group-inside):not(.rs-input-group-disabled):hover,
  &.rs-input-group:not(.rs-input-group-inside):not(.rs-input-group-disabled).rs-input-group-focus {
    border-color: var(--border-line);
  }

  &.rs-input-group-disabled {
    background-color: var(--disabled-input-background);
    color: var(--sub-gray-color-disabled);
  }
  &.rs-input-group-disabled .rs-input-group-addon,
  .rs-input-group-addon {
    background-color: var(--w100);
    color: var(--b100);
  }

  &.rs-input-group:not(.rs-input-group-inside) > :last-child,
  &.rs-input-group.rs-input-group-inside .rs-input-group-btn:last-child {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
  }

  &.rs-input-group:not(.rs-input-group-inside) > :first-child {
    border-bottom-left-radius: 4px;
    border-top-left-radius: 4px;
  }

  &.error,
  &.error:not(.rs-input-group-inside):not(.rs-input-group-disabled):hover,
  &.error:not(.rs-input-group-inside):not(.rs-input-group-disabled).rs-input-group-focus {
    border: 1px solid var(--primary-color);
  }

  &.rs-input-group textarea ~ .rs-input-group-addon {
    border-left: none;
    left: auto;
    right: 0;
    top: auto;
    bottom: 0;
  }

  &.rs-input-group.rs-input-group-inside .rs-input-group-addon {
    padding: 12px 12px;
  }
  &.rs-input-group.rs-input-group-inside .rs-input {
    ${({ maxLength }) => {
      return maxLength ? `padding-right:${maxLength.toString().length * 2}em` : '';
    }};
  }

  &.rs-input-group-inside.rs-input-group-sm > .rs-input-group-btn {
    padding: 2px 12px;
    right: 0.5px;
    top: 0.5px;
    height: 25px;
  }

  &.rs-input-group-sm.rs-input-group:not(.rs-input-group-inside) > .rs-input-group-addon {
    height: 26px;
  }

  &.rs-input-group-sm.rs-input-group:not(.rs-input-group-inside) > .rs-input {
    height: 26px;
  }
`;
const CurrentLengthText = styled.span`
  color: var(--b700);
  font-size: 12px;
`;
const TotalLengthText = styled.span`
  color: var(--b000);
  font-size: 12px;
`;
interface InputProps extends RsuiteInputProps {
  numberOnly?: boolean;
  rows?: number;
  height?: number;
}

interface InputState {
  value: string;
  isNumber: boolean;
}

class AppInputTextArea extends React.Component<InputProps> {
  state = {
    value: '',
    isNumber: false,
  };

  static getDerivedStateFromProps(props: InputProps, state: InputState) {
    const value = props.value !== undefined ? props.value : state.value;

    return {
      ...state,
      value: value,
    };
  }

  handleChange = (value: any, event: any) => {
    let newValue = value;
    if (this.props.numberOnly && value) {
      const isNumber = /^[-]?[0-9]*$/;
      newValue = isNumber.test(value) ? newValue : this.state.value;
    }
    if (this.props.onChange) {
      this.props.onChange(newValue, event);
      event.stopPropagation();
      return;
    }
    this.setState({ value: newValue });
  };
  handleBlur = (event: any) => {
    if (this.props.numberOnly) {
      this.setState({
        value: numberWithCommas(this.state.value),
      });
    }

    if (this.props.onBlur) this.props.onBlur(event);
  };
  handleFocus = (event: any) => {
    if (this.props.numberOnly) {
      this.setState({
        value: this.state.value.replace(/,/g, ''),
      });
    }

    if (this.props.onFocus) this.props.onFocus(event);
  };

  render() {
    const { props } = this;
    const { state } = this;
    const { numberOnly, height, ...restProps } = props;
    const currentLength = state.value.toString().length;
    return (
      <AppInputGroup inside style={props.style} maxLength={props.maxLength}>
        <RsuiteInput
          {...restProps}
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          style={{ height: height ? height : 'auto', resize: 'none' }}
        />
        <AppInputGroup.Addon>
          <CurrentLengthText style={{ color: currentLength === 0 ? 'var(--b000)' : '' }}>
            {currentLength}
          </CurrentLengthText>
          <TotalLengthText>{`/${props.maxLength}`}</TotalLengthText>
        </AppInputGroup.Addon>
      </AppInputGroup>
    );
  }
}

export default AppInputTextArea;
