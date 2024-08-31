import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import AppPageHeader from '@components/AppPageHeader';
import { getProductList } from '@apis/product.api';
import { getCampaignDetail, getCampaignList, updateCampaign } from '@apis/campaign.api';
import { getCampaignSummaryList } from '@apis/campaign_summary.api';
import AppDateRangePicker, { today } from '@components/AppDateRangePicker';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { AppButton } from '@/components/AppButton';
import AppTabs, { AppTab } from '@components/AppTabs';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { getAdGroupDetail, getAdGroupList, updateAdGroup } from '@apis/ad_group.api';
import CampaignTab from '@pages/Campaigns/Campaign/List/CampaignTab';
import AdGroupTab from '@pages/Campaigns/Campaign/List/AdGroupTab';
import AppDiver from '@components/AppDivider';
import Search from '@components/Search';
import { sortByCaseInsensitive } from '@utils/functions';

interface CampaignListProps {}

const initDateRangeValue = [today.subtract(29, 'days').toDate(), today.toDate()];
const enablingStateList = [
  {
    label: '활성',
    value: 'ENABLED',
  },
  {
    label: '중지',
    value: 'DISABLED',
  },
];
/* 검색 */
// 캠페인 탭일때 보여줄 리스트
const campaignSearchTypeList = [
  {
    label: '캠페인명',
    value: 'title',
  },
  {
    label: '캠페인 ID',
    value: 'id',
  },
];
// 광고그룹 탭일때 보여줄 리스트
const adGroupSearchTypeList = [
  {
    label: '광고그룹명',
    value: 'title',
  },
  {
    label: '광고그룹 ID',
    value: 'id',
  },
];

const initMetricValue = {
  installs: 0,
  installs_ct: 0,
  conversions: 0,
  mmp_conversion_actions: 0,
  impressions: 0,
  clicks: 0,
  spend: 0,
  ctr: 0,
  cpc: 0,
  video_play_1q: 0,
  video_play_2q: 0,
  video_play_3q: 0,
  video_play_4q: 0,
  ipm: 0,
  cpi: 0,
  cpconv: 0,
};

