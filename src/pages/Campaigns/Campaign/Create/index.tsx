import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import AppTypography from '@/components/AppTypography';
import AppRadioGroup, { AppRadio } from '@components/AppRadio';
import { AppInputCount } from '@components/AppInput';
import dayjs from 'dayjs';
import {
  bidControlPriorityList,
  budgetTypeList,
  campaignPurposeListByRE,
  campaignPurposeListByUA,
  campaignTypeList,
  dailyBudgetTypeList,
  dailyCustomBudgetList,
  LAT_TargetingList,
} from '@pages/Campaigns/Campaign/variables';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { getAppEventSummary } from '@apis/product.api';
import AppDatePicker from '@components/AppDatePicker';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import { Checkbox, Loader, Steps, Whisper } from 'rsuite';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import AppPageFooter from '@components/AppPageFooter';
import { AppButton } from '@components/AppButton';
import { createCampaign, getCampaignDetail } from '@apis/campaign.api';
import { createAdGroup } from '@apis/ad_group.api';
import styled from 'styled-components';

import { Controller, useForm } from 'react-hook-form';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import AppCheckbox from '@components/AppCheckbox';
import clsx from 'clsx';
import { ConfirmModal } from '@components/AppModal';
import { CampaignCreateCancelModalContext } from '@/utils/context/CampaignCreateCancelModalContext';
import InfoTooltip from '@components/InfoTooltip';
import InfoMessage from '@components/AppTypography/InfoMessage';
import AppPopover from '@components/AppPopover';
import AdGroupForm from './AdGroupForm';
import { numberWithCommas } from '@/utils';
import { sortByCaseInsensitive } from '@utils/functions';
import TimezoneJSON from '@utils/json/timezone.json';

interface CampaignCreateProps {}

