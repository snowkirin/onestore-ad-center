/* Lists */
export const campaignTypeList = [
  {
    label: 'User Acquisition',
    value: 'User_Acquisition',
  },
  {
    label: 'Re-engagement',
    value: 'Re_engagement',
  },
];
// User Acquisition 에 따른 캠페인 목적
export const campaignPurposeListByUA = [
  {
    label: 'Install',
    value: 'Install',
  },
  {
    label: 'In App Event',
    value: 'In_App_Event',
  },
  {
    label: 'ROAS',
    value: 'ROAS',
  },
];
// Re-engagement 에 따른 캠페인 목적
export const campaignPurposeListByRE = [
  {
    label: 'Click',
    value: 'Click',
  },
  {
    label: 'App Open',
    value: 'App_Open',
  },
  {
    label: 'In App Event',
    value: 'In_App_Event',
  },
  {
    label: 'ROAS',
    value: 'ROAS',
  },
];

// 입찰 우선순위 ( Bid Control Priority )
export const bidControlPriorityList = [
  {
    label: '일 예산',
    value: 'Budget',
  },
  {
    label: '타겟 CPI',
    value: 'Target_CPI',
  },
  {
    label: '타겟 CPC',
    value: 'Target_CPC',
  },
];

// 예산타입 / 예산
export const budgetTypeList = [
  {
    label: '일 예산',
    value: 'Daily',
  },
  {
    label: '주 예산',
    value: 'Weekly',
  },
];

export const dailyBudgetTypeList = [
  {
    label: '고정',
    value: 'Fixed',
  },
  {
    label: '맞춤',
    value: 'Custom',
  },
];

// Daily Custom List
export const dailyCustomBudgetList: { title: string; currency: string; key: DailyCustomBudgetKeys }[] = [
  {
    title: '월',
    currency: 'KRW',
    key: 'monday_budget',
  },
  {
    title: '화',
    currency: 'KRW',
    key: 'tuesday_budget',
  },
  {
    title: '수',
    currency: 'KRW',
    key: 'wednesday_budget',
  },
  {
    title: '목',
    currency: 'KRW',
    key: 'thursday_budget',
  },
  {
    title: '금',
    currency: 'KRW',
    key: 'friday_budget',
  },
  {
    title: '토',
    currency: 'KRW',
    key: 'saturday_budget',
  },
  {
    title: '일',
    currency: 'KRW',
    key: 'sunday_budget',
  },
];

export const LAT_TargetingList = [
  {
    label: 'Only LAT On Devices',
    value: 'LAT_ONLY',
  },
  {
    label: 'Only LAT Off Devices',
    value: 'NON_LAT_ONLY',
  },
];

export const exposureFrequencyList = [
  {
    label: '1시간',
    value: '1_HOUR',
  },
  {
    label: '12시간',
    value: '12_HOUR',
  },
  {
    label: '1일',
    value: '1_DAY',
  },
  {
    label: '맞춤',
    value: 'CUSTOM',
  },
];

export const exposureFrequencyUnitList = [
  {
    label: '분',
    value: 'MINUTE',
  },
  {
    label: '시간',
    value: 'HOUR',
  },
  {
    label: '일',
    value: 'DAY',
  },
];

export const CAMPAIGN_TYPE = {
  APP_USER_ACQUISITION: 'User Acquisition',
  APP_REENGAGEMENT: 'Re-engagement',
};

export const CAMPAIGN_STATUS = {
  SUBMITTED: 'Submitted',
  READY: 'Ready',
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
};

export const ADGROUP_STATUS = {
  UNSPECIFIED: 'Unspecified',
  ENABLED: 'Enabled',
  DISABLED: 'Disabled',
};

export const CAMPAIGN_PURPOSE = {
  OPTIMIZE_CPI_FOR_APP_UA: 'Install',
  OPTIMIZE_CPA_FOR_APP_UA: 'In App Event',
  OPTIMIZE_ROAS_FOR_APP_UA: 'ROAS',
  OPTIMIZE_CPC_FOR_APP_RE: 'Click',
  OPTIMIZE_REATTRIBUTION_FOR_APP: 'App Open',
  OPTIMIZE_CPA_FOR_APP_RE: 'In App Event',
  OPTIMIZE_ROAS_FOR_APP_RE: 'ROAS',
};

export type DailyCustomBudgetKeys =
  | 'monday_budget'
  | 'tuesday_budget'
  | 'wednesday_budget'
  | 'thursday_budget'
  | 'friday_budget'
  | 'saturday_budget'
  | 'sunday_budget';
