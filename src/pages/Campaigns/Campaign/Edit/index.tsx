import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox, Loader, Steps } from 'rsuite';
import AppTypography from '@components/AppTypography';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { deleteCampaign, getCampaignDetail, updateCampaign } from '@apis/campaign.api';
import _, { filter as _filter, isEmpty as _isEmpty, mapValues as _mapValues } from 'lodash';
import { AppInputCount } from '@components/AppInput';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import {
  bidControlPriorityList,
  budgetTypeList,
  dailyBudgetTypeList,
  dailyCustomBudgetList,
  exposureFrequencyList,
  exposureFrequencyUnitList,
  LAT_TargetingList,
} from '@pages/Campaigns/Campaign/variables';
import AppRadioGroup from '@components/AppRadio';
import dayjs from 'dayjs';
import AppDatePicker from '@components/AppDatePicker';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import { getCreativeGroupList } from '@apis/creative_group.api';
import AppCheckbox from '@components/AppCheckbox';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import { getAppEventSummary } from '@apis/product.api';
import { AppButton } from '@components/AppButton';
import AppPageFooter from '@components/AppPageFooter';
import { getAudienceTargetList } from '@apis/audience_target.api';
import { deleteAdGroup, getAdGroupDetail, updateAdGroup } from '@apis/ad_group.api';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import InfoMessage from '@components/AppTypography/InfoMessage';
import InfoTooltip from '@components/InfoTooltip';
import AppModal from '@components/AppModal/Modal';
import { sortByCaseInsensitive } from '@utils/functions';
import styled from 'styled-components';
import TimezoneJSON from '@utils/json/timezone.json';

interface CampaignEditProps {}

const StyledCampaignCreate = styled.div`
  margin: 30px auto;

  .row {
    .col {
      &-input {
        .inner {
          .inner__wrapper {
            &:not(:first-child) {
              margin-top: 25px;
            }
          }
        }
      }
    }
  }
  .content__box {
    width: 716px;
    margin: 0 auto;
  }
`;

