import React from 'react';
import { Checkbox, CheckboxGroup, CheckboxGroupProps } from 'rsuite';
import styled from 'styled-components';

interface AppCheckboxGroupProps extends CheckboxGroupProps<any> {
  data?: any[];

  labelKey?: string;
  valueKey?: string;
}

const StyledCheckboxGroup = styled(CheckboxGroup)`
  &.rs-checkbox-group-inline {
    margin-left: -30px;
  }
  .rs-checkbox-inline {
    margin-left: 20px;
  }
`;

const AppCheckboxGroup: React.FC<AppCheckboxGroupProps> = ({ data, labelKey, valueKey, ...props }) => {
  if (data) {
    return (
      <StyledCheckboxGroup {...props}>
        {data.map((ele: any, idx: number) => {
          return (
            <Checkbox key={idx} value={valueKey ? ele[valueKey] : ele.value} disabled={ele.disabled}>
              {labelKey ? ele[labelKey] : ele.label}
            </Checkbox>
          );
        })}
      </StyledCheckboxGroup>
    );
  }
  return <StyledCheckboxGroup {...props} />;
};

const AppCheckbox = Checkbox;

export default AppCheckboxGroup;
export { AppCheckbox };