const CampaignList: React.FC<CampaignListProps> = () => {
  /* 변수 */
  const adAccountList: any = useRouteLoaderData('layout');
  const navigate = useNavigate();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const location = useLocation();
  /* 공통적으로 쓰이는 State */
  const [selectedProduct, setSelectedProduct] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState(location.state?.tab || 'campaign');
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const [dateRangeValue, setDateRangeValue] = useState<any>(initDateRangeValue);
  const [enablingState, setEnablingState] = useState<('ENABLED' | 'DISABLED')[]>(['ENABLED', 'DISABLED']);

  const [filterParams, setFilterParams] = useState({
    dateRange: initDateRangeValue,
    enablingState: ['ENABLED', 'DISABLED'],
  });

  /*  토글 로딩용 ID */
  const [toggleLoadingId, setToggleLoadingId] = useState('');

  /* 캠페인용 State */

  // 캠페인 검색
  const [campaignSearchParams, setCampaignSearchParams] = useState({
    type: 'title',
    value: '',
  });
  const [campaignSearchType, setCampaignSearchType] = useState('title');
  const [campaignSearchValue, setCampaignSearchValue] = useState('');

  /* 광고그룹 State */
  const [adGroupSearchParams, setAdGroupSearchParams] = useState({
    type: 'title',
    value: '',
  });
  const [adGroupSearchType, setAdGroupSearchType] = useState('title');
  const [adGroupSearchValue, setAdGroupSearchValue] = useState('');

  /* React-Query 사용 */

  /* 캠페인 목록 가져오기*/
  const fetchProductList = useQuery(
    ['fetchProductList', selectedAdAccount],
    async () => {
      const { data } = await getProductList({ ad_account_id: selectedAdAccount });

      if (data.products && data.products.length !== 0) {
        const sortProductsList = sortByCaseInsensitive(data.products, 'title', 'asc');
        setSelectedProduct(sortProductsList[0]);
        return sortProductsList;
      } else {
        setSelectedProduct({});
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  /* 캠페인 데이터 가져오기 */
  const fetchCampaignList = useQuery(
    ['fetchCampaignList', selectedAdAccount, selectedProduct],
    async () => {
      const queryParams = {
        ad_account_id: selectedAdAccount,
        product_id: selectedProduct.id,
      };
      const { data } = await getCampaignList(queryParams);
      if (data.campaigns && data.campaigns.length !== 0) {
        return data.campaigns;
      } else {
        return [];
      }
    },
    {
      initialData: [],
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(selectedProduct),
    }
  );

  /* 광고그룹 데이터 가져오기 */
  const fetchAdGroupList = useQuery(
    ['fetchAdGroupList', selectedAdAccount, selectedProduct],
    async () => {
      const queryParams = Object.fromEntries(
        Object.entries({
          ad_account_id: selectedAdAccount,
          product_id: selectedProduct.id,
          campaign_id: selectedCampaign,
          inquiry_option: 'INQUIRY_OVERVIEW',
        }).filter(([_, v]) => v !== '')
      );
      const { data } = await getAdGroupList(queryParams);

      if (data.ad_group_overviews && data.ad_group_overviews.length !== 0) {
        return data.ad_group_overviews;
      } else {
        return [];
      }
    },
    {
      initialData: [],
      enabled: selectedTab === 'ad_group' && !_.isEmpty(selectedAdAccount) && !_.isEmpty(selectedProduct),
    }
  );

  /* 캠페인 요약 가져오기 */
  /*
   * 해당 데이터는 캠페인, 광고그룹 둘 다 쓰인다.
   * 그래서 캠페인, 광고그룹 데이터를 가져오는 useQuery에서 같이 가져오도록 한다.
   * 해당사항은 날짜 변경과, 상태(enabling_state)에 영향을 받는다.
   * */
  const fetchCampaignSummaryList = useQuery(
    ['fetchCampaignSummaryList', selectedAdAccount, selectedProduct, filterParams],
    async () => {
      const timezone = adAccountList.find((item: any) => item.id === selectedAdAccount).timezone;
      const queryParams = {
        ad_account_id: selectedAdAccount,
        'filter.product_id': selectedProduct.id,
        timezone,
        'date_range.start': dayjs(filterParams.dateRange[0]).format('YYYY-MM-DD'),
        'date_range.end': dayjs(filterParams.dateRange[1]).format('YYYY-MM-DD'),
        group_by: ['CAMPAIGN', 'AD_GROUP'],
      };
      const { data } = await getCampaignSummaryList(queryParams);
      if (data.rows && data.rows.length !== 0) {
        return data.rows;
      } else {
        return [];
      }
    },
    {
      initialData: [],
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(selectedProduct),
    }
  );

  /* 공통 함수들 */
  const handleSearchTypeChange = (value: string) => {
    if (selectedTab === 'campaign') {
      setCampaignSearchType(value);
    } else {
      setAdGroupSearchType(value);
    }
  };
  const handleSearchValueChange = (value: string) => {
    if (selectedTab === 'campaign') {
      setCampaignSearchValue(value);
    } else {
      setAdGroupSearchValue(value);
    }
  };

  // 필터 조회
  const handleApplyFilterClick = () => {
    setFilterParams({
      dateRange: dateRangeValue,
      enablingState,
    });
  };
  const handleApplySearchClick = () => {
    if (selectedTab === 'campaign') {
      setCampaignSearchParams({
        type: campaignSearchType,
        value: campaignSearchValue,
      });
    } else {
      setAdGroupSearchParams({
        type: adGroupSearchType,
        value: adGroupSearchValue,
      });
    }
  };

  /* 캠페인 리스트에서 사용되는 함수들 */

  // 캠페인 생성 버튼 클릭시
  const handleCampaignCreateClick = () => {
    // 네비이동
    const currentProductData = _.find(fetchProductList.data, { id: selectedProduct.id });
    navigate(`create`, {
      state: {
        currentProductData,
        type: 'campaign',
      },
    });
  };
  // 캠페인 테이블에서 토글 변경시
  const handleCampaignToggleChange = (rowData: any, checked: boolean, field: any) => {
    const { id: campaign_id, ad_account_id, product_id } = rowData;
    setToggleLoadingId(campaign_id);
    getCampaignDetail({
      campaign_id: campaign_id,
      queryParams: {
        ad_account_id,
        product_id,
      },
    }).then((res) => {
      const { data } = res;
      const { campaign } = data;
      updateCampaign({
        campaign_id: campaign_id,
        queryParams: { ad_account_id, product_id },
        bodyParams: {
          ...campaign,
          enabling_state: checked ? 'ENABLED' : 'DISABLED',
        },
      })
        .then(() => {
          field.onChange(checked);
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          setToggleLoadingId('');
        });
    });
  };
  // 캠페인 테이블에서 캠페인 명 클릭시
  const handleCampaignNameClick = (campaign_id: string) => {
    // 탭변경,
    setSelectedCampaign(campaign_id);
    setSelectedTab('ad_group');
  };
  // 캠페인 수정 버튼 클릭시
  const handleCampaignEditClick = (id: string) => {
    const currentProductData = _.find(fetchProductList.data, { id: selectedProduct.id });
    navigate(`edit/${id}`, {
      state: {
        currentProductData,
        type: 'campaign',
      },
    });
  };

  // 캠페인 광고그룹 추가 버튼 클릭시
  const handleCampaignAdGroupAddClick = (campaign_id: string) => {
    const currentProductData = _.find(fetchProductList.data, { id: selectedProduct.id });
    navigate(`create`, {
      state: {
        currentProductData,
        type: 'ad_group',
        campaign_id,
      },
    });
  };

  /* 광고그룹에서 사용되는 함수들 */
  // 광고그룹 테이블에서 토글 클릭시
  const handleAdGroupToggleChange = (rowData: any, checked: boolean, field: any) => {
    // 광고그룹 데이터 호출에 필요한 파라미터 가져오기
    const { ad_account_id, product_id, campaign_id, id: ad_group_id } = rowData.ad_group;
    setToggleLoadingId(ad_group_id);
    // 광고그룹 데이터 가져오기
    getAdGroupDetail({
      ad_group_id,
      queryParams: {
        ad_account_id,
        product_id,
        campaign_id,
      },
    }).then(({ data }) => {
      let adGroupData = data.ad_group;
      updateAdGroup({
        ad_group_id,
        queryParams: {
          ad_account_id,
          product_id,
          campaign_id,
        },
        bodyParams: {
          ...adGroupData,
          enabling_state: checked ? 'ENABLED' : 'DISABLED',
        },
      })
        .then(() => {
          field.onChange(checked);
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          setToggleLoadingId('');
        });
    });
  };
  // 광고그룹 테이블에서 수정 클릭시
  const handleAdGroupEditClick = (rowData: any) => {
    const {
      ad_group: { ad_account_id, id: ad_group_id },
      campaign_id,
      product_id,
    } = rowData;
    navigate(`edit/${campaign_id}`, {
      state: {
        currentProductData: _.find(fetchProductList.data, { id: selectedProduct.id }),
        ad_account_id,
        campaign_id,
        product_id,
        ad_group_id,
        type: 'ad_group',
      },
    });
  };

  /* useMemo */
  // 캠페인 데이터 가공
  const filteredCampaignList = useMemo(() => {
    // 로딩 처리
    if (fetchCampaignList.isFetching || fetchCampaignSummaryList.isFetching) {
      return {
        data: [],
        isLoading: true,
        error: false,
      };
    }
    // 에러 처리 (둘다? 아님 하나만?)
    if (fetchCampaignList.isError || fetchCampaignSummaryList.isError) {
      return {
        data: [],
        isLoading: false,
        error: true,
      };
    }

    // 성공적으로 데이터 가져왔을 경우.
    const campaignListData = fetchCampaignList.data;
    const campaignSummaryListData = fetchCampaignSummaryList.data;

    // 캠페인 데이터가 없다면 빈 배열 리턴 (종료
    if (campaignListData.length === 0) {
      return {
        data: [],
        isLoading: false,
        error: false,
      };
    }
    if (campaignSummaryListData.length === 0) {
      // 캠페인 데이터는 있는데 캠페인 요약 데이터가 없다면 캠페인 데이터를 그대로 리턴

      // 우선 테이블에 필요한 Metric 을 집어 넣는다.
      const campaignListDataWithMetric = campaignListData
        .map((item: any) => {
          return {
            ...item,
            metric: {
              ...initMetricValue,
            },
          };
        })
        .filter((item: any) => {
          // secondary 캠페인 제거
          return !_.has(item, 'audience_extension') || !_.get(item, 'audience_extension.is_secondary');
        });

      // 필터 적용
      return {
        data: _.filter(campaignListDataWithMetric, (item) => {
          return (
            filterParams.enablingState.includes(item.enabling_state) &&
            (campaignSearchParams.value
              ? item[campaignSearchParams.type]?.toUpperCase()?.includes(campaignSearchParams.value.toUpperCase())
              : true)
          );
        }),
        isLoading: false,
        error: false,
      };
    } else {
      // 캠페인 데이터가 있고 캠페인 요약 데이터도 있다면.

      // 캠페인 Audience Extension ID 매칭
      const getAudienceExtensionId = _.map(campaignListData, (item: any) => {
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
      const extractMetricData = _.chain(campaignSummaryListData)
        .map((item) => {
          return {
            ...item,
            campaign: {
              ...item.campaign,
              id: _.chain(getAudienceExtensionId).find(item.campaign.id).get(item.campaign.id).value(),
            },
          };
        })
        .groupBy((item) => item.campaign.id)
        .mapValues((value) => {
          return _.reduce(
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
        })
        .value();

      // 캠페인 요약에서 추출한 Metric데이터 캠페인 데이터에 집어 넣기
      const campaignListDataWithMetric = campaignListData
        .map((item: any) => {
          return {
            ...item,
            metric: {
              ...initMetricValue,
              ...extractMetricData[item.id],
            },
          };
        })
        .filter((item: any) => {
          // secondary 캠페인 제거
          return !_.has(item, 'audience_extension') || !_.get(item, 'audience_extension.is_secondary');
        });

      return {
        data: _.filter(campaignListDataWithMetric, (item) => {
          return (
            filterParams.enablingState.includes(item.enabling_state) &&
            (campaignSearchParams.value
              ? item[campaignSearchParams.type]?.toUpperCase().includes(campaignSearchParams.value.toUpperCase())
              : true)
          );
        }),
        isLoading: false,
        error: false,
      };
    }
  }, [fetchCampaignList, fetchCampaignSummaryList, filterParams, campaignSearchParams]);

  const filteredAdGroupList = useMemo(() => {
    // 로딩
    if (fetchAdGroupList.isFetching || fetchCampaignSummaryList.isFetching) {
      return {
        data: [],
        isLoading: true,
        error: false,
      };
    }
    // 에러
    if (fetchAdGroupList.error || fetchCampaignSummaryList.error) {
      return {
        data: [],
        isLoading: false,
        error: true,
      };
    }

    // 성공
    const adGroupListData = fetchAdGroupList.data;
    const campaignSummaryListData = fetchCampaignSummaryList.data;

    if (adGroupListData?.length === 0) {
      return {
        data: [],
        isLoading: false,
        error: false,
      };
    }

    if (campaignSummaryListData.length === 0) {
      const adGroupListDataWithMetric = adGroupListData
        ?.map((item: any) => {
          return {
            ...item,
            metric: {
              ...initMetricValue,
            },
          };
        })
        .filter((item: any) => {
          return (
            !_.has(item, 'ad_group.audience_extension') || !_.get(item, 'ad_group.audience_extension.is_secondary')
          );
        });

      return {
        data: _.filter(adGroupListDataWithMetric, (item) => {
          return (
            filterParams.enablingState.includes(item.ad_group.enabling_state) &&
            item.ad_group[adGroupSearchParams.type]?.toUpperCase()?.includes(adGroupSearchParams.value.toUpperCase())
          );
        }),
        isLoading: false,
        error: false,
      };
    } else {
      if (!_.isEmpty(selectedCampaign)) {
        const result = _.chain(adGroupListData)
          .map((item: any) => {
            const isExistAE = !!(
              item.ad_group.audience_extension && item.ad_group.audience_extension.paired_ad_group_id
            );

            const findMainCampaignSummary = _.find(campaignSummaryListData, (ele: any) => {
              return ele.ad_group.id === item.ad_group.id;
            });
            const findSecondaryCampaignSummary =
              isExistAE &&
              _.find(campaignSummaryListData, (ele: any) => {
                return ele.ad_group.id === item.ad_group.audience_extension.paired_ad_group_id;
              });

            if (!findMainCampaignSummary && !findSecondaryCampaignSummary) {
              return {
                ...item,
                metric: {
                  ...initMetricValue,
                },
              };
            } else {
              const mainMetric = findMainCampaignSummary
                ? _.mapValues(findMainCampaignSummary.metric, (o) => parseFloat(o))
                : { ...initMetricValue };
              const secondaryMetric = findSecondaryCampaignSummary
                ? _.mapValues(findSecondaryCampaignSummary.metric, (o) => parseFloat(o))
                : { ...initMetricValue };

              const mergedMetric = Object.entries(secondaryMetric).reduce(
                (acc, [key, value]) =>
                  // if key is already in map1, add the values, otherwise, create new pair
                  ({ ...acc, [key]: (acc[key] || 0) + value }),
                { ...mainMetric }
              );

              return {
                ...item,
                metric: {
                  ...initMetricValue,
                  ...mergedMetric,
                },
              };
            }
          })
          .value();

        return {
          data: _.filter(result, (item) => {
            return (
              filterParams.enablingState.includes(item.ad_group.enabling_state) &&
              item.ad_group[adGroupSearchParams.type]?.toUpperCase()?.includes(adGroupSearchParams.value.toUpperCase())
            );
          }),
          isLoading: false,
          error: false,
        };
      } else {
        const getAudienceExtensionId = _.map(adGroupListData, (item: any) => {
          if (!_.has(item, 'ad_group.audience_extension') || !_.get(item, 'ad_group.audience_extension.is_secondary')) {
            return {
              [item.ad_group.id]: item.ad_group.id,
            };
          } else {
            return {
              [item.ad_group.id]: item.ad_group.audience_extension.paired_ad_group_id,
            };
          }
        });
        const extractMetricData = _.chain(campaignSummaryListData)
          .map((item) => {
            return {
              ...item,
              ad_group: {
                ...item.ad_group,
                id: _.chain(getAudienceExtensionId).find(item.ad_group.id).get(item.ad_group.id).value(),
              },
            };
          })
          .groupBy((item) => item.ad_group.id)
          .mapValues((value) => {
            return _.reduce(
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
          })
          .value();

        const adGroupListDataWithMetric = adGroupListData
          ?.map((item: any) => {
            return {
              ...item,
              metric: {
                ...initMetricValue,
                ...extractMetricData[item.ad_group.id],
              },
            };
          })
          .filter((item: any) => {
            return (
              !_.has(item, 'ad_group.audience_extension') || !_.get(item, 'ad_group.audience_extension.is_secondary')
            );
          });

        return {
          data: _.filter(adGroupListDataWithMetric, (item) => {
            return (
              filterParams.enablingState.includes(item.ad_group.enabling_state) &&
              item.ad_group[adGroupSearchParams.type]?.toUpperCase()?.includes(adGroupSearchParams.value.toUpperCase())
            );
          }),
          isLoading: false,
          error: false,
        };
      }
    }
  }, [fetchAdGroupList, fetchCampaignSummaryList, filterParams, adGroupSearchParams]);

  return (
    <div>
      <AppPageHeader
        title={'캠페인'}
        extra={
          <AppSelectPicker
            searchable={false}
            cleanable={false}
            style={{ width: '200px' }}
            data={fetchProductList.data}
            value={selectedProduct.id}
            labelKey={'title'}
            valueKey={'id'}
            onChange={(value) => {
              setSelectedProduct(
                _.find(fetchProductList.data, (item) => {
                  return item.id === value;
                })
              );
            }}
          />
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', padding: '0 30px' }}>
        <AppDateRangePicker
          value={dateRangeValue}
          cleanable={false}
          onChange={(value) => {
            setDateRangeValue(value);
          }}
        />
        <AppCheckPicker
          data={enablingStateList}
          value={enablingState}
          onChange={(value: any) => setEnablingState(value)}
          searchable={false}
          cleanable={false}
          placeholder={'선택해 주세요.'}
          style={{ marginLeft: 10, width: 120 }}
          renderValue={(value, item: any) => {
            return (
              <span>
                <span style={{ marginRight: 5 }}>상태:</span>
                {value.length === 2
                  ? '전체'
                  : _.find(item, (obj) => {
                      return obj.value === value[0];
                    }).label}
              </span>
            );
          }}
        />
        <AppButton
          style={{ marginLeft: 10, width: 80, padding: 0 }}
          theme={'gray'}
          size={'md'}
          onClick={handleApplyFilterClick}
        >
          조회
        </AppButton>
      </div>
      <AppDiver style={{ margin: '14px 0' }} />
      <div style={{ position: 'relative' }}>
        {/* 탭 */}
        <AppTabs
          activeKey={selectedTab}
          onSelect={(value) => {
            if (selectedTab !== value) {
              setSelectedCampaign('');
              setSelectedTab(value);
              window.history.replaceState({}, document.title); //state.tab=ad_group 으로 들어온 흔적을 지우기 위함
            }
          }}
        >
          <AppTab eventKey={'campaign'}>캠페인</AppTab>
          <AppTab eventKey={'ad_group'}>광고그룹</AppTab>
        </AppTabs>
        {/*검색*/}

        <div style={{ position: 'absolute', right: 30, top: 0, display: 'flex', alignItems: 'center' }}>
          <Search
            data={selectedTab === 'campaign' ? campaignSearchTypeList : adGroupSearchTypeList}
            searchKey={selectedTab === 'campaign' ? campaignSearchType : adGroupSearchType}
            onSearchKeyChange={handleSearchTypeChange}
            searchValue={selectedTab === 'campaign' ? campaignSearchValue : adGroupSearchValue}
            onSearchValueChange={handleSearchValueChange}
            onSearch={handleApplySearchClick}
          />
        </div>
      </div>
      {selectedTab === 'campaign' && (
        <CampaignTab
          product={_.find(fetchProductList.data, { id: selectedProduct.id })}
          campaignData={filteredCampaignList}
          currentTab={selectedTab}
          onCampaignCreateClick={handleCampaignCreateClick}
          onCampaignToggleChange={handleCampaignToggleChange}
          onCampaignNameClick={handleCampaignNameClick}
          onCampaignEditClick={handleCampaignEditClick}
          onCampaignAdGroupAddClick={handleCampaignAdGroupAddClick}
          toggleLoadingId={toggleLoadingId}
        />
      )}
      {selectedTab === 'ad_group' && (
        <AdGroupTab
          adGroupData={filteredAdGroupList}
          onAdGroupToggleChange={handleAdGroupToggleChange}
          onAdGroupEditClick={handleAdGroupEditClick}
          toggleLoadingId={toggleLoadingId}
        />
      )}
    </div>
  );
};

export default CampaignList;
