import React, { useCallback, useMemo, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import AppTable from '@/components/AppTable';
import { AppButton } from '@components/AppButton';
import styled from 'styled-components';
import IMG_X_RED from '@assets/images/addIcons/multiplication-red.svg';
import { Divider } from 'rsuite';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { getCampaignSummaryList } from '@apis/campaign_summary.api';
import AppDateRangePicker from '@components/AppDateRangePicker';
import dayjs from 'dayjs';
import { AppInput } from '@components/AppInput';
import IMG_X_RED_FILTER from '@assets/images/icons/x/x-red-filter.svg';
import IMG_PLUS_RED_FILTER from '@assets/images/icons/plus/plus-red-filter.svg';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import EllipsisPopup from '@components/EllipsisPopup';
import { CommaCell, CostCell, CtrCell, IpmCell, SpendCell } from '@components/Common/NumberCell';
import { getCampaignList } from '@apis/campaign.api';
import AlertModal from '@components/AppModal/AlretModal';
import { useRouteLoaderData } from 'react-router-dom';

interface AnalyticsCreativeProps {}

type SortType = 'asc' | 'desc' | undefined;

const StyledFilterWrapper = styled.div`
  background-color: #e3e3e3;
  border-radius: 4px;
  padding-right: 122px;
  position: relative;

  .filter-wrapper {
    display: inline-block;
    padding: 5px;
    border-right: 2px solid #fff;

    &::after {
      content: '';
      display: block;
      position: absolute;
      height: 100%;
      border-right: 2px solid #fff;
      right: 0;
    }

    .inner {
      background-color: #fff;
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid #9a9a9a;
    }

    .divider {
      &::after {
        display: inline-block;
        vertical-align: middle;
        content: '';
        border-right: 1px solid #e1e1e1;
        height: 16px;
        margin-left: 8px;
        margin-right: 8px;
        width: 1px;
      }
    }

    .button {
      margin-left: 10px;
    }
  }

  .button-wrapper {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
  }

  .filter-selector {
    display: inline-block;
    padding: 4px 5px;

    .item {
      display: inline-block;
      margin-right: 5px;
    }
  }
`;
const NoticeBox = styled.div`
  background: var(--disabled-color);
  display: flex;
  align-items: center;
  border-radius: 6px;
  position: relative;
  padding: 20px;
`;
const campaignSummaryParams = {
  limit: 10000,
};
const initMetricValue = {
  impression: '0',
  clicks: '0',
  installs: '0',
  actions: '0',
  conversion: '0',
  spend: 0,
  ctr: 0,
  ipm: 0,
  cpc: 0,
  cpi: 0,
  cpa: 0,
  cpconv: 0,
};
const dimensionList = [
  'Campaign',
  'Campaign Type',
  'Country',
  'LAT Target',
  'OS',
  'Creative Group',
  'Creative',
  'Creative Type',
];
const metricList = ['Impression', 'Click', 'Install', 'Action', 'Spend', 'CTR', 'IPM', 'CPC', 'CPI', 'CPA'];

const filterTypeList = _.chain(dimensionList)
  .concat(metricList)
  .map((item) => ({
    label: item,
    value: item.replace(/\s/, '_').toLowerCase(),
  }))
  .value();

const dimensionOperatorList = [
  {
    label: '포함',
    value: 'contain',
  },
  {
    label: '미포함',
    value: 'not_contain',
  },
];
const metricOperatorList = [
  {
    label: '<',
    value: '<',
  },
  {
    label: '<=',
    value: '<=',
  },
  {
    label: '=',
    value: '=',
  },
  {
    label: '>',
    value: '>',
  },
  {
    label: '>=',
    value: '>=',
  },
];

const filterTypeCheck = (value: string | null) => {
  const convertValue = _.chain(value).replace('_', ' ').value();
  if (
    dimensionList.some((ele) => {
      return ele.toLowerCase() === convertValue;
    })
  ) {
    return 'Dimension';
  }

  if (
    metricList.some((ele) => {
      return ele.toLowerCase() === convertValue;
    })
  ) {
    return 'Metric';
  }
};

const AnalyticsCreative: React.FC<AnalyticsCreativeProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const [currentDateRange, setCurrentDateRange] = useState<any>([
    dayjs().subtract(7, 'day').toDate(),
    dayjs().subtract(1, 'day').toDate(),
  ]);
  const [tmpFilterItem, setTmpFilterItem] = useState<any[]>([]);
  const [filterItem, setFilterItem] = useState<any[]>([]);

  const [isShowFilterSelector, setIsShowFilterSelector] = useState(true);

  const [filterTypeValue, setFilterTypeValue] = useState<string | null>('campaign');
  const [filterOperator, setFilterOperator] = useState<string | null>('contain');
  const [filterDimensionValue, setFilterDimensionValue] = useState<any[]>([]);
  const [filterMetricValue, setFilterMetricValue] = useState('');

  const [isOpenFilterWrapper, setIsOpenFilterWrapper] = useState(false);
  const [overallSortParams, setOverallSortParams] = useState<any>({
    sortColumn: 'metric.spend',
    sortType: 'desc',
  });
  const [dailySortParams, setDailySortParams] = useState<any>({
    sortColumn: 'metric.spend',
    sortType: 'desc',
  });
  const [isOpenAlertModal, setIsOpenAlertModal] = useState(false);
  const [alertModalText, setAlertModalText] = useState('');

  const fetchCampaignList = useQuery(
    ['fetchCampaignList', selectedAdAccount],
    async () => {
      const { data } = await getCampaignList({ ad_account_id: selectedAdAccount });

      if (data.campaigns && data.campaigns.length !== 0) {
        return data.campaigns;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  const fetchCreativeAnalysisOverall = useQuery(
    ['fetchCreativeAnalysisOverall', currentDateRange, selectedAdAccount],
    async () => {
      const timezone = adAccountList.find((item: any) => item.id === selectedAdAccount).timezone;
      const params = {
        ...campaignSummaryParams,
        'date_range.start': dayjs(currentDateRange[0]).format('YYYY-MM-DD'),
        'date_range.end': dayjs(currentDateRange[1]).format('YYYY-MM-DD'),
        group_by: [
          'AD_ACCOUNT',
          'APP_OR_SITE_ID',
          'APP_OS',
          'CAMPAIGN_COUNTRY',
          'CAMPAIGN_ID',
          'CAMPAIGN_IS_LAT',
          'CAMPAIGN_TYPE',
          'CREATIVE',
          'CREATIVE_GROUP',
        ],
        timezone,
        ad_account_id: selectedAdAccount,
        order_by: ['METRIC_SPEND_DESC'],
      };
      const { data } = await getCampaignSummaryList(params);

      if (data.rows && data.rows.length > 0) {
        const getAudienceExtensionId = _.map(fetchCampaignList.data, (item: any) => {
          if (!_.has(item, 'audience_extension') || !_.get(item, 'audience_extension.is_secondary')) {
            return {
              [item.id]: item.id,
            };
          } else {
            return {
              [item.id]: item.audience_extension.paired_campaign_id,
            };
          }
        });

        return _.chain(data.rows)
          .map((item) => {
            return {
              ...item,
              campaign: {
                ...item.campaign,
                id: _.chain(getAudienceExtensionId).find(item.campaign.id).get(item.campaign.id).value(),
              },
            };
          })
          .groupBy((item) => `${item.campaign.id}-${item.creative.id}-${item.campaign.is_lat ? 'lat_on' : 'lat_off'}`)
          .mapValues((value) => {
            const metricReduce = _.reduce(
              value,
              (result: { [key: string]: any }, item) => {
                Object.keys(item.metric).forEach((ele) => {
                  result[ele]
                    ? (result[ele] += parseFloat(item.metric[ele]))
                    : (result[ele] = parseFloat(item.metric[ele]));
                });
                return result;
              },
              {}
            );

            const valueReduce = _.reduce(
              value,
              (acc, item) => {
                acc = {
                  ...item,
                };
                return acc;
              },
              {}
            );
            return {
              ...valueReduce,
              metric: {
                ...initMetricValue,
                ...metricReduce,
              },
            };
          })
          .values()
          .map((ele: any) => {
            return {
              ...ele,
              campaign: {
                ...ele.campaign,
                title: ele.campaign.title.replace('(offsite)', ''),
              },
            };
          })
          .value();
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(fetchCampaignList.data),
      onError: (err: any) => {
        setAlertModalText(
          dayjs(parseInt(err.response.headers['grpc-metadata-x-rate-limit-reset']) * 1000).format('YYYY-MM-DD HH:mm')
        );
        setIsOpenAlertModal(true);
      },
    }
  );

  const fetchCreativeAnalysisDaily = useQuery(
    ['fetchCreativeAnalysisDaily', currentDateRange],
    async () => {
      const timezone = adAccountList.find((item: any) => item.id === selectedAdAccount).timezone;
      const params = {
        ...campaignSummaryParams,
        group_by: [
          'AD_ACCOUNT',
          'APP_OR_SITE_ID',
          'APP_OS',
          'CAMPAIGN_COUNTRY',
          'CAMPAIGN_ID',
          'CAMPAIGN_IS_LAT',
          'CAMPAIGN_TYPE',
          'CREATIVE',
          'CREATIVE_GROUP',
          'DATE',
        ],
        'date_range.start': dayjs(currentDateRange[0]).format('YYYY-MM-DD'),
        'date_range.end': dayjs(currentDateRange[1]).format('YYYY-MM-DD'),
        timezone,
        ad_account_id: selectedAdAccount,

        order_by: ['METRIC_SPEND_DESC', 'TIME_DATE_DESC'],
      };
      const { data } = await getCampaignSummaryList(params);
      if (data.rows && data.rows.length > 0) {
        const getAudienceExtensionId = _.map(fetchCampaignList.data, (item: any) => {
          if (!_.has(item, 'audience_extension') || !_.get(item, 'audience_extension.is_secondary')) {
            return {
              [item.id]: item.id,
            };
          } else {
            return {
              [item.id]: item.audience_extension.paired_campaign_id,
            };
          }
        });

        return _.chain(data.rows)
          .map((item) => {
            return {
              ...item,
              campaign: {
                ...item.campaign,
                id: _.chain(getAudienceExtensionId).find(item.campaign.id).get(item.campaign.id).value(),
              },
            };
          })
          .groupBy(
            (item) =>
              `${item.campaign.id}-${item.creative.id}-${item.campaign.is_lat ? 'lat_on' : 'lat_off'}-${item.date}`
          )
          .mapValues((value) => {
            const metricReduce = _.reduce(
              value,
              (result: { [key: string]: any }, item) => {
                Object.keys(item.metric).forEach((ele) => {
                  result[ele]
                    ? (result[ele] += parseFloat(item.metric[ele]))
                    : (result[ele] = parseFloat(item.metric[ele]));
                });
                return result;
              },
              {}
            );

            const valueReduce = _.reduce(
              value,
              (acc, item) => {
                acc = {
                  ...item,
                };
                return acc;
              },
              {}
            );
            return {
              ...valueReduce,
              metric: {
                ...initMetricValue,
                ...metricReduce,
              },
            };
          })
          .values()
          .map((ele: any) => {
            return {
              ...ele,
              campaign: {
                ...ele.campaign,
                title: ele.campaign.title.replace('(offsite)', ''),
              },
            };
          })
          .value();
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(fetchCampaignList.data),
      onError: (err: any) => {
        setAlertModalText(
          dayjs(parseInt(err.response.headers['grpc-metadata-x-rate-limit-reset']) * 1000).format('YYYY-MM-DD HH:mm')
        );
        setIsOpenAlertModal(true);
      },
    }
  );

  const tableFilter = (item: any, element: any) => {
    let currentItem;
    switch (element.filter) {
      case 'campaign':
        currentItem = item.campaign.title;
        break;
      case 'campaign_type':
        currentItem = item.campaign.type;
        break;
      case 'country':
        currentItem = item.campaign.country;
        break;
      case 'lat_target':
        currentItem = item.campaign.is_lat ? 'true' : 'false';
        break;
      case 'os':
        currentItem = item.app.os;
        break;
      case 'creative_group':
        currentItem = item.creative_group.title;
        break;
      case 'creative':
        currentItem = item.creative.title;
        break;
      case 'creative_type':
        currentItem = item.creative.type;
        break;
      case 'impression':
        currentItem = item.metric.impressions;
        break;
      case 'click':
        currentItem = item.metric.clicks;
        break;
      case 'install':
        currentItem = item.metric.installs;
        break;
      case 'action':
        currentItem = item.metric.actions;
        break;
      case 'spend':
        currentItem = item.metric.spend;
        break;
      case 'ctr':
        currentItem = item.metric.ctr;
        break;
      case 'ipm':
        currentItem = item.metric.ipm;
        break;
    }
    switch (element.operator) {
      case 'contain':
        return element.value.includes(currentItem);
      case 'not_contain':
        return !element.value.includes(currentItem);
      case '<':
        return parseFloat(currentItem) < parseFloat(element.value);
      case '<=':
        return parseFloat(currentItem) <= parseFloat(element.value);
      case '>':
        return parseFloat(currentItem) > parseFloat(element.value);
      case '>=':
        return parseFloat(currentItem) >= parseFloat(element.value);
      case '=':
        return parseFloat(currentItem) == parseFloat(element.value);
    }
  };

  const initFilterItem = () => {
    setFilterTypeValue('campaign');
    setFilterOperator('contain');
    setFilterDimensionValue([]);
    setFilterMetricValue('');
  };

  // 필터 버튼 눌렀을때
  const handleShowFilterClick = () => {
    if (!isOpenFilterWrapper) {
      setIsShowFilterSelector(true);
      setIsOpenFilterWrapper(true);
    }
  };
  // 필터 취소 버튼 눌렀을때
  const handleFilterCancelClick = () => {
    if (window.confirm('설정된 필터가 모두 해제됩니다. 계속하시겠습니까?')) {
      setFilterItem([]);
      setTmpFilterItem([]);
      initFilterItem();
      setIsOpenFilterWrapper(false);
    }
  };
  // 필터 적용 버튼 눌렀을때
  const handleFilterApplyClick = () => {
    setFilterItem(tmpFilterItem);
    initFilterItem();
  };

  const handleFilterTypeChange = (value: string | null) => {
    if (value !== filterTypeValue) {
      setFilterTypeValue(value);
      setFilterOperator(filterTypeCheck(value) === 'Dimension' ? 'contain' : '<');
      setFilterDimensionValue([]);
      setFilterMetricValue('');
    }
  };

  const handleFilterOperatorChange = (value: string | null) => {
    if (value !== filterOperator) {
      setFilterOperator(value);
    }
  };
  // 확인 클릭
  const handleFilterItemApplyClick = () => {
    setTmpFilterItem((prevState) => [
      ...prevState,
      {
        filter: filterTypeValue,
        operator: filterOperator,
        value: filterTypeCheck(filterTypeValue) === 'Dimension' ? filterDimensionValue : filterMetricValue,
      },
    ]);
    setIsShowFilterSelector(false);
    initFilterItem();
  };
  // 필터 취소 눌렀을 때
  const handleHideFilterItemClick = () => {
    initFilterItem();
    setIsShowFilterSelector(false);
  };
  // tmpFilterItem 부분 삭제
  const handleFilterItemRemoveClick = (index: number) => {
    setTmpFilterItem((prevState) => prevState.filter((_, idx) => idx !== index));
  };

  // 정렬
  const handleOverallSortColumn = (sortColumn: string, sortType: SortType | undefined) => {
    setOverallSortParams({
      sortColumn,
      sortType,
    });
  };
  const handleDailySortColumn = (sortColumn: string, sortType: SortType | undefined) => {
    setDailySortParams({
      sortColumn,
      sortType,
    });
  };

  const uniqFilterList = useMemo(() => {
    if (fetchCreativeAnalysisOverall.data?.length !== 0) {
      return {
        campaign: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({ value: item.campaign.title, label: item.campaign.title }))
          .uniqBy((item) => item.value)
          .value(),
        campaign_type: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({ value: item.campaign.type, label: item.campaign.type }))
          .uniqBy((item) => item.value)
          .value(),
        country: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({
            value: item.campaign.country,
            label: item.campaign.country,
          }))
          .uniqBy((item) => item.value)
          .value(),
        lat_target: [
          {
            label: 'LAT On',
            value: 'true',
          },
          { label: 'LAT Off', value: 'false' },
        ],
        // lat_target: _.chain(rows).map((item) => item.campaign.is_lat).uniqBy().value(),
        os: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({
            value: item.app.os,
            label: item.app.os,
          }))
          .uniqBy((item) => item.value)
          .value(),
        creative_group: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({
            value: item.creative_group.title,
            label: item.creative_group.title,
          }))
          .uniqBy((item) => item.value)
          .value(),
        creative: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({ value: item.creative.title, label: item.creative.title }))
          .uniqBy((item) => item.value)
          .value(),
        creative_type: _.chain(fetchCreativeAnalysisOverall.data)
          .map((item) => ({
            value: item.creative.type,
            label: item.creative.type,
          }))
          .uniqBy((item) => item.value)
          .value(),
      };
    } else {
      return {
        campaign: [],
        campaign_type: [],
        country: [],
        lat_target: [],
        os: [],
        creative_group: [],
        creative: [],
        creative_type: [],
      };
    }
  }, [fetchCreativeAnalysisOverall.data]);
  const filterType = useMemo(() => filterTypeCheck(filterTypeValue), [filterTypeValue]);

  // 종합 테이블 데이터 가공
  const filteredCreativeAnalysisOverall = useMemo(() => {
    return _.chain(fetchCreativeAnalysisOverall.data)
      .filter((item) => {
        return filterItem.every((element) => {
          return tableFilter(item, element);
        });
      })
      .orderBy([overallSortParams.sortColumn], [overallSortParams.sortType])
      .value();
  }, [filterItem, fetchCreativeAnalysisOverall.data, overallSortParams]);

  // 일별 테이블 테이터 가공
  const filteredCreativeAnalysisDaily = useMemo(() => {
    return _.chain(fetchCreativeAnalysisDaily.data)
      .filter((item) => {
        return filterItem.every((element) => {
          return tableFilter(item, element);
        });
      })
      .orderBy([dailySortParams.sortColumn], [dailySortParams.sortType])
      .value();
  }, [filterItem, fetchCreativeAnalysisDaily.data, dailySortParams]);

  useCallback(() => {
    if (isOpenFilterWrapper) {
      setTmpFilterItem(filterItem);
    }
  }, [isOpenFilterWrapper]);

  return (
    <div>
      <AppPageHeader title={'분석 > 소재 분석'} />
      <div style={{ paddingLeft: 30, paddingRight: 30 }}>
        <NoticeBox>
          <ul style={{ padding: 0, margin: '0 0 0 20px' }}>
            <li>기간은 최대 31일까지 선택 가능합니다.</li>
            <li>광고비(Spend)가 많은 순으로 내림차순 정렬되며, 결과값은 1만행까지 조회할 수 있습니다.</li>
          </ul>
        </NoticeBox>
      </div>

      <div
        style={{
          padding: '14px 30px',
          margin: '14px 0',
          borderTop: '1px solid #e2e2e2',
          borderBottom: '1px solid #e2e2e2',
        }}
      >
        <div style={{ display: 'flex' }}>
          <AppButton size={'md'} theme={'white_gray'} onClick={handleShowFilterClick} style={{ padding: '0 30px' }}>
            필터
          </AppButton>
          <AppDateRangePicker
            style={{ marginLeft: 10 }}
            value={currentDateRange}
            cleanable={false}
            onChange={(value) => setCurrentDateRange(value)}
          />
        </div>

        {isOpenFilterWrapper && (
          <div>
            <StyledFilterWrapper style={{ marginTop: 10 }}>
              {/* 필터 */}
              {tmpFilterItem.map((item, idx) => (
                <div key={idx} className={'filter-wrapper'}>
                  <div className={'inner'}>
                    <span>
                      {
                        _.filter(filterTypeList, (filter) => {
                          return filter.value === item.filter;
                        })[0].label
                      }
                    </span>
                    <Divider vertical style={{ margin: '0 8px' }} />
                    <span>
                      {item.operator === 'contain' && '포함'}
                      {item.operator === 'not_contain' && '미포함'}
                      {item.operator !== 'contain' && item.operator !== 'not_contain' && item.operator}
                    </span>
                    <Divider vertical style={{ margin: '0 8px' }} />
                    <span>
                      {_.isArray(item.value)
                        ? item.value.length > 1
                          ? `${item.value[0]} 외 ${item.value.length - 1}`
                          : item.value[0]
                        : item.value}
                    </span>
                    <img
                      className={'button'}
                      src={IMG_X_RED}
                      alt="Remove ICON"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterItemRemoveClick(idx)}
                    />
                  </div>
                </div>
              ))}
              {!isShowFilterSelector && (
                <div style={{ display: 'inline-block', marginLeft: 8, padding: '5px 0' }}>
                  <img
                    src={IMG_PLUS_RED_FILTER}
                    alt={'ADD FILTER'}
                    onClick={() => setIsShowFilterSelector(true)}
                    style={{ cursor: 'pointer', width: '30px' }}
                  />
                </div>
              )}

              {isShowFilterSelector && (
                <div className={'filter-selector'}>
                  {/* FilterType */}
                  <div className={'item'}>
                    <AppSelectPicker
                      data={filterTypeList}
                      value={filterTypeValue}
                      searchable={false}
                      cleanable={false}
                      onChange={(value) => handleFilterTypeChange(value)}
                      style={{ width: '140px' }}
                    />
                  </div>
                  {/* Filter Operator */}
                  <div className={'item'}>
                    <AppSelectPicker
                      value={filterOperator}
                      data={filterType === 'Dimension' ? dimensionOperatorList : metricOperatorList}
                      searchable={false}
                      cleanable={false}
                      onChange={(value: any) => handleFilterOperatorChange(value)}
                      style={{ width: '100px' }}
                    />
                  </div>
                  {/* Filter Value */}
                  <div className={'item'}>
                    {filterType === 'Dimension' && (
                      <AppCheckPicker
                        searchable={false}
                        cleanable={true}
                        placeholder={'선택'}
                        style={{ width: '200px' }}
                        data={_.get(uniqFilterList, `${filterTypeValue}`) || []}
                        value={filterDimensionValue}
                        onChange={(value: any) => setFilterDimensionValue(value)}
                      />
                    )}
                    {filterType === 'Metric' && (
                      <AppInput
                        numberOnly={true}
                        value={filterMetricValue}
                        placeholder={'숫자 입력'}
                        onChange={(value) => setFilterMetricValue(value)}
                      />
                    )}
                  </div>
                  <div className={'item'}>
                    <AppButton
                      size={'md'}
                      style={{ width: 60, padding: 0 }}
                      onClick={handleFilterItemApplyClick}
                      disabled={filterDimensionValue.length === 0 && _.isEmpty(filterMetricValue)}
                    >
                      확인
                    </AppButton>
                    <img
                      src={IMG_X_RED_FILTER}
                      alt="Remove ICON"
                      style={{ marginLeft: 5, cursor: 'pointer', width: '30px' }}
                      onClick={handleHideFilterItemClick}
                    />
                  </div>
                </div>
              )}

              <div className={'button-wrapper'} style={{ marginRight: '7px' }}>
                <AppButton size={'md'} style={{ width: 50, padding: 0 }} onClick={handleFilterCancelClick}>
                  취소
                </AppButton>
                <AppButton
                  disabled={tmpFilterItem.length === 0 || isShowFilterSelector}
                  size={'md'}
                  theme={'red'}
                  style={{ width: 50, padding: 0, marginLeft: 3 }}
                  onClick={handleFilterApplyClick}
                >
                  적용
                </AppButton>
              </div>
            </StyledFilterWrapper>
          </div>
        )}
      </div>

      <div>
        <div style={{ paddingLeft: 30, paddingRight: 30 }}>
          <AppTypography.SubTitle level={2}>조회 결과 (종합)</AppTypography.SubTitle>
        </div>
        <div style={{ marginTop: 14 }}>
          <AppTable
            height={300}
            data={filteredCreativeAnalysisOverall}
            loading={fetchCreativeAnalysisOverall.isFetching}
            sortColumn={overallSortParams.sortColumn}
            sortType={overallSortParams.sortType}
            onSortColumn={handleOverallSortColumn}
          >
            <AppTable.Column>
              <AppTable.HeaderCell style={{ paddingLeft: 30 }}>OS</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'app.os'} style={{ paddingLeft: 30 }} />
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Campaign</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.title'}>
                {(rowData) => <EllipsisPopup text={rowData['campaign']['title']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Campaign ID</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.id'}>
                {(rowData) => <EllipsisPopup text={rowData['campaign']['id']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>Country</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.country'} />
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>Campaign Type</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.type'} />
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>LAT Target</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.is_lat'}>
                {(rowData) => (rowData.campaign.is_lat ? 'LAT On' : 'LAT Off')}
              </AppTable.Cell>
            </AppTable.Column>

            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>CreativeGroup</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative_group.title'}>
                {(rowData) => <EllipsisPopup text={rowData['creative_group']['title']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>CreativeGroup ID</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative_group.id'}>
                {(rowData) => <EllipsisPopup text={rowData['creative_group']['id']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Creative</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative.title'}>
                {(rowData) => <EllipsisPopup text={rowData['creative']['title']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Creative ID</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative.id'}>
                {(rowData) => <EllipsisPopup text={rowData['creative']['id']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>Creative Type</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative.type'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Impression</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.impressions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Click</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.clicks'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Install</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.installs'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Action</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.actions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Conversion</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.conversion'} />
            </AppTable.Column>

            <AppTable.Column sortable={true} align={'right'}>
              <AppTable.HeaderCell>Spend</AppTable.HeaderCell>
              <SpendCell dataKey={'metric.spend'} currencyKey={'ad_account.currency'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CTR</AppTable.HeaderCell>
              <CtrCell firstKey={'metric.clicks'} secondKey={'metric.impressions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>IPM</AppTable.HeaderCell>
              <IpmCell firstKey={'metric.installs'} secondKey={'metric.impressions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPC</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.clicks'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPI</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.installs'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPA</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.actions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPConv</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.conversion'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell style={{ paddingRight: 30 }}>Currency</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'ad_account.currency'} style={{ paddingRight: 30 }} />
            </AppTable.Column>
          </AppTable>
        </div>
      </div>
      <div style={{ paddingTop: 40, borderTop: '1px solid #e2e2e2' }}>
        <div style={{ paddingLeft: 30, paddingRight: 30 }}>
          <AppTypography.SubTitle level={2}>조회 결과 (일별)</AppTypography.SubTitle>
        </div>
        <div style={{ marginTop: 14 }}>
          <AppTable
            height={300}
            data={filteredCreativeAnalysisDaily}
            loading={fetchCreativeAnalysisDaily.isFetching}
            sortColumn={dailySortParams.sortColumn}
            sortType={dailySortParams.sortType}
            onSortColumn={handleDailySortColumn}
          >
            <AppTable.Column width={110}>
              <AppTable.HeaderCell style={{ paddingLeft: 30 }}>Date</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'date'} style={{ paddingLeft: 30 }} />
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>OS</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'app.os'} />
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Campaign</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.title'}>
                {(rowData) => <EllipsisPopup text={rowData['campaign']['title']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Campaign ID</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.id'}>
                {(rowData) => <EllipsisPopup text={rowData['campaign']['id']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>Country</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.country'} />
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>Campaign Type</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.type'} />
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>LAT Target</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'campaign.is_lat'}>
                {(rowData) => (rowData.campaign.is_lat ? 'LAT On' : 'LAT Off')}
              </AppTable.Cell>
            </AppTable.Column>

            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>CreativeGroup</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative_group.title'}>
                {(rowData) => <EllipsisPopup text={rowData['creative_group']['title']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>CreativeGroup ID</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative_group.id'}>
                {(rowData) => <EllipsisPopup text={rowData['creative_group']['id']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Creative</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative.title'}>
                {(rowData) => <EllipsisPopup text={rowData['creative']['title']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column resizable={true}>
              <AppTable.HeaderCell>Creative ID</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative.id'}>
                {(rowData) => <EllipsisPopup text={rowData['creative']['id']} />}
              </AppTable.Cell>
            </AppTable.Column>
            <AppTable.Column>
              <AppTable.HeaderCell>Creative Type</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'creative.type'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Impression</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.impressions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Click</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.clicks'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Install</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.installs'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Action</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.actions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>Conversion</AppTable.HeaderCell>
              <CommaCell dataKey={'metric.conversion'} />
            </AppTable.Column>

            <AppTable.Column sortable={true} align={'right'}>
              <AppTable.HeaderCell>Spend</AppTable.HeaderCell>
              <SpendCell dataKey={'metric.spend'} currencyKey={'ad_account.currency'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CTR</AppTable.HeaderCell>
              <CtrCell firstKey={'metric.clicks'} secondKey={'metric.impressions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>IPM</AppTable.HeaderCell>
              <IpmCell firstKey={'metric.installs'} secondKey={'metric.impressions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPC</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.clicks'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPI</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.installs'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPA</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.actions'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell>CPConv</AppTable.HeaderCell>
              <CostCell currencyKey={'ad_account.currency'} firstKey={'metric.spend'} secondKey={'metric.conversion'} />
            </AppTable.Column>
            <AppTable.Column align={'right'}>
              <AppTable.HeaderCell style={{ paddingRight: 30 }}>Currency</AppTable.HeaderCell>
              <AppTable.Cell dataKey={'ad_account.currency'} style={{ paddingRight: 30 }} />
            </AppTable.Column>
          </AppTable>
        </div>
      </div>

      <AlertModal
        open={isOpenAlertModal}
        onOk={() => setIsOpenAlertModal(false)}
        content={
          <AppTypography.Text>
            원스토어 광고센터에서 허용하는 <br />
            API 호출 한도를 초과하였습니다.
            <br />
            {alertModalText} 이후 다시 시도해 주시기 바랍니다.
          </AppTypography.Text>
        }
        title={'API 호출 한도 초과'}
      />
    </div>
  );
};

export default AnalyticsCreative;
