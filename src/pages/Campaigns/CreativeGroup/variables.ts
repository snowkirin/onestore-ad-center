import { ScheduleValueType } from '@interface/common.interface';
import styled from 'styled-components';
import { mapValues as _mapValues } from 'lodash';
import { getContinuousNumber } from '@utils/functions';
import { WeekConverter } from '@utils/variables';

export const dateRadioGroup = [
  {
    label: '설정 안함',
    value: 'not',
  },
  {
    label: '설정함',
    value: 'set',
  },
];

export const creativeTypes = [
  { label: '이미지', value: 'IMAGE' },
  { label: '네이티브', value: 'NATIVE' },
  { label: '동영상', value: 'VIDEO' },
];

export const formDefaultValues: {
  name: string;
  scheduleStartDate: Date;
  scheduleEndDate: Date;
  schedule: ScheduleValueType;
  creatives: any[];
} = {
  name: '',
  scheduleStartDate: new Date(),
  scheduleEndDate: new Date(),
  schedule: {
    mo: [...Array(24).keys()],
    tu: [...Array(24).keys()],
    we: [...Array(24).keys()],
    th: [...Array(24).keys()],
    fr: [...Array(24).keys()],
    sa: [...Array(24).keys()],
    su: [...Array(24).keys()],
  },
  creatives: [],
};

export const StyledDateWrapper = styled.div`
  display: flex;
  flex-direction: column;

  .input-wrapper {
    display: flex;
    align-items: center;
    margin-top: 10px;
    gap: 10px;
  }

  .text-wrapper {
    margin-top: 10px;
  }
`;

export const scheduleConverter = (scheduleValue: ScheduleValueType) => {
  const result: { [key: string]: { start: number; end: number }[] } = _mapValues(scheduleValue, (value) =>
    getContinuousNumber(value)
  );
  let convertResult: any[] = [];
  for (const key in result) {
    result[key].forEach((value: { start: number; end: number }) => {
      convertResult.push({
        timezone_policy: 'AD_ACCOUNT_TIME',
        hour_range: {
          start: value.start,
          end: value.end,
        },
        days: [WeekConverter[key]],
      });
    });
  }
  return convertResult;
};