const CampaignCreate: React.FC<CampaignCreateProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const { state }: { state: any } = useLocation();
  const {
    handleSubmit: CA_handleSubmit,
    control: CA_control,
    watch: CA_watch,
    setValue: CA_setValue,
    formState: { errors: CA_errors },
    getValues: CA_getValues,
    clearErrors: CA_clearErrors,
  } = useForm();

  const adgroupForm = useForm();

  const watchCampaignType = CA_watch('campaign.type', 'User_Acquisition');
  const watchCampaignPurpose = CA_watch('campaign.purpose', 'Install');
  const watchCampaignBidControlPriority = CA_watch('bidControlPriority', 'Budget');
  const watchCampaignBudgetType = CA_watch('budgetType', 'Daily');
  const watchCampaignDailyBudgetType = CA_watch('dailyBudgetType', 'Fixed');
  const watchCampaignIsEndDateLimit = CA_watch('isEndDateLimit', true);

  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const navigate = useNavigate();
  const { open, setCancelModalOpen, onOk, setOnOk } = useContext(CampaignCreateCancelModalContext);
  const [openCreateConfirm, setOpenCreateConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Common */
  // 스텝 0에서 시작해서 1로 끝난다.
  const [currentStep, setCurrentStep] = useState(0);

  /* 캠페인 */
  const [campaignData, setCampaignData] = useState<any>();
  // const [existCampaignData, setExistCampaignData] = useState(); //광고그룹 추가시 사용

  // API : 앱이벤트 가져오기
  const fetchAppEventSummaryList = useQuery(
    ['fetchAppEventSummaryList'],
    async () => {
      const { data } = await getAppEventSummary(state.currentProductData.id, {
        'condition.time_window': 'TIME_WINDOW_D30',
      });

      if (data.postback_integration_event_summary && data.postback_integration_event_summary.summary.length !== 0) {
        const filterROAS = _.filter(data.postback_integration_event_summary.summary, (item) => {
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
      enabled: !_.isEmpty(state.currentProductData.id),
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
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(state.currentProductData.id),
    }
  );

  // API : 캠페인 상세보기
  const existCampaignData = useQuery(
    ['existCampaignData', state.campaign_id],
    async () => {
      const { data } = await getCampaignDetail({ campaign_id: state.campaign_id });
      if (data.campaign) {
        const { campaign } = data;
        /* 기본값 세팅 */
        let result: any = {};
        if (campaign.type === 'APP_USER_ACQUISITION') {
          // UA
          result.campaignType = 'User_Acquisition';
          // LAT Targeting
          result.adTrackingAllowance =
            campaign.ad_tracking_allowance === 'DO_NOT_CARE'
              ? ['LAT_ONLY', 'NON_LAT_ONLY']
              : ([campaign.ad_tracking_allowance] as string[]);

          switch (campaign.goal.type) {
            case 'OPTIMIZE_CPI_FOR_APP_UA':
              result.campaignPurpose = 'Install';
              if (campaign.goal.optimize_app_installs.mode === 'BUDGET_CENTRIC') {
                // BUDGET_CENTRIC
                result.bidControlPriority = 'Budget';
              } else {
                // TARGET_CPI_CENTRIC
                result.bidControlPriority = 'Target_CPI';
                result.targetCPI = (
                  campaign.goal.optimize_app_installs.target_cpi.amount_micros / microAmount
                ).toString();
              }
              break;
            case 'OPTIMIZE_CPA_FOR_APP_UA':
              // in App Event
              result.campaignPurpose = 'In_App_Event';
              result.goalAction = campaign.goal.optimize_cpa_for_app_ua.action;
              break;
            case 'OPTIMIZE_ROAS_FOR_APP_UA':
              // ROAS
              result.campaignPurpose = 'ROAS';
              result.goalActionROAS = campaign.goal.optimize_app_roas.revenue_actions;
              break;
          }
        } else {
          // RE
          result.campaignType = 'Re_engagement';
          switch (campaign.goal.type) {
            case 'OPTIMIZE_CPC_FOR_APP_RE':
              result.campaignPurpose = 'Click';
              if (campaign.goal.optimize_cpc_for_app_re.mode === 'BUDGET_CENTRIC') {
                result.bidControlPriority = 'Budget';
              } else {
                result.bidControlPriority = 'Target_CPC';
                result.targetCPC = (
                  campaign.goal.optimize_cpc_for_app_re.target_cpc.amount_micros / microAmount
                ).toString();
              }
              break;
            case 'OPTIMIZE_REATTRIBUTION_FOR_APP':
              // App Open
              result.campaignPurpose = 'App_Open';
              break;
            case 'OPTIMIZE_CPA_FOR_APP_RE':
              // in App Event
              result.campaignPurpose = 'In_App_Event';
              result.goalAction = campaign.goal.optimize_cpa_for_app_re.action;
              break;
            case 'OPTIMIZE_ROAS_FOR_APP_RE':
              // ROAS
              result.campaignPurpose = 'ROAS';
              result.goalActionROAS = campaign.goal.optimize_roas_for_app_re.revenue_actions;

              break;
          }
        }

        /* 기본값 세팅 - 공통 */
        // 캠페인명
        result.title = campaign.title;

        // 예산타입/예산
        if (campaign.budget_schedule.daily_schedule) {
          result.budgetType = 'Daily';
          result.dailyBudgetType = 'Fixed';
          result.dailyFixedBudget = (
            campaign.budget_schedule.daily_schedule.daily_budget.amount_micros / microAmount
          ).toString();
        }
        if (campaign.budget_schedule.weekly_flexible_schedule) {
          result.budgetType = 'Weekly';
          result.weeklyBudget = (
            campaign.budget_schedule.weekly_flexible_schedule.weekly_budget.amount_micros / microAmount
          ).toString();
        }
        if (campaign.budget_schedule.weekly_schedule) {
          const {
            monday_budget,
            tuesday_budget,
            wednesday_budget,
            thursday_budget,
            friday_budget,
            saturday_budget,
            sunday_budget,
          } = campaign.budget_schedule.weekly_schedule;

          result.budgetType = 'Daily';
          result.dailyBudgetType = 'Custom';
          result.dailyCustomBudget = {
            monday_budget: (monday_budget.amount_micros / microAmount).toString(),
            tuesday_budget: (tuesday_budget.amount_micros / microAmount).toString(),
            wednesday_budget: (wednesday_budget.amount_micros / microAmount).toString(),
            thursday_budget: (thursday_budget.amount_micros / microAmount).toString(),
            friday_budget: (friday_budget.amount_micros / microAmount).toString(),
            saturday_budget: (saturday_budget.amount_micros / microAmount).toString(),
            sunday_budget: (sunday_budget.amount_micros / microAmount).toString(),
          };
        }
        // 스케줄
        result.scheduleStartDate = dayjs(campaign.schedule.start).toDate();
        result.scheduleEndDate = campaign.schedule.end
          ? dayjs(campaign.schedule.end).toDate()
          : dayjs(campaign.schedule.start).toDate();
        result.isEndDateLimit = !campaign.schedule.end;

        // 트래킹 링크
        result.trackingLinkID = campaign.tracking_link_id;

        if (campaign.goal.kpi_actions) {
          // KPI
          result.trackingLinkID = campaign.goal.kpi_actions;
        }

        // 캠페인 리턴
        return result;
      } else {
        return {};
      }
    },
    {
      enabled: !_.isEmpty(state.campaign_id) && state.type === 'ad_group',
    }
  );

  /* 함수들 */
  const adGroupSubmitConfirm = () => {
    setOpenCreateConfirm(true);
  };

  const onAdGroupSubmit = () => {
    const data = adgroupForm.getValues();
    const adGroupData = {
      title: data.title,
      enabling_state: 'ENABLED',
      audience: {
        shared_audience_target_ids: data.selectedAudienceTarget,
      },
      capper: {
        imp_interval:
          data.selectedExposureFrequency === 'CUSTOM'
            ? { amount: data.exposureFrequencyValue.amount, unit: data.exposureFrequencyValue.unit }
            : {
                amount: data.selectedExposureFrequency.split('_')[0],
                unit: data.selectedExposureFrequency.split('_')[1],
              },
      },
      pricing_model_id: '',
      creative_group_ids: data.selectedCreativeGroup,
    };

    setLoading(true);
    if (state.type === 'campaign') {
      // 생성 타입 - 캠페인
      const payload = {
        campaign: campaignData,
        ad_group: adGroupData,
      };

      createCampaign(
        {
          ad_account_id: selectedAdAccount,
          product_id: state.currentProductData.id,
        },
        payload
      )
        .then(() => {
          navigate('/campaigns/campaign');
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 생성 타입 - 광고 그룹
      createAdGroup({
        queryParams: {
          ad_account_id: selectedAdAccount,
          product_id: state.currentProductData.id,
          campaign_id: state.campaign_id,
        },
        bodyParams: adGroupData,
      })
        .then(() => {
          navigate('/campaigns/campaign');
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 캠페인 Validation 및 다음 스텝으로 이동
  const onCampaignSubmit = (data: any) => {
    if (state.type === 'campaign') {
      const adTrackingAllowanceGenerator = () => {
        if (data.campaign.type === 'User_Acquisition') {
          return {
            ad_tracking_allowance:
              data.adTrackingAllowance.length === 2 ? 'DO_NOT_CARE' : data.adTrackingAllowance.join(),
          };
        } else {
          return {};
        }
      };
      const budgetScheduleGenerator = () => {
        if (data.budgetType === 'Daily') {
          if (data.dailyBudgetType === 'Fixed') {
            return {
              budget_schedule: {
                daily_schedule: {
                  daily_budget: {
                    currency: 'KRW',
                    amount_micros: parseFloat(data.dailyFixedBudget) * microAmount,
                  },
                },
              },
            };
          } else {
            // Custom
            return {
              budget_schedule: {
                weekly_schedule: {
                  ..._.mapValues(data.dailyCustomBudget, (value) => {
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
                  amount_micros: parseFloat(data.weeklyBudget) * microAmount || 0,
                },
              },
            },
          };
        }
      };
      setCampaignData({
        title: data.campaign.name,
        description: '',
        type: data.campaign.type === 'User_Acquisition' ? 'APP_USER_ACQUISITION' : 'APP_REENGAGEMENT',
        enabling_state: 'DISABLED',
        device_os: 'ANDROID',
        countries: ['KOR'],
        currency: 'KRW',
        landing_url: '',
        schedule: {
          start: data.scheduleStartDate,
          ...(!data.isEndDateLimit ? { end: data.scheduleEndDate } : {}),
        },
        audience_extension: {
          enabled: true,
        },
        ...adTrackingAllowanceGenerator(),
        ...budgetScheduleGenerator(),
        ...goalGenerator(
          data.campaign.type,
          data.campaign.purpose,
          data.campaign.purpose === 'Install' || data.campaign.purpose === 'Click' ? data.bidControlPriority : '',
          {
            kpi_actions: data.KPIActions,
            target_cpi: data.targetCPI,
            action: data.goalAction,
            revenue_actions: Array.isArray(data.goalActionROAS) ? data.goalActionROAS : [data.goalActionROAS],
            target_cpc: data.targetCPC,
          }
        ),
        tracking_link_id: data.trackingLinkID,
      });
    }

    setCurrentStep(1);
  };

  const currentTimezone = useMemo(() => {
    const adAccountTimezone = adAccountList.find((item: any) => item.id === selectedAdAccount).timezone;
    return TimezoneJSON.find((item) => item.value === adAccountTimezone);
  }, [selectedAdAccount]);
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

  return (
    <StyledCampaignCreate>
      {loading && <Loader center backdrop style={{ zIndex: 99 }} />}
      {/* 스텝 영역 */}
      <div className={'step__wrapper'} style={{ marginBottom: 30 }}>
        <Steps current={currentStep} style={{ width: 300, margin: '0 auto' }} classPrefix={'app-step'}>
          <Steps.Item title={'캠페인'} />
          <Steps.Item title={'광고그룹'} />
        </Steps>
      </div>
      {/* 입력 영역 */}
      <div className={'inputs__wrapper'}>
        {/* 캠페인 */}
        {currentStep === 0 && (
          <div className={'campaign'}>
            <div className={'content__box'}>
              {/* 앱 이름 */}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    앱 이름
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{state.currentProductData.title}</AppTypography.Text>
                </div>
              </div>
              {/* 캠페인 타입 */}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    캠페인 타입
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  {state.type === 'campaign' ? (
                    <>
                      <Controller
                        name={'campaign.type'}
                        control={CA_control}
                        defaultValue={'User_Acquisition'}
                        render={({ field }) => {
                          return (
                            <AppRadioGroup
                              inline
                              data={campaignTypeList}
                              value={field.value}
                              onChange={(value) => {
                                CA_setValue('campaign.purpose', value === 'User_Acquisition' ? 'Install' : 'Click');
                                CA_setValue('bidControlPriority', 'Budget');
                                field.onChange(value);
                                CA_clearErrors();
                              }}
                            />
                          );
                        }}
                      />
                      <ErrorMessage
                        name={'campaign.type'}
                        errors={CA_errors}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </>
                  ) : (
                    <AppTypography.Text className={'text'}>
                      {campaignTypeList.find((t) => t.value === existCampaignData.data?.campaignType)?.label}
                    </AppTypography.Text>
                  )}
                </div>
              </div>
              {/* 캠페인 목적 */}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    캠페인 목적
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  {state.type === 'campaign' ? (
                    <>
                      <Controller
                        name={'campaign.purpose'}
                        control={CA_control}
                        defaultValue={'Install'}
                        render={({ field }) => (
                          <AppRadioGroup
                            inline
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              CA_clearErrors();
                              CA_setValue('bidControlPriority', 'Budget');
                            }}
                          >
                            {watchCampaignType === 'User_Acquisition' && (
                              <>
                                {campaignPurposeListByUA.map((item, idx) => {
                                  return (item.value === 'In_App_Event' &&
                                    fetchAppEventSummaryList.data?.app_event.length === 0) ||
                                    (item.value === 'ROAS' && fetchAppEventSummaryList.data?.roas.length === 0) ? (
                                    <Whisper
                                      trigger="hover"
                                      placement="bottomStart"
                                      enterable
                                      speaker={
                                        <AppPopover theme={'white'}>
                                          최근 30일 이내 수집중인 포스트백 (매출)이벤트가 없습니다.
                                        </AppPopover>
                                      }
                                      key={idx}
                                    >
                                      <span style={{ display: 'inline-block' }}>
                                        <AppRadio value={item.value} style={{ pointerEvents: 'none' }} disabled>
                                          {item.label}
                                        </AppRadio>
                                      </span>
                                    </Whisper>
                                  ) : (
                                    <AppRadio value={item.value} key={idx}>
                                      {item.label}
                                    </AppRadio>
                                  );
                                })}
                              </>
                            )}
                            {watchCampaignType === 'Re_engagement' && (
                              <>
                                {campaignPurposeListByRE.map((item, idx) => {
                                  return (item.value === 'In_App_Event' &&
                                    fetchAppEventSummaryList.data?.app_event.length === 0) ||
                                    (item.value === 'ROAS' && fetchAppEventSummaryList.data?.roas.length === 0) ? (
                                    <Whisper
                                      trigger="hover"
                                      placement="bottomStart"
                                      enterable
                                      speaker={
                                        <AppPopover theme={'white'}>
                                          최근 30일 이내 수집중인 포스트백 (매출)이벤트가 없습니다.
                                        </AppPopover>
                                      }
                                      key={idx}
                                    >
                                      <span style={{ display: 'inline-block' }}>
                                        <AppRadio value={item.value} style={{ pointerEvents: 'none' }} disabled>
                                          {item.label}
                                        </AppRadio>
                                      </span>
                                    </Whisper>
                                  ) : (
                                    <AppRadio value={item.value} key={idx}>
                                      {item.label}
                                    </AppRadio>
                                  );
                                })}
                              </>
                            )}
                          </AppRadioGroup>
                        )}
                      />
                    </>
                  ) : (
                    <AppTypography.Text className={'text'}>
                      {
                        (existCampaignData.data?.campaignType === 'User_Acquisition'
                          ? campaignPurposeListByUA
                          : campaignPurposeListByRE
                        ).find((t) => t.value === existCampaignData.data?.campaignPurpose)?.label
                      }
                    </AppTypography.Text>
                  )}
                </div>
              </div>
              {/* 앱 이벤트 */}
              {/* 캠페인 타입 : User Acquisition , 캠페인 목적: In App Event, ROAS 일 경우 */}
              {(watchCampaignPurpose === 'In_App_Event' ||
                watchCampaignPurpose === 'ROAS' ||
                existCampaignData.data?.campaignPurpose === 'In_App_Event' ||
                existCampaignData.data?.campaignPurpose === 'ROAS') && (
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'} isRequired>
                      앱 이벤트
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    {state.type === 'campaign' ? (
                      <>
                        {watchCampaignPurpose === 'In_App_Event' && (
                          <Controller
                            name={'goalAction'}
                            control={CA_control}
                            defaultValue={''}
                            render={({ field }) => (
                              <AppSelectPicker
                                className={clsx({ 'input-error': _.get(CA_errors, 'goalAction') })}
                                data={fetchAppEventSummaryList.data?.app_event}
                                searchable={false}
                                cleanable={false}
                                labelKey={'event_name'}
                                valueKey={'event_name'}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                placeholder={'앱 이벤트를 선택하세요.'}
                              />
                            )}
                            rules={{ required: '앱 이벤트를 선택하세요.' }}
                          />
                        )}
                        {watchCampaignPurpose === 'ROAS' && (
                          <Controller
                            name={'goalActionROAS'}
                            control={CA_control}
                            defaultValue={watchCampaignType === 'User_Acquisition' ? [] : ''}
                            render={({ field }) => {
                              return watchCampaignType === 'User_Acquisition' ? (
                                <AppCheckPicker
                                  className={clsx({ 'input-error': _.get(CA_errors, 'goalActionROAS') })}
                                  data={fetchAppEventSummaryList.data?.roas || []}
                                  searchable={false}
                                  cleanable={false}
                                  labelKey={'event_name'}
                                  valueKey={'event_name'}
                                  value={field.value}
                                  onChange={(value) => field.onChange(value)}
                                  placeholder={'앱 이벤트를 선택하세요.'}
                                />
                              ) : (
                                <AppSelectPicker
                                  className={clsx({ 'input-error': _.get(CA_errors, 'goalActionROAS') })}
                                  data={fetchAppEventSummaryList.data?.roas || []}
                                  searchable={false}
                                  cleanable={false}
                                  labelKey={'event_name'}
                                  valueKey={'event_name'}
                                  value={field.value}
                                  onChange={(value) => field.onChange(value)}
                                  placeholder={'앱 이벤트를 선택하세요.'}
                                />
                              );
                            }}
                            rules={{
                              required: '앱 이벤트를 선택하세요.',
                            }}
                          />
                        )}
                        <ErrorMessage
                          name={'goalAction'}
                          errors={CA_errors}
                          render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                        />
                        <ErrorMessage
                          name={'goalActionROAS'}
                          errors={CA_errors}
                          render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                        />
                      </>
                    ) : (
                      <AppTypography.Text className={'text'}>
                        {existCampaignData.data?.campaignPurpose === 'In_App_Event'
                          ? existCampaignData.data?.goalAction
                          : existCampaignData.data?.campaignType === 'User_Acquisition'
                          ? existCampaignData.data?.goalActionROAS.join(',')
                          : existCampaignData.data?.goalActionROAS}
                      </AppTypography.Text>
                    )}
                  </div>
                </div>
              )}
              {/* 캠페인명 */}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    캠페인명
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  {state.type === 'campaign' ? (
                    <>
                      <Controller
                        name={'campaign.name'}
                        control={CA_control}
                        defaultValue={''}
                        render={({ field }) => (
                          <AppInputCount
                            className={clsx({ 'input-error': _.get(CA_errors, 'campaign.name') })}
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
                        name={'campaign.name'}
                        errors={CA_errors}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </>
                  ) : (
                    <AppTypography.Text className={'text'}>{existCampaignData.data?.title}</AppTypography.Text>
                  )}
                </div>
              </div>

              {/* 국가 */}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    국가
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>KOR</AppTypography.Text>
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
                    {/* 입찰 우선순위 */}
                    {(watchCampaignPurpose === 'Install' ||
                      watchCampaignPurpose === 'Click' ||
                      existCampaignData.data?.campaignPurpose === 'Install' ||
                      existCampaignData.data?.campaignPurpose === 'Click') && (
                      <div className={'inner__wrapper'}>
                        <div className="inner__label">
                          <AppTypography.Label isRequired>입찰 우선순위</AppTypography.Label>
                        </div>
                        <div className={'inner__content'}>
                          {state.type === 'campaign' ? (
                            <Controller
                              name={'bidControlPriority'}
                              control={CA_control}
                              defaultValue={'Budget'}
                              render={({ field }) => (
                                <AppRadioGroup
                                  inline
                                  value={field.value}
                                  data={_.filter(
                                    bidControlPriorityList,
                                    (item) =>
                                      item.value !== (watchCampaignPurpose === 'Install' ? 'Target_CPC' : 'Target_CPI')
                                  )}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    CA_clearErrors('targetCPI');
                                    CA_clearErrors('targetCPC');
                                    CA_setValue('budgetType', 'Daily');
                                  }}
                                />
                              )}
                            />
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {
                                bidControlPriorityList.find(
                                  (t) => t.value === existCampaignData.data?.bidControlPriority
                                )?.label
                              }
                            </AppTypography.Text>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 인스톨당 목표 비용 */}
                    {/* 입찰 우선순위가 Target_CPI 일 경우 나온다. */}
                    {((watchCampaignPurpose === 'Install' && watchCampaignBidControlPriority === 'Target_CPI') ||
                      (existCampaignData.data?.campaignPurpose === 'Install' &&
                        existCampaignData.data?.bidControlPriority === 'Target_CPI')) && (
                      <div className={'inner__wrapper'}>
                        <div className="inner__label">
                          <AppTypography.Label isRequired className={'text'}>
                            인스톨당 목표 비용
                          </AppTypography.Label>
                        </div>
                        <div className={'inner__content'}>
                          {state.type === 'campaign' ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Controller
                                  name={'targetCPI'}
                                  control={CA_control}
                                  defaultValue={''}
                                  rules={{ required: '금액을 입력하세요.' }}
                                  render={({ field }) => (
                                    <AppInputCount
                                      className={clsx({ 'input-error': _.get(CA_errors, 'targetCPI') })}
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
                                errors={CA_errors}
                                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                              />
                            </>
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {`₩ ${numberWithCommas(existCampaignData.data?.targetCPI)}`}
                            </AppTypography.Text>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 클릭당 목표 비용 */}
                    {/* 입찰 우선순위가 Target_CPC 일 경우 나온다  */}
                    {((watchCampaignPurpose === 'Click' && watchCampaignBidControlPriority === 'Target_CPC') ||
                      (existCampaignData.data?.campaignPurpose === 'Click' &&
                        existCampaignData.data?.bidControlPriority === 'Target_CPC')) && (
                      <div className={'inner__wrapper'}>
                        <div className="inner__label">
                          <AppTypography.Label isRequired className={'text'}>
                            클릭당 목표 비용
                          </AppTypography.Label>
                        </div>
                        <div className={'inner__content'}>
                          {state.type === 'campaign' ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Controller
                                  name={'targetCPC'}
                                  control={CA_control}
                                  defaultValue={''}
                                  rules={{ required: '금액을 입력하세요.' }}
                                  render={({ field }) => (
                                    <AppInputCount
                                      className={clsx({ 'input-error': _.get(CA_errors, 'targetCPC') })}
                                      maxLength={7}
                                      style={{ width: 250 }}
                                      isCurrency={true}
                                      value={field.value}
                                      onChange={(value) => field.onChange(value)}
                                    />
                                  )}
                                />
                                <InfoMessage style={{ marginLeft: 10 }}>
                                  10원 ~ 1,000,000원 이내로 입력하세요.
                                </InfoMessage>
                              </div>
                              <ErrorMessage
                                name={'targetCPC'}
                                errors={CA_errors}
                                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                              />
                            </>
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {`₩ ${numberWithCommas(existCampaignData.data?.targetCPC)}`}
                            </AppTypography.Text>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 예산타입/예산 */}
                    <div className={'inner__wrapper'}>
                      <div className={'inner__label'}>
                        <AppTypography.Label isRequired style={{ display: 'inline-block' }} className={'text'}>
                          예산타입/예산
                        </AppTypography.Label>
                        <InfoTooltip inner={'예산은 캠페인 운영중에도 수정할 수 있습니다.'} />
                      </div>
                      <div className={'inner__content'}>
                        {state.type === 'campaign' ? (
                          <>
                            <Controller
                              name={'budgetType'}
                              control={CA_control}
                              defaultValue={'Daily'}
                              render={({ field }) => (
                                <AppRadioGroup
                                  inline
                                  data={budgetTypeList.filter((budgetType) => {
                                    return CA_getValues('bidControlPriority') !== 'Budget'
                                      ? budgetType.value === 'Daily'
                                      : true;
                                  })}
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    if (value === 'Weekly') {
                                      CA_clearErrors('dailyFixedBudget');
                                      dailyCustomBudgetList.map((daily: { key: string }) => {
                                        CA_clearErrors(`dailyCustomBudget.${daily.key}`);
                                      });
                                    } else {
                                      CA_clearErrors('weeklyBudget');
                                    }
                                  }}
                                />
                              )}
                            />
                          </>
                        ) : (
                          <AppTypography.Text className={'text'}>
                            {budgetTypeList.find((t) => t.value === existCampaignData.data?.budgetType)?.label}
                          </AppTypography.Text>
                        )}

                        {/* 예산타입/예산이 Daily 이라면 */}
                        {(watchCampaignBudgetType === 'Daily' || existCampaignData.data?.budgetType === 'Daily') && (
                          <div>
                            <div>
                              {state.type === 'campaign' ? (
                                <>
                                  <Controller
                                    name={'dailyBudgetType'}
                                    control={CA_control}
                                    defaultValue={'Fixed'}
                                    render={({ field }) => (
                                      <AppRadioGroup
                                        inline
                                        data={dailyBudgetTypeList}
                                        value={field.value}
                                        onChange={(value) => {
                                          field.onChange(value);
                                          if (value === 'Fixed') {
                                            dailyCustomBudgetList.map((daily: { key: string }) => {
                                              CA_clearErrors(`dailyCustomBudget.${daily.key}`);
                                            });
                                          } else {
                                            CA_clearErrors('dailyFixedBudget');
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </>
                              ) : (
                                <AppTypography.Text className={'text'}>
                                  {
                                    dailyBudgetTypeList.find((t) => t.value === existCampaignData.data?.dailyBudgetType)
                                      ?.label
                                  }
                                </AppTypography.Text>
                              )}
                            </div>

                            {/* 일 예산이 Fixed 이라면  */}
                            {(watchCampaignDailyBudgetType === 'Fixed' ||
                              existCampaignData.data?.dailyBudgetType === 'Fixed') &&
                              (state.type === 'campaign' ? (
                                <div style={{ marginTop: 10 }}>
                                  <Controller
                                    name={'dailyFixedBudget'}
                                    control={CA_control}
                                    defaultValue={''}
                                    render={({ field }) => (
                                      <>
                                        <AppInputCount
                                          className={clsx({ 'input-error': _.get(CA_errors, 'dailyFixedBudget') })}
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
                                    errors={CA_errors}
                                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                                  />
                                </div>
                              ) : (
                                <AppTypography.Text className={'text'}>
                                  {`₩ ${numberWithCommas(existCampaignData.data?.dailyFixedBudget)}`}
                                </AppTypography.Text>
                              ))}
                            {/* 일 예산이 Custom 이라면 */}
                            {(watchCampaignDailyBudgetType === 'Custom' ||
                              existCampaignData.data?.dailyBudgetType === 'Custom') && (
                              <div>
                                {dailyCustomBudgetList.map((item, idx) => {
                                  return state.type === 'campaign' ? (
                                    <Fragment key={idx}>
                                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                                        <span style={{ fontWeight: 'bold', marginRight: 10 }}>{item.title}</span>

                                        <Controller
                                          name={`dailyCustomBudget.${item.key}`}
                                          control={CA_control}
                                          defaultValue={''}
                                          render={({ field }) => (
                                            <AppInputCount
                                              className={clsx({
                                                'input-error': _.get(CA_errors, `dailyCustomBudget.${item.key}`),
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
                                        errors={CA_errors}
                                        render={({ message }) => (
                                          <AppErrorMessage style={{ marginLeft: 20 }}>{message}</AppErrorMessage>
                                        )}
                                      />
                                    </Fragment>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }} key={idx}>
                                      <span style={{ fontWeight: 'bold', marginRight: 10 }}>{item.title}</span>
                                      <AppTypography.Text className={'text'}>
                                        {`₩ ${numberWithCommas(existCampaignData.data?.dailyCustomBudget[item.key])}`}
                                      </AppTypography.Text>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {(watchCampaignBudgetType === 'Weekly' || existCampaignData.data?.budgetType === 'Weekly') &&
                          (state.type === 'campaign' ? (
                            <div style={{ marginTop: 10 }}>
                              <div>
                                <Controller
                                  name={'weeklyBudget'}
                                  control={CA_control}
                                  defaultValue={''}
                                  rules={{
                                    required: '금액을 입력하세요.',
                                  }}
                                  render={({ field }) => (
                                    <>
                                      <AppInputCount
                                        className={clsx({ 'input-error': _.get(CA_errors, 'weeklyBudget') })}
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
                                />
                              </div>
                              <ErrorMessage
                                name={`weeklyBudget`}
                                errors={CA_errors}
                                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                              />
                            </div>
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {`₩ ${numberWithCommas(existCampaignData.data?.weeklyBudget)}`}
                            </AppTypography.Text>
                          ))}
                      </div>
                    </div>

                    {/* 기간 */}
                    <div className={'inner__wrapper'}>
                      <div className={'inner__label'}>
                        <AppTypography.Label isRequired className={'text'}>
                          기간
                        </AppTypography.Label>
                      </div>
                      <div className={'inner__content'}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {state.type === 'campaign' ? (
                            <Controller
                              name={'scheduleStartDate'}
                              control={CA_control}
                              defaultValue={dayjs().toDate()}
                              render={({ field }) => (
                                <AppDatePicker
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
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {dayjs(existCampaignData.data?.scheduleStartDate).format('YYYY-MM-DD')}
                            </AppTypography.Text>
                          )}

                          <AppTypography.Text className={'text'} style={{ margin: '0 10px' }}>
                            ~
                          </AppTypography.Text>
                          {state.type === 'campaign' ? (
                            <>
                              <Controller
                                name={'scheduleEndDate'}
                                control={CA_control}
                                defaultValue={dayjs().toDate()}
                                render={({ field }) => (
                                  <AppDatePicker
                                    disabled={watchCampaignIsEndDateLimit}
                                    className={clsx({ 'input-error': _.get(CA_errors, 'scheduleEndDate') })}
                                    cleanable={false}
                                    style={{ width: 200 }}
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    disabledDate={(date?: Date) => {
                                      return dayjs(date).isBefore(CA_getValues('scheduleStartDate'), 'date');
                                    }}
                                  />
                                )}
                                rules={{
                                  validate: {
                                    afterStartDate: (v) => {
                                      return CA_getValues('isEndDateLimit') ||
                                        dayjs(v).isSame(CA_getValues('scheduleStartDate'), 'date') ||
                                        dayjs(v).isAfter(CA_getValues('scheduleStartDate'), 'date')
                                        ? true
                                        : '종료일은 시작일보다 미래일자로 설정하세요.';
                                    },
                                  },
                                }}
                              />
                              <Controller
                                name={'isEndDateLimit'}
                                control={CA_control}
                                defaultValue={true}
                                render={({ field }) => (
                                  <Checkbox
                                    checked={field.value}
                                    onChange={(value, checked) => field.onChange(checked)}
                                  >
                                    종료일 없음
                                  </Checkbox>
                                )}
                              />
                            </>
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {existCampaignData.data?.isEndDateLimit
                                ? '종료일 없음'
                                : dayjs(existCampaignData.data?.scheduleEndDate).format('YYYY-MM-DD')}
                            </AppTypography.Text>
                          )}
                        </div>
                        <ErrorMessage
                          name={`scheduleEndDate`}
                          errors={CA_errors}
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
              {/* 트래킹 링크 */}
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    트래킹 링크
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  {state.type === 'campaign' ? (
                    <>
                      <Controller
                        name={'trackingLinkID'}
                        control={CA_control}
                        defaultValue={''}
                        rules={{ required: '트래킹 링크를 선택하세요.' }}
                        render={({ field }) => (
                          <AppSelectPicker
                            className={clsx({ 'input-error': _.get(CA_errors, 'trackingLinkID') })}
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
                        errors={CA_errors}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </>
                  ) : (
                    <AppTypography.Text className={'text'}>
                      {
                        fetchTrackingLinkList.data?.find(
                          (t: { id: string }) => t.id === existCampaignData.data?.trackingLinkID
                        )?.title
                      }
                    </AppTypography.Text>
                  )}
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
                    {(watchCampaignType === 'User_Acquisition' ||
                      existCampaignData.data?.campaignType === 'User_Acquisition') && (
                      <div className={'inner__wrapper'}>
                        <div className="inner__label">
                          <AppTypography.Label isRequired style={{ display: 'inline-block' }} className={'text'}>
                            LAT Targeting
                          </AppTypography.Label>
                          <InfoTooltip
                            inner={
                              'LAT(Limit Ad Tracking) 약자로, 디바이스에서 광고 ID(ADID) 수집여부에 따른 타겟팅을 설정하는 기능입니다.'
                            }
                          />
                        </div>
                        <div className={'inner__content'}>
                          {state.type === 'campaign' ? (
                            <Controller
                              name={'adTrackingAllowance'}
                              control={CA_control}
                              defaultValue={['LAT_ONLY', 'NON_LAT_ONLY']}
                              render={({ field }) => {
                                return (
                                  <AppCheckbox
                                    inline
                                    data={LAT_TargetingList.map((item) => ({
                                      ...item,
                                      disabled:
                                        CA_getValues('adTrackingAllowance')?.length === 1 &&
                                        CA_getValues('adTrackingAllowance')[0] === item.value,
                                    }))}
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                  />
                                );
                              }}
                            />
                          ) : (
                            <AppTypography.Text className={'text'}>
                              {LAT_TargetingList.filter((item) =>
                                existCampaignData.data?.adTrackingAllowance.includes(item.value)
                              )
                                .map((item) => item.label)
                                .join(', ')}
                            </AppTypography.Text>
                          )}
                        </div>
                      </div>
                    )}
                    <div className={'inner__wrapper'}>
                      <div className="inner__label">
                        <AppTypography.Label style={{ display: 'inline-block' }} className={'text'}>
                          Conversion 설정
                        </AppTypography.Label>
                        <InfoTooltip inner={'선택한 이벤트는 보고서에서 Conversion 지표로 확인할 수 있습니다.'} />
                      </div>
                      <div className="inner__content">
                        {state.type === 'campaign' ? (
                          <Controller
                            name={'KPIActions'}
                            control={CA_control}
                            defaultValue={[]}
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
                        ) : (
                          <AppTypography.Text className={'text'}>
                            {existCampaignData.data?.KPIActions?.join(', ')}
                          </AppTypography.Text>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 광고 그룹 */}
        {currentStep === 1 && <AdGroupForm adgroupForm={adgroupForm} />}
      </div>
      <FinalActionDivider />
      <AppPageFooter
        extra={
          currentStep === 1 ? (
            <AppButton style={{ width: 138 }} theme={'gray'} size={'lg'} onClick={() => setCurrentStep(0)}>
              이전단계
            </AppButton>
          ) : undefined
        }
      >
        <AppButton
          size={'lg'}
          style={{ width: 138 }}
          onClick={() => {
            setCancelModalOpen(true);
            setOnOk(() => () => {
              navigate('/campaigns/campaign');
            });
          }}
        >
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={
            currentStep === 0 ? CA_handleSubmit(onCampaignSubmit) : adgroupForm.handleSubmit(adGroupSubmitConfirm)
          }
        >
          {currentStep === 0 ? '다음' : '생성'}
        </AppButton>
      </AppPageFooter>

      <ConfirmModal
        open={open}
        size={'xs'}
        onClose={() => {
          setCancelModalOpen(false);
        }}
        onOk={() => {
          setCancelModalOpen(false);
          onOk();
        }}
        okText={'확인'}
        title={'캠페인 생성 취소'}
        content={
          <>
            <AppTypography.Text>입력한 정보는 저장되지 않습니다.</AppTypography.Text>
            <AppTypography.Text>캠페인 생성을 취소하시겠습니까?</AppTypography.Text>
          </>
        }
      />
      <ConfirmModal
        open={openCreateConfirm}
        onClose={() => {
          setOpenCreateConfirm(false);
        }}
        onOk={() => {
          setOpenCreateConfirm(false);
          onAdGroupSubmit();
        }}
        okText={'생성'}
        content={
          <>
            <AppTypography.Text>실 정산금액은 광고예산과 상이할 수 있습니다.</AppTypography.Text>
            <AppTypography.Text>실 정산금액은 익월 '정산내역' 화면에서 확인 가능합니다.</AppTypography.Text>
            <AppTypography.Text>캠페인을 생성합니다.</AppTypography.Text>
          </>
        }
        title={'확인'}
      />
    </StyledCampaignCreate>
  );
};

export default CampaignCreate;

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

// 여기에는 캠페인만 또는 광고그룹만 가능하다.
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
