import React from 'react';
import styled from 'styled-components';
import { AppInput, AppInputGroup } from '@components/AppInput/AppInput';
import { InputProps as RsuiteInputProps } from 'rsuite';
import { omit as _omit } from 'lodash';

interface InputCountProps extends RsuiteInputProps {
  maxLength: number;
  isCurrency?: boolean;
  isNumber?: boolean;
  style?: React.CSSProperties;
}

interface InputCountState {
  value: any;
  count: number;
}

const REGEXP_NUMBER = /^[0-9]*$/;

const CurrentLengthText = styled.span`
  color: var(--b700);
  font-size: 12px;
`;
const TotalLengthText = styled.span`
  color: var(--b000);
  font-size: 12px;
`;

class AppInputCount extends React.Component<InputCountProps, InputCountState> {
  state = {
    value: '',
    count: 0,
  };

  static getDerivedStateFromProps(props: InputCountProps, state: InputCountState) {
    let newValue = state.value;

    if (props.value !== undefined && typeof props.value !== 'number' && props.value.length <= props.maxLength) {
      newValue = props.value;
    }
    return {
      ...state,
      value: newValue,
    };
  }

  onChange = (value: any, event: any) => {
    if ((this.props.isCurrency || this.props.isNumber) && !REGEXP_NUMBER.test(value)) {
      return false;
    }
    if (value.length <= this.props.maxLength) {
      if (this.props.onChange) {
        this.props.onChange(value, event);
      } else this.setState({ value });
    }
  };

  render() {
    const { props } = this;
    const { state } = this;

    const currentLength = state.value.toString().length;
    return (
      <AppInputGroup inside style={props.style} maxLength={props.maxLength}>
        {props.isCurrency && <AppInputGroup.Addon>₩</AppInputGroup.Addon>}
        <AppInput {..._omit(props, ['style', 'isNumber', 'isCurrency'])} value={state.value} onChange={this.onChange} />
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

export default AppInputCount;
