import React from 'react';
import { Radio, RadioGroup, RadioGroupProps } from 'rsuite';
import styled from 'styled-components';

interface AppRadioGroupProps extends RadioGroupProps<any> {
  data?: any[];
  labelKey?: string;
  valueKey?: string;
}

const StyledRadioGroup = styled(RadioGroup)`
  &.rs-radio-group-inline {
    margin-left: -30px;
  }
  .rs-radio-inline {
    margin-left: 20px;
  }
  .rs-radio-checker {
    padding-top: 8px;
    padding-bottom: 8px;
    min-height: 32px;
  }
  .rs-radio-wrapper {
    top: 8px;
  }
`;
const AppRadioGroup: React.FC<AppRadioGroupProps> = ({ data, labelKey, valueKey, ...props }) => {
  if (data) {
    return (
      <StyledRadioGroup {...props}>
        {data.map((ele: any, idx: number) => {
          return (
            <Radio key={idx} value={valueKey ? ele[valueKey] : ele.value}>
              {labelKey ? ele[labelKey] : ele.label}
            </Radio>
          );
        })}
      </StyledRadioGroup>
    );
  }
  return <StyledRadioGroup {...props} />;
};
const AppRadio = Radio;

export default AppRadioGroup;
export { AppRadio };