const CampaignEdit: React.FC<CampaignEditProps> = () => {
  /* 변수 */
  const { id: campaignID } = useParams();
  const adAccountList: any = useRouteLoaderData('layout');
  const { state }: { state: any } = useLocation();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const navigate = useNavigate();

  /* useState */
  const campaignForm = useForm({
    defaultValues: campaignDefaultValues,
  });
  // Campaign
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignType, setCampaignType] = useState('');
  const [campaignPurpose, setCampaignPurpose] = useState('');
  const [goalAction, setGoalAction] = useState('');
  const [goalActionROAS, setGoalActionROAS] = useState<string[]>([]);

  /* Ad Group */
  const adgroupForm = useForm({
    defaultValues: {
      title: '',
      selectedExposureFrequency: '',
      exposureFrequencyValue: {
        amount: '',
        unit: 'MINUTE',
      },
      selectedCreativeGroup: [],
      selectedAudienceTarget: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const watchIsEndDateLimit = campaignForm.watch('isEndDateLimit');

  /* 함수 */

  /* useQuery */

  // API : 캠페인 상세보기
  const fetchCampaignDetail = useQuery(
    ['fetchCampaignDetail', campaignID],
    async () => {
      const { data } = await getCampaignDetail({ campaign_id: campaignID! }!);
      setLoading(false);
      if (data.campaign) {
        const { campaign } = data;
        /* 기본값 세팅 */

        if (campaign.type === 'APP_USER_ACQUISITION') {
          // UA
          setCampaignType('User_Acquisition');
          // LAT Targeting
          campaignForm.setValue(
            'adTrackingAllowance',
            campaign.ad_tracking_allowance === 'DO_NOT_CARE'
              ? ['LAT_ONLY', 'NON_LAT_ONLY']
              : ([campaign.ad_tracking_allowance] as string[])
          );
          switch (campaign.goal.type) {
            case 'OPTIMIZE_CPI_FOR_APP_UA':
              setCampaignPurpose('Install');
              if (campaign.goal.optimize_app_installs.mode === 'BUDGET_CENTRIC') {
                // BUDGET_CENTRIC
                campaignForm.setValue('bidControlPriority', 'Budget');
              } else {
                // TARGET_CPI_CENTRIC
                campaignForm.setValue('bidControlPriority', 'Target_CPI');
                campaignForm.setValue(
                  'targetCPI',
                  (campaign.goal.optimize_app_installs.target_cpi.amount_micros / microAmount).toString()
                );
              }
              break;
            case 'OPTIMIZE_CPA_FOR_APP_UA':
              // in App Event
              setCampaignPurpose('In_App_Event');
              setGoalAction(campaign.goal.optimize_cpa_for_app_ua.action);
              break;
            case 'OPTIMIZE_ROAS_FOR_APP_UA':
              // ROAS
              setCampaignPurpose('ROAS');
              setGoalActionROAS(campaign.goal.optimize_app_roas.revenue_actions);
              break;
          }
        } else {
          // RE
          setCampaignType('Re_engagement');
          switch (campaign.goal.type) {
            case 'OPTIMIZE_CPC_FOR_APP_RE':
              setCampaignPurpose('Click');
              if (campaign.goal.optimize_cpc_for_app_re.mode === 'BUDGET_CENTRIC') {
                campaignForm.setValue('bidControlPriority', 'Budget');
              } else {
                campaignForm.setValue('bidControlPriority', 'Target_CPC');
                campaignForm.setValue(
                  'targetCPC',
                  (campaign.goal.optimize_cpc_for_app_re.target_cpc.amount_micros / microAmount).toString()
                );
              }
              break;
            case 'OPTIMIZE_REATTRIBUTION_FOR_APP':
              // App Open
              setCampaignPurpose('App_Open');
              break;
            case 'OPTIMIZE_CPA_FOR_APP_RE':
              // in App Event
              setCampaignPurpose('In_App_Event');
              setGoalAction(campaign.goal.optimize_cpa_for_app_re.action);
              break;
            case 'OPTIMIZE_ROAS_FOR_APP_RE':
              // ROAS
              setCampaignPurpose('ROAS');
              setGoalActionROAS(campaign.goal.optimize_roas_for_app_re.revenue_actions);
              break;
          }
        }

        /* 기본값 세팅 - 공통 */
        // 캠페인명
        campaignForm.setValue('title', campaign.title);

        // 예산타입/예산
        if (campaign.budget_schedule.daily_schedule) {
          campaignForm.setValue('budgetType', 'Daily');
          campaignForm.setValue('dailyBudgetType', 'Fixed');
          campaignForm.setValue(
            'dailyFixedBudget',
            (campaign.budget_schedule.daily_schedule.daily_budget.amount_micros / microAmount).toString()
          );
        }
        if (campaign.budget_schedule.weekly_flexible_schedule) {
          campaignForm.setValue('budgetType', 'Weekly');
          campaignForm.setValue(
            'weeklyBudget',
            (campaign.budget_schedule.weekly_flexible_schedule.weekly_budget.amount_micros / microAmount).toString()
          );
        }
        if (campaign.budget_schedule.weekly_schedule) {
          campaignForm.setValue('budgetType', 'Daily');
          campaignForm.setValue('dailyBudgetType', 'Custom');
          const {
            monday_budget,
            tuesday_budget,
            wednesday_budget,
            thursday_budget,
            friday_budget,
            saturday_budget,
            sunday_budget,
          } = campaign.budget_schedule.weekly_schedule;

          campaignForm.setValue('dailyCustomBudget', {
            monday_budget: (monday_budget.amount_micros / microAmount).toString(),
            tuesday_budget: (tuesday_budget.amount_micros / microAmount).toString(),
            wednesday_budget: (wednesday_budget.amount_micros / microAmount).toString(),
            thursday_budget: (thursday_budget.amount_micros / microAmount).toString(),
            friday_budget: (friday_budget.amount_micros / microAmount).toString(),
            saturday_budget: (saturday_budget.amount_micros / microAmount).toString(),
            sunday_budget: (sunday_budget.amount_micros / microAmount).toString(),
          });
        }
        // 스케줄
        campaignForm.setValue('scheduleStartDate', dayjs(campaign.schedule.start).toDate());
        campaignForm.setValue(
          'scheduleEndDate',
          campaign.schedule.end ? dayjs(campaign.schedule.end).toDate() : dayjs(campaign.schedule.start).toDate()
        );
        campaignForm.setValue('isEndDateLimit', !campaign.schedule.end);

        // 트래킹 링크
        // campaignForm.setValue('trackingLinkID', campaign.tracking_link_id);
        //
        // if (campaign.goal.kpi_actions) {
        //   // KPI
        //   campaignForm.setValue('trackingLinkID', campaign.goal.kpi_actions);
        // }

        // 캠페인 리턴
        return campaign;
      } else {
        return {};
      }
    },
    {
      enabled: !_isEmpty(campaignID) && state.type !== 'ad_group',
    }
  );

  // API : 광고 그룹 상세보기
  const fetchAdGroupDetail = useQuery(
    ['fetchAdGroupDetail', campaignID],
    async () => {
      const { data } = await getAdGroupDetail({
        ad_group_id: state.ad_group_id,
        queryParams: {
          ad_account_id: state.ad_account_id,
          product_id: state.product_id,
          campaign_id: state.campaign_id,
        },
      });
      setLoading(false);
      const { ad_group } = data;
      const imp_interval = ad_group.capper.imp_interval;

      adgroupForm.setValue('title', ad_group.title);

      if (imp_interval.amount === '1' && imp_interval.unit === 'HOUR') {
        // 노출빈도 1시간
        adgroupForm.setValue('selectedExposureFrequency', '1_HOUR');
        adgroupForm.setValue('exposureFrequencyValue', {
          amount: '1',
          unit: 'HOUR',
        });
      } else if (imp_interval.amount === '12' && imp_interval.unit === 'HOUR') {
        // 노출빈도 12시간
        adgroupForm.setValue('selectedExposureFrequency', '12_HOUR');
        adgroupForm.setValue('exposureFrequencyValue', {
          amount: '12',
          unit: 'HOUR',
        });
      } else if (imp_interval.amount === '1' && imp_interval.unit === 'DAY') {
        // 노출빈도 1일
        adgroupForm.setValue('selectedExposureFrequency', '1_DAY');
        adgroupForm.setValue('exposureFrequencyValue', {
          amount: '1',
          unit: 'DAY',
        });
      } else {
        adgroupForm.setValue('selectedExposureFrequency', 'CUSTOM');
        adgroupForm.setValue('exposureFrequencyValue', {
          amount: imp_interval.amount,
          unit: imp_interval.unit,
        });
      }
      adgroupForm.setValue('selectedCreativeGroup', ad_group.creative_group_ids || []);
      adgroupForm.setValue('selectedAudienceTarget', ad_group.audience.shared_audience_target_ids || []);
      return ad_group;
    },
    {
      enabled: !_isEmpty(campaignID) && state.type === 'ad_group',
    }
  );

  // API : 트랙킹 리스트 가져오기
  const fetchTrackingLinkList = useQuery(
    ['fetchTrackingLinkList'],
    async () => {
      const { data } = await getTrackingLinkList({
        ad_account_id: selectedAdAccount,
        product_id: state.currentProductData.id,
      });
      if (data.tracking_links && data.tracking_links.length !== 0) {
        return sortByCaseInsensitive(data.tracking_links, 'title', 'asc');
      } else {
        return [];
      }
    },
    {
      enabled: !_isEmpty(selectedAdAccount) && !_isEmpty(state.currentProductData.id),
    }
  );

  // API : 맞춤타겟 리스트 가져오기
  const fetchAudienceTargetList = useQuery(
    ['fetchAudienceTargetList', selectedAdAccount],
    async () => {
      const { data } = await getAudienceTargetList({
        ad_account_id: selectedAdAccount,
      });
      if (data.audience_targets && data.audience_targets.length !== 0) {
        return sortByCaseInsensitive(data.audience_targets, 'title', 'asc');
      } else {
        return [];
      }
    },
    {
      enabled: !_isEmpty(selectedAdAccount),
    }
  );

  // API : 소재그룹 리스트 가져오기
  const fetchCreativeGroupList = useQuery(
    ['fetchCreativeGroupList', selectedAdAccount, state.currentProductData.id],
    async () => {
      const { data } = await getCreativeGroupList({
        ad_account_id: selectedAdAccount,
        product_id: state.currentProductData.id,
      });
      if (data.creative_groups && data.creative_groups.length !== 0) {
        return sortByCaseInsensitive(data.creative_groups, 'title', 'asc');
      } else {
        return [];
      }
    },
    {
      enabled: !_isEmpty(selectedAdAccount) && !_isEmpty(state.currentProductData.id),
    }
  );

  // API : 앱이벤트 가져오기
  const fetchAppEventSummaryList = useQuery(
    ['fetchAppEventSummaryList'],
    async () => {
      const { data } = await getAppEventSummary(state.currentProductData.id, {
        'condition.time_window': 'TIME_WINDOW_D30',
      });

      if (data.postback_integration_event_summary && data.postback_integration_event_summary.summary.length !== 0) {
        const filterROAS = _filter(data.postback_integration_event_summary.summary, (item) => {
          if (item.is_revenue === true) {
            return item;
          }
        });
        return {
          app_event: sortByCaseInsensitive(data.postback_integration_event_summary.summary, 'event_name', 'asc'),
          roas: sortByCaseInsensitive(filterROAS, 'event_name', 'asc'),
        };
      } else {
        return {
          app_event: [],
          roas: [],
        };
      }
    },
    {
      enabled: !_isEmpty(state.currentProductData.id),
    }
  );

  const onClickUpdateCampaign = (data: any) => {
    setLoading(true);
    const adTrackingAllowanceGenerator = () => {
      if (campaignType === 'User_Acquisition') {
        return {
          ad_tracking_allowance:
            campaignForm.getValues('adTrackingAllowance').length === 2
              ? 'DO_NOT_CARE'
              : campaignForm.getValues('adTrackingAllowance').join(),
        };
      } else {
        return {};
      }
    };
    const budgetScheduleGenerator = () => {
      if (campaignForm.getValues('budgetType') === 'Daily') {
        if (campaignForm.getValues('dailyBudgetType') === 'Fixed') {
          return {
            budget_schedule: {
              daily_schedule: {
                daily_budget: {
                  currency: 'KRW',
                  amount_micros: parseFloat(campaignForm.getValues('dailyFixedBudget')) * microAmount,
                },
              },
            },
          };
        } else {
          // Custom

          return {
            budget_schedule: {
              weekly_schedule: {
                ..._mapValues(data.dailyCustomBudget, (value) => {
                  return {
                    amount_micros: parseFloat(value) * microAmount || 0,
                    currency: 'KRW',
                  };
                }),
              },
            },
          };
        }
      } else {
        // Weekly
        return {
          budget_schedule: {
            weekly_flexible_schedule: {
              weekly_budget: {
                currency: 'KRW',
                amount_micros: parseFloat(campaignForm.getValues('weeklyBudget')) * microAmount || 0,
              },
            },
          },
        };
      }
    };
    const bodyParams = {
      ad_account_id: fetchCampaignDetail.data.ad_account_id,
      id: fetchCampaignDetail.data.id,
      product_id: fetchCampaignDetail.data.product_id,
      title: campaignForm.getValues('title'),
      description: '',
      enabling_state: 'DISABLED',
      type: campaignType === 'User_Acquisition' ? 'APP_USER_ACQUISITION' : 'APP_REENGAGEMENT',
      device_os: 'ANDROID',
      countries: ['KOR'],
      currency: 'KRW',
      ...adTrackingAllowanceGenerator(),
      landing_url: '',
      tracking_link_id: campaignForm.getValues('trackingLinkID'),
      schedule: {
        start: campaignForm.getValues('scheduleStartDate'),
        ...(!watchIsEndDateLimit ? { end: campaignForm.getValues('scheduleEndDate') } : {}),
      },
      ...goalGenerator(
        campaignType,
        campaignPurpose,
        campaignPurpose === 'Install' || campaignPurpose === 'Click'
          ? campaignForm.getValues('bidControlPriority')
          : '',
        {
          kpi_actions: campaignForm.getValues('KPIActions'),
          target_cpi: campaignForm.getValues('targetCPI'),
          action: goalAction,
          revenue_actions: goalActionROAS,
          target_cpc: campaignForm.getValues('targetCPC'),
        }
      ),
      ...budgetScheduleGenerator(),
    };

    updateCampaign({
      campaign_id: campaignID!,
      bodyParams: bodyParams,
    })
      .then(() => {
        navigate(`/campaigns/campaign`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 광고 그룹 수정
  const handleEditAdGroupClick = () => {
    const payload = {
      ...fetchAdGroupDetail.data,
      title: adgroupForm.getValues('title'),
      audience: {
        shared_audience_target_ids: adgroupForm.getValues('selectedAudienceTarget'),
      },
      capper: {
        imp_interval: adgroupForm.getValues('exposureFrequencyValue'),
      },
      creative_group_ids: adgroupForm.getValues('selectedCreativeGroup'),
    };
    setLoading(true);
    updateAdGroup({
      ad_group_id: state.ad_group_id,
      queryParams: {
        ad_account_id: state.ad_account_id,
        product_id: state.product_id,
        campaign_id: state.campaign_id,
      },
      bodyParams: payload,
    })
      .then(() => {
        navigate(`/campaigns/campaign`, { state: { tab: 'ad_group' } });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const currentTimezone = useMemo(() => {
    const adAccountTimezone = adAccountList.find((item: any) => item.id === selectedAdAccount).timezone;
    return TimezoneJSON.find((item) => item.value === adAccountTimezone);
  }, [selectedAdAccount]);

  useEffect(() => {
    if (fetchCampaignDetail.isSuccess && fetchTrackingLinkList.isSuccess) {
      campaignForm.setValue('trackingLinkID', fetchCampaignDetail.data.tracking_link_id);
    }
  }, [fetchCampaignDetail, fetchTrackingLinkList]);

  useEffect(() => {
    if (fetchCampaignDetail.isSuccess && fetchTrackingLinkList.isSuccess) {
      if (fetchCampaignDetail.data.goal.kpi_actions) {
        campaignForm.setValue('KPIActions', fetchCampaignDetail.data.goal.kpi_actions);
      }
    }
  }, [fetchCampaignDetail, fetchAppEventSummaryList]);

  useEffect(() => {
    if (state.type === 'campaign') {
      setCurrentStep(0);
    } else {
      setCurrentStep(1);
    }
    // cleanup
    return () => {
      setCurrentStep(0);
    };
  }, [state]);

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      if (currentStep === 0) await deleteCampaign(fetchCampaignDetail.data?.id);
      if (currentStep === 1) await deleteAdGroup(fetchAdGroupDetail.data?.campaign_id, fetchAdGroupDetail.data?.id);

      navigate('/campaigns/campaign');
    } catch (err: any) {
      alert(err?.response.data.message);
    } finally {
      setLoading(false);
    }
  }, [fetchCampaignDetail, fetchAdGroupDetail]);

  return (
    <StyledCampaignCreate>
      {loading && <Loader center backdrop style={{ zIndex: 99 }} />}
      {/* Steps */}
      <div style={{ marginBottom: 30 }}>
        <Steps current={currentStep} style={{ width: 300, margin: '0 auto' }} classPrefix={'app-step'}>
          <Steps.Item title={'캠페인'} />
          <Steps.Item title={'광고그룹'} />
        </Steps>
      </div>
      {/* Campaign */}
      <div className={'inputs__wrapper'}>
        {currentStep === 0 && (
          <div className={'campaign'}>
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    앱 이름
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{state.currentProductData.title}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    캠페인 타입
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {campaignType === 'User_Acquisition' && 'User Acquisition'}
                    {campaignType === 'Re_engagement' && 'Re-engagement'}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    캠페인 목적
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{campaignPurpose.replace('_', ' ')}</AppTypography.Text>
                </div>
              </div>
              {(campaignPurpose === 'In_App_Event' || campaignPurpose === 'ROAS') && (
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      앱 이벤트
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>
                      {campaignPurpose === 'In_App_Event'
                        ? goalAction
                        : campaignType === 'User_Acquisition'
                        ? goalActionROAS.join(',')
                        : goalActionROAS}
                    </AppTypography.Text>
                  </div>
                </div>
              )}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    캠페인 ID
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{fetchCampaignDetail.data?.id}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    캠페인명
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <Controller
                    name={'title'}
                    control={campaignForm.control}
                    render={({ field }) => (
                      <AppInputCount
                        className={clsx({ 'input-error': _.get(campaignForm.formState.errors, 'title') })}
                        style={{ width: 450 }}
                        maxLength={200}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{
                      required: '캠페인명을 입력하세요.',
                    }}
                  />
                  <ErrorMessage
                    name={'title'}
                    errors={campaignForm.formState.errors}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    국가
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchCampaignDetail.data?.countries.join()}
                  </AppTypography.Text>
                </div>
              </div>
            </div>
            <AppDivider />
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>예산 및 일정</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 600 }}>
                  <div className={'inner'}>
                    {(campaignPurpose === 'Install' || campaignPurpose === 'Click') && (
                      <>
                        {/* 입찰 우선순위*/}
                        <div className={'inner__wrapper'}>
                          <div className={'inner__label'}>
                            <AppTypography.Label isRequired className={'text'}>
                              입찰 우선순위
                            </AppTypography.Label>
                          </div>
                          <div className={'inner__content'}>
                            <Controller
                              name={'bidControlPriority'}
                              control={campaignForm.control}
                              render={({ field }) => (
                                <AppRadioGroup
                                  inline
                                  value={field.value}
                                  data={_.filter(
                                    bidControlPriorityList,
                                    (item) =>
                                      item.value !== (campaignPurpose === 'Install' ? 'Target_CPC' : 'Target_CPI')
                                  )}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    campaignForm.clearErrors('targetCPI');
                                    campaignForm.clearErrors('targetCPC');
                                    campaignForm.setValue('budgetType', 'Daily');
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
                        {/* 입찰 우선순위가 Target_CPI 일 경우 나온다. */}
                        {campaignPurpose === 'Install' &&
                          campaignForm.getValues('bidControlPriority') === 'Target_CPI' && (
                            <div className={'inner__wrapper'}>
                              <div className={'inner__label'}>
                                <AppTypography.Label isRequired className={'text'}>
                                  인스톨당 목표 비용
                                </AppTypography.Label>
                              </div>
                              <div className={'inner__content'}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Controller
                                    name={'targetCPI'}
                                    control={campaignForm.control}
                                    rules={{ required: '금액을 입력하세요.' }}
                                    render={({ field }) => (
                                      <AppInputCount
                                        className={clsx({
                                          'input-error': _.get(campaignForm.formState.errors, 'targetCPI'),
                                        })}
                                        maxLength={7}
                                        style={{ width: 250 }}
                                        isCurrency={true}
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                      />
                                    )}
                                  />
                                  <InfoMessage style={{ marginLeft: 10 }}>
                                    {' '}
                                    10원 ~ 1,000,000원 이내로 입력하세요.
                                  </InfoMessage>
                                </div>
                                <ErrorMessage
                                  name={'targetCPI'}
                                  errors={campaignForm.formState.errors}
                                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                                />
                              </div>
                            </div>
                          )}
                        {campaignPurpose === 'Click' && campaignForm.getValues('bidControlPriority') === 'Target_CPC' && (
                          <div className={'inner__wrapper'}>
                            <div className={'inner__label'}>
                              <AppTypography.Label isRequired className={'text'}>
                                클릭당 목표 비용
                              </AppTypography.Label>
                            </div>
                            <div className={'inner__content'}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Controller
                                  name={'targetCPC'}
                                  control={campaignForm.control}
                                  rules={{ required: '금액을 입력하세요.' }}
                                  render={({ field }) => (
                                    <AppInputCount
                                      className={clsx({
                                        'input-error': _.get(campaignForm.formState.errors, 'targetCPC'),
                                      })}
                                      maxLength={7}
                                      style={{ width: 250 }}
                                      isCurrency={true}
                                      value={field.value}
                                      onChange={(value) => field.onChange(value)}
                                    />
                                  )}
                                />
                                <InfoMessage style={{ marginLeft: 10 }}>
                                  {' '}
                                  10원 ~ 1,000,000원 이내로 입력하세요.
                                </InfoMessage>
                              </div>
                              <ErrorMessage
                                name={'targetCPC'}
                                errors={campaignForm.formState.errors}
                                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 예산타입/ 예산 */}
                    <div className={'inner__wrapper'}>
                      <div className={'inner__label'}>
                        <AppTypography.Label isRequired style={{ display: 'inline-block' }} className={'text'}>
                          예산타입/예산
                        </AppTypography.Label>
                        <InfoTooltip inner={'예산은 캠페인 운영중에도 수정할 수 있습니다.'} />
                      </div>
                      <div className={'inner__content'}>
                        <Controller
                          name={'budgetType'}
                          control={campaignForm.control}
                          render={({ field }) => (
                            <AppRadioGroup
                              inline
                              data={budgetTypeList.filter((budgetType) => {
                                return campaignForm.getValues('bidControlPriority') !== 'Budget'
                                  ? budgetType.value === 'Daily'
                                  : true;
                              })}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                if (value === 'Weekly') {
                                  campaignForm.clearErrors('dailyFixedBudget');
                                  dailyCustomBudgetList.map((daily) => {
                                    campaignForm.clearErrors(`dailyCustomBudget.${daily.key}`);
                                  });
                                } else {
                                  campaignForm.clearErrors('weeklyBudget');
                                }
                              }}
                            />
                          )}
                        />

                        {campaignForm.getValues('budgetType') === 'Daily' && (
                          <>
                            <Controller
                              name={'dailyBudgetType'}
                              control={campaignForm.control}
                              render={({ field }) => (
                                <AppRadioGroup
                                  inline
                                  data={dailyBudgetTypeList}
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    if (value === 'Fixed') {
                                      dailyCustomBudgetList.map((daily) => {
                                        campaignForm.clearErrors(`dailyCustomBudget.${daily.key}`);
                                      });
                                    } else {
                                      campaignForm.clearErrors('dailyFixedBudget');
                                    }
                                  }}
                                />
                              )}
                            />

                            {/* dailyBudgetType 이 Fixed 일때 */}
                            {campaignForm.getValues('dailyBudgetType') === 'Fixed' && (
                              <div style={{ marginTop: 10 }}>
                                <Controller
                                  name={'dailyFixedBudget'}
                                  control={campaignForm.control}
                                  render={({ field }) => (
                                    <>
                                      <AppInputCount
                                        className={clsx({
                                          'input-error': _.get(campaignForm.formState.errors, 'dailyFixedBudget'),
                                        })}
                                        style={{ width: 250, display: 'inline-block' }}
                                        isCurrency={true}
                                        maxLength={20}
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                      />
                                      <InfoMessage style={{ marginLeft: 10 }}>
                                        최소 1,000원 이상 입력하세요.
                                      </InfoMessage>
                                    </>
                                  )}
                                  rules={{
                                    required: '금액을 입력하세요.',
                                  }}
                                />
                                <ErrorMessage
                                  name={'dailyFixedBudget'}
                                  errors={campaignForm.formState.errors}
                                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                                />
                              </div>
                            )}
                            {/* dailyBudgetType 이 Custom 일때*/}
                            {campaignForm.getValues('dailyBudgetType') === 'Custom' && (
                              <div>
                                {dailyCustomBudgetList.map((item, idx) => {
                                  return (
                                    <Fragment key={idx}>
                                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                                        <span style={{ fontWeight: 'bold', marginRight: 10 }}>{item.title}</span>
                                        <Controller
                                          name={`dailyCustomBudget.${item.key}`}
                                          control={campaignForm.control}
                                          render={({ field }) => (
                                            <AppInputCount
                                              className={clsx({
                                                'input-error': _.get(
                                                  campaignForm.formState.errors,
                                                  `dailyCustomBudget.${item.key}`
                                                ),
                                              })}
                                              style={{ width: 250 }}
                                              isCurrency={true}
                                              maxLength={12}
                                              value={field.value}
                                              onChange={(value) => field.onChange(value)}
                                            />
                                          )}
                                          rules={{
                                            required: '금액을 입력하세요.',
                                          }}
                                        />
                                        {idx === 0 && (
                                          <InfoMessage style={{ marginLeft: 10 }}>
                                            최소 1,000원 이상 입력하세요.
                                          </InfoMessage>
                                        )}
                                      </div>
                                      <ErrorMessage
                                        name={`dailyCustomBudget.${item.key}`}
                                        errors={campaignForm.formState.errors}
                                        render={({ message }) => (
                                          <AppErrorMessage style={{ marginLeft: 20 }}>{message}</AppErrorMessage>
                                        )}
                                      />
                                    </Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}

                        {/* budgetType 이 Weekly일때  */}
                        {campaignForm.getValues('budgetType') === 'Weekly' && (
                          <div style={{ marginTop: 10 }}>
                            <div>
                              <Controller
                                name={'weeklyBudget'}
                                control={campaignForm.control}
                                rules={{
                                  required: '금액을 입력하세요.',
                                }}
                                render={({ field }) => (
                                  <AppInputCount
                                    className={clsx({
                                      'input-error': _.get(campaignForm.formState.errors, 'weeklyBudget'),
                                    })}
                                    style={{ width: 250 }}
                                    isCurrency={true}
                                    maxLength={20}
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                  />
                                )}
                              />
                            </div>
                            <ErrorMessage
                              name={`weeklyBudget`}
                              errors={campaignForm.formState.errors}
                              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={'inner__wrapper'}>
                      <div className={'inner__label'}>
                        <AppTypography.Label isRequired className={'text'}>
                          기간
                        </AppTypography.Label>
                      </div>
                      <div className={'inner__content'}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Controller
                            name={'scheduleStartDate'}
                            control={campaignForm.control}
                            render={({ field }) => (
                              <AppDatePicker
                                disabled={dayjs(field.value).isBefore(dayjs(), 'date')}
                                style={{ width: 200 }}
                                cleanable={false}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                disabledDate={(date?: Date) => {
                                  return dayjs(date).isBefore(dayjs(), 'date');
                                }}
                              />
                            )}
                          />
                          <AppTypography.Text style={{ margin: '0 10px' }}>~</AppTypography.Text>
                          <Controller
                            name={'scheduleEndDate'}
                            control={campaignForm.control}
                            render={({ field }) => (
                              <AppDatePicker
                                disabled={watchIsEndDateLimit}
                                className={clsx({
                                  'input-error': _.get(campaignForm.formState.errors, 'scheduleEndDate'),
                                })}
                                cleanable={false}
                                style={{ width: 200 }}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                disabledDate={(date?: Date) => {
                                  return dayjs(date).isBefore(campaignForm.getValues('scheduleStartDate'), 'date');
                                }}
                              />
                            )}
                            rules={{
                              validate: {
                                afterStartDate: (v) => {
                                  return watchIsEndDateLimit ||
                                    dayjs(v).isSame(campaignForm.getValues('scheduleStartDate'), 'date') ||
                                    dayjs(v).isAfter(campaignForm.getValues('scheduleStartDate'), 'date')
                                    ? true
                                    : '종료일은 시작일보다 미래일자로 설정하세요.';
                                },
                              },
                            }}
                          />
                          <Controller
                            name={'isEndDateLimit'}
                            control={campaignForm.control}
                            render={({ field }) => (
                              <Checkbox checked={field.value} onChange={(value, checked) => field.onChange(checked)}>
                                종료일 없음
                              </Checkbox>
                            )}
                          />
                        </div>
                        <ErrorMessage
                          name={`scheduleEndDate`}
                          errors={campaignForm.formState.errors}
                          render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <InfoMessage>Timezone: {currentTimezone ? currentTimezone.label : ''}</InfoMessage>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <AppDivider />
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    트래킹 링크
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <Controller
                    name={'trackingLinkID'}
                    control={campaignForm.control}
                    rules={{ required: '트래킹 링크를 선택하세요.' }}
                    render={({ field }) => (
                      <AppSelectPicker
                        className={clsx({ 'input-error': _.get(campaignForm.formState.errors, 'trackingLinkID') })}
                        data={fetchTrackingLinkList.data}
                        style={{ width: 450 }}
                        labelKey={'title'}
                        valueKey={'id'}
                        value={field.value}
                        searchable={false}
                        cleanable={false}
                        onChange={(value) => field.onChange(value)}
                        placeholder={'트래킹 링크를 선택하세요.'}
                      />
                    )}
                  />
                  <ErrorMessage
                    name={`trackingLinkID`}
                    errors={campaignForm.formState.errors}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
            <AppDivider />
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>추가설정</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <div className={'inner'}>
                    {/* LAT Targeting, UA일때만 보인다. */}
                    {campaignType === 'User_Acquisition' && (
                      <div className={'inner__wrapper'}>
                        <div className={'inner__label'}>
                          <AppTypography.Label isRequired style={{ display: 'inline-block' }}>
                            LAT Targeting
                          </AppTypography.Label>
                          <InfoTooltip
                            inner={
                              'LAT(Limit Ad Tracking) 약자로, 디바이스에서 광고 ID(ADID) 수집여부에 따른 타겟팅을 설정하는 기능입니다.'
                            }
                          />
                        </div>
                        <div className={'inner__content'}>
                          <Controller
                            name={'adTrackingAllowance'}
                            control={campaignForm.control}
                            render={({ field }) => {
                              return (
                                <AppCheckbox
                                  inline
                                  data={LAT_TargetingList.map((item) => ({
                                    ...item,
                                    disabled:
                                      campaignForm.getValues('adTrackingAllowance')?.length === 1 &&
                                      campaignForm.getValues('adTrackingAllowance')[0] === item.value,
                                  }))}
                                  value={field.value}
                                  onChange={(value) => field.onChange(value)}
                                />
                              );
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {/* Conversion 설정 */}
                    <div className={'inner__wrapper'}>
                      <div className={'inner__label'}>
                        <AppTypography.Label style={{ display: 'inline-block' }} className={'text'}>
                          Conversion 설정
                        </AppTypography.Label>
                        <InfoTooltip inner={'선택한 이벤트는 보고서에서 Conversion 지표로 확인할 수 있습니다.'} />
                      </div>
                      <div className={'inner__content'}>
                        <Controller
                          name={'KPIActions'}
                          control={campaignForm.control}
                          render={({ field }) => (
                            <AppCheckPicker
                              style={{ width: 450 }}
                              data={fetchAppEventSummaryList.data?.app_event || []}
                              labelKey={'event_name'}
                              valueKey={'event_name'}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              placeholder={'앱 이벤트를 선택하세요.'}
                              searchable={false}
                              cleanable={false}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <div>
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    광고그룹 ID
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{state.ad_group_id}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    광고그룹명
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <Controller
                    name={'title'}
                    control={adgroupForm.control}
                    render={({ field }) => (
                      <AppInputCount
                        className={clsx({ 'input-error': _.get(adgroupForm.formState.errors, 'title') })}
                        style={{ width: 450 }}
                        maxLength={50}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{ required: '광고그룹명을 입력하세요.' }}
                  />
                  <ErrorMessage
                    name={`title`}
                    errors={adgroupForm.formState.errors}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired style={{ display: 'inline-block' }} className={'text'}>
                    노출빈도
                  </AppTypography.Label>
                  <InfoTooltip inner={'설정한 시간동안 동일한 사용자에게 광고를 1회만 노출합니다.'} />
                </div>
                <div className={'col col-input'}>
                  <div style={{ display: 'flex' }}>
                    <Controller
                      name={'selectedExposureFrequency'}
                      control={adgroupForm.control}
                      render={({ field }) => (
                        <AppSelectPicker
                          style={{
                            width: 200,
                          }}
                          searchable={false}
                          cleanable={false}
                          className={clsx({
                            'input-error': _.get(adgroupForm.formState.errors, 'selectedExposureFrequency'),
                          })}
                          data={exposureFrequencyList}
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            adgroupForm.clearErrors('exposureFrequencyValue.amount');
                          }}
                        />
                      )}
                      rules={{ required: true }}
                    />
                    {adgroupForm.getValues('selectedExposureFrequency') === 'CUSTOM' && (
                      <>
                        <Controller
                          name={'exposureFrequencyValue.amount'}
                          control={adgroupForm.control}
                          render={({ field }) => (
                            <AppInputCount
                              className={clsx({
                                'input-error': _.get(adgroupForm.formState.errors, 'exposureFrequencyValue.amount'),
                              })}
                              style={{
                                width: 100,
                                marginLeft: 10,
                              }}
                              isNumber={true}
                              maxLength={2}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                          rules={{
                            validate: {
                              afterStartDate: (v) => {
                                return adgroupForm.getValues('selectedExposureFrequency') !== 'CUSTOM' || v
                                  ? true
                                  : '노출빈도를 입력하세요.';
                              },
                            },
                          }}
                        />
                        <Controller
                          name={'exposureFrequencyValue.unit'}
                          control={adgroupForm.control}
                          render={({ field }) => (
                            <AppSelectPicker
                              className={clsx({
                                'input-error': _.get(adgroupForm.formState.errors, 'exposureFrequencyValue.unit'),
                              })}
                              style={{
                                width: 100,
                                marginLeft: 10,
                              }}
                              cleanable={false}
                              searchable={false}
                              data={exposureFrequencyUnitList}
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                            />
                          )}
                          rules={{
                            required: true,
                          }}
                        />
                      </>
                    )}
                  </div>
                  <ErrorMessage
                    name={'exposureFrequencyValue.amount'}
                    errors={adgroupForm.formState.errors}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
            <AppDivider />
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>소재그룹</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <div>
                    <Controller
                      name={'selectedCreativeGroup'}
                      control={adgroupForm.control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <AppCheckPicker
                          style={{ width: 450 }}
                          data={fetchCreativeGroupList.data || []}
                          labelKey={'title'}
                          valueKey={'id'}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          placeholder={'소재그룹을 선택하세요.'}
                        />
                      )}
                    />
                  </div>
                  <InfoMessage style={{ marginTop: 10 }}>
                    하나 이상의 소재그룹을 추가해야 캠페인 라이브가 가능합니다.
                  </InfoMessage>
                </div>
              </div>
            </div>
            <AppDivider />
            <div className={'content__box'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>맞춤 타겟</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <Controller
                    name={'selectedAudienceTarget'}
                    control={adgroupForm.control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <AppCheckPicker
                        style={{ width: 450 }}
                        data={fetchAudienceTargetList.data || []}
                        labelKey={'title'}
                        valueKey={'id'}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        placeholder={'맞춤 타겟명을 선택하세요.'}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <FinalActionDivider />
      <AppPageFooter
        extra={
          <AppButton
            size={'lg'}
            style={{ width: 70, textAlign: 'center', padding: 0 }}
            theme={'white_gray'}
            onClick={() => setOpenDeleteConfirm(true)}
          >
            삭제
          </AppButton>
        }
      >
        <AppButton
          size={'lg'}
          style={{ width: 138 }}
          onClick={() => {
            navigate('/campaigns/campaign');
          }}
        >
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={
            currentStep === 0
              ? campaignForm.handleSubmit(onClickUpdateCampaign)
              : adgroupForm.handleSubmit(handleEditAdGroupClick)
          }
        >
          완료
        </AppButton>
      </AppPageFooter>

      <AppModal
        open={openDeleteConfirm}
        size={'xs'}
        onClose={() => {
          setOpenDeleteConfirm(false);
        }}
      >
        <AppModal.Header>{`${currentStep === 0 ? '캠페인' : '광고그룹'} 삭제`}</AppModal.Header>
        <AppModal.Body style={{ paddingBottom: 30 }}>
          <div>{`삭제한 ${currentStep === 0 ? '캠페인' : '광고그룹'}은 복구할 수 없으며,`}</div>
          <div>{`캠페인 화면에 노출되지 않습니다.`}</div>
          <div>{`${
            currentStep === 0 ? campaignForm.getValues('title') : adgroupForm.getValues('title')
          }을 삭제하시겠습니까?`}</div>
        </AppModal.Body>
        <AppModal.Footer>
          <AppButton onClick={() => setOpenDeleteConfirm(false)}>취소</AppButton>
          <AppButton
            theme={'red'}
            onClick={() => {
              setOpenDeleteConfirm(false);
              handleDelete();
            }}
          >
            확인
          </AppButton>
        </AppModal.Footer>
      </AppModal>
    </StyledCampaignCreate>
  );
};

export default CampaignEdit;

const microAmount = 1000000;

const goalGenerator = (
  campaignType: string,
  campaignPurpose: string | number,
  bidPriority = '',
  etc: any = {
    kpi_actions: [],
    target_cpi: 0,
    action: '',
    revenue_actions: [],
    target_cpc: 0,
  }
) => {
  campaignType = campaignType === 'User_Acquisition' ? 'UA' : 'RE';
  const keyName = `${campaignType}_${campaignPurpose}${bidPriority !== '' ? `_${bidPriority}` : ''}`;
  const goalObject: {
    [key: string]: any;
  } = {
    UA_Install_Budget: {
      goal: {
        type: 'OPTIMIZE_CPI_FOR_APP_UA',
        kpi_actions: etc.kpi_actions, // []
        optimize_app_installs: {
          mode: 'BUDGET_CENTRIC',
          rate: 1,
        },
      },
    },
    UA_Install_Target_CPI: {
      goal: {
        type: 'OPTIMIZE_CPI_FOR_APP_UA',
        kpi_actions: etc.kpi_actions, // []
        optimize_app_installs: {
          mode: 'TARGET_CPI_CENTRIC',
          target_cpi: {
            currency: 'KRW',
            amount_micros: parseFloat(etc.target_cpi) * microAmount, // number
          },
        },
      },
    },
    UA_In_App_Event: {
      goal: {
        type: 'OPTIMIZE_CPA_FOR_APP_UA',
        kpi_actions: etc.kpi_actions, // []
        optimize_cpa_for_app_ua: {
          mode: 'BUDGET_CENTRIC',
          rate: 1,
          action: etc.action, // ''
        },
      },
    },
    UA_ROAS: {
      goal: {
        type: 'OPTIMIZE_ROAS_FOR_APP_UA',
        kpi_actions: etc.kpi_actions, // []
        optimize_app_roas: {
          mode: 'BUDGET_CENTRIC',
          rate: 1,
          revenue_actions: etc.revenue_actions, // []
        },
      },
    },
    RE_Click_Budget: {
      goal: {
        type: 'OPTIMIZE_CPC_FOR_APP_RE',
        kpi_actions: etc.kpi_actions, // []
        optimize_cpc_for_app_re: {
          mode: 'BUDGET_CENTRIC',
          reengagement_action: 'click',
          rate: 1,
        },
      },
    },
    RE_Click_Target_CPC: {
      goal: {
        type: 'OPTIMIZE_CPC_FOR_APP_RE',
        kpi_actions: etc.kpi_actions, // []
        optimize_cpc_for_app_re: {
          mode: 'TARGET_CPC_CENTRIC',
          reengagement_action: 'click',
          target_cpc: {
            currency: 'KRW',
            amount_micros: etc.target_cpc, // number
          },
        },
      },
    },
    RE_App_Open: {
      goal: {
        type: 'OPTIMIZE_REATTRIBUTION_FOR_APP',
        kpi_actions: etc.kpi_actions, // []
        optimize_app_reattribution: {
          mode: 'BUDGET_CENTRIC',
          rate: 1,
        },
      },
    },
    RE_In_App_Event: {
      goal: {
        type: 'OPTIMIZE_CPA_FOR_APP_RE',
        kpi_actions: etc.kpi_actions, // []
        optimize_cpa_for_app_re: {
          mode: 'BUDGET_CENTRIC',
          action: etc.action, // ''
          rate: 1,
          reengagement_action: 'click',
        },
      },
    },
    RE_ROAS: {
      goal: {
        type: 'OPTIMIZE_ROAS_FOR_APP_RE',
        kpi_actions: etc.kpi_actions,
        optimize_roas_for_app_re: {
          mode: 'BUDGET_CENTRIC',
          rate: 1,
          revenue_actions: etc.revenue_actions, // []
          reengagement_action: 'click',
        },
      },
    },
  };
  return goalObject[keyName];
};

const campaignDefaultValues: {
  title: string;
  bidControlPriority: string;
  targetCPI: string;
  targetCPC: string;
  budgetType: string;
  dailyBudgetType: string;
  dailyFixedBudget: string;
  dailyCustomBudget: {
    monday_budget: string;
    tuesday_budget: string;
    wednesday_budget: string;
    thursday_budget: string;
    friday_budget: string;
    saturday_budget: string;
    sunday_budget: string;
  };
  weeklyBudget: string;
  scheduleStartDate: Date;
  scheduleEndDate: Date;
  isEndDateLimit: boolean;
  trackingLinkID: string;
  adTrackingAllowance: string[];
  KPIActions: string[];
} = {
  title: '',
  bidControlPriority: 'Budget',
  targetCPI: '',
  targetCPC: '',
  budgetType: '',
  dailyBudgetType: '',
  dailyFixedBudget: '',
  dailyCustomBudget: {
    monday_budget: '',
    tuesday_budget: '',
    wednesday_budget: '',
    thursday_budget: '',
    friday_budget: '',
    saturday_budget: '',
    sunday_budget: '',
  },
  weeklyBudget: '',
  scheduleStartDate: new Date(),
  scheduleEndDate: new Date(),
  isEndDateLimit: true,
  trackingLinkID: '',
  adTrackingAllowance: [],
  KPIActions: [],
};
