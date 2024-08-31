import React from 'react';
import styled from 'styled-components';
import { DatePicker, DatePickerProps } from 'rsuite';

interface AppDatePickerProps extends DatePickerProps {}

const StyledDatePicker = styled(DatePicker)`
  &.rs-picker-default .rs-picker-toggle.rs-btn {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  &.rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret {
    top: 5px;
  }
  &.rs-picker-date .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 6px;
  }
`;

const CalendarLocale = {
  sunday: '일',
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  ok: '적용',
  today: 'Today',
};

const AppDatePicker: React.FC<AppDatePickerProps> = ({ ...props }) => {
  return <StyledDatePicker className={'app-date-picker'} locale={CalendarLocale} ranges={[]} {...props} />;
};

export default AppDatePicker;
