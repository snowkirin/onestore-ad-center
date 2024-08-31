import React from 'react';
import { DateRangePicker, DateRangePickerProps } from 'rsuite';
import styled from 'styled-components';
import dayjs from 'dayjs';

interface AppDateRangePickerProps extends DateRangePickerProps {}

const StyledDateRangePicker = styled(DateRangePicker)`
  &.rs-picker-default .rs-picker-toggle.rs-btn {
    padding-top: 5px;
    padding-bottom: 5px;
  }
  &.rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret,
  &.rs-picker-daterange .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }
`;

const AppDateRangePicker: React.FC<AppDateRangePickerProps> = ({ ...props }) => {
  return (
    <StyledDateRangePicker
      className={'dateRangeTextBox'}
      ranges={Ranges}
      locale={{
        sunday: '일',
        monday: '월',
        tuesday: '화',
        wednesday: '수',
        thursday: '목',
        friday: '금',
        saturday: '토',
        ok: '적용',
        today: 'Today',
      }}
      {...props}
    />
  );
};

export default AppDateRangePicker;

export const today = dayjs().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
const Ranges = [
  {
    label: '어제',
    value: [today.subtract(1, 'days').toDate(), today.subtract(1, 'days').toDate()],
  },
  {
    label: '오늘',
    value: [today.toDate(), today.toDate()],
  },
  {
    label: '최근 7일',
    value: [today.subtract(6, 'days').toDate(), today.toDate()],
  },
  {
    label: '최근 30일',
    value: [today.subtract(29, 'days').toDate(), today.toDate()],
  },
  {
    label: '이번주',
    value: [
      today.startOf('week').toDate(),
      today.endOf('week').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).toDate(),
    ],
  },
  {
    label: '지난주',
    value: [
      today.subtract(1, 'weeks').startOf('week').toDate(),
      today
        .subtract(1, 'weeks')
        .endOf('week')
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toDate(),
    ],
  },
  {
    label: '이번달',
    value: [
      today.startOf('month').toDate(),
      today.endOf('month').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).toDate(),
    ],
  },
  {
    label: '지난달',
    value: [
      today.subtract(1, 'months').startOf('month').toDate(),
      today
        .subtract(1, 'months')
        .endOf('month')
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toDate(),
    ],
  },
];
