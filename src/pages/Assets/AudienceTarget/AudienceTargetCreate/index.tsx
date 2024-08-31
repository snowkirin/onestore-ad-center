import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import { Checkbox, Radio, RadioGroup } from 'rsuite';

import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { AppInputCount } from '@components/AppInput';
import AppTags from '@/components/AppTags';
import { AppButton } from '@components/AppButton';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import JSON_LANGUAGE from '@utils/json/language.json';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getAppEventSummary, getProductList } from '@apis/product.api';
import { getCustomerFile } from '@apis/customer_file.api';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import _, { debounce } from 'lodash';
import AppRadioGroup from '@components/AppRadio';
import { API_GRAPHQL } from '@apis/request';
import {
  LocationTags,
  StyledAudienceTarget,
  StyledChainRadio,
  StyledItems,
} from '@pages/Assets/AudienceTarget/AudienceTargetComponent';
import update from 'immutability-helper';
import ICON_ADD_GRAY from '@assets/images/addIcons/plus-gray.svg';
import ICON_REMOVE_GRAY from '@assets/images/addIcons/multiplication-gray.svg';
import ANDROID_JSON from '@utils/json/android.json';
import IOS_JSON from '@utils/json/ios.json';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { createAudienceTarget } from '@apis/audience_target.api';
import AppPageFooter from '@components/AppPageFooter';
import AlertModal from '@components/AppModal/AlretModal';

interface AudienceTargetCreateProps {}

const initAppList = {
  product_id: '',
  event: '',
  amount: '',
  error: false,
};

const AudienceTargetCreate: React.FC<AudienceTargetCreateProps> = () => {
  const navigate = useNavigate();
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const watchIncludeUserList = watch('include.user_list', []);
  const watchExcludeUserList = watch('exclude.user_list', []);
  const watchAllowedLanguages = watch('allowed_languages', []);
  const watchBlockedLanguages = watch('blocked_languages', []);
  const watchOses = watch('oses', '');
  const watchLocation = watch('location', []);
  const watchAndroidCheck = watch('android.checked', true);
  const watchIosCheck = watch('ios.checked', true);
  const watchAndroidVersion = watch('android.version', '');
  const watchIosVersion = watch('ios.version', '');

  const [includeAppList, setIncludeAppList] = useState([
    {
      product_id: '',
      event: '',
      amount: '',
      error: false,
    },
  ]);
  const [excludeAppList, setExcludeAppList] = useState([
    {
      product_id: '',
      event: '',
      amount: '',
      error: false,
    },
  ]);
  const [locationResult, setLocationResult] = useState([]);
  const [osesChecked, setOsesChecked] = useState({
    android: true,
    ios: true,
  });

  const [isOpenAlertModal, setIsOpenAlertModal] = useState(false);

  // Product List
  const fetchProductList = useQuery(
    ['fetchProductList'],
    async () => {
      const { data } = await getProductList({ ad_account_id: selectedAdAccount });
      if (data.products && data.products.length !== 0) {
        return data.products;
      } else {
        return [];
      }
    },
    { enabled: !_.isEmpty(selectedAdAccount) }
  );
  // Customer Set
  const fetchCustomerSetList = useQuery(
    ['fetchCustomerSetList'],
    async () => {
      const { data } = await getCustomerFile({ ad_account_id: selectedAdAccount });
      if (data.customer_sets && data.customer_sets.length !== 0) {
        return data.customer_sets;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  // 앱 리스트 가져온후 모든 앱 아이디로 한번에 호출.

  const fetchAppEventSummary = useQueries({
    queries:
      fetchProductList.data?.map((item: any) => {
        return {
          queryKey: ['fetchAppEventSummary', item.id],
          queryFn: async () => {
            const { data } = await getAppEventSummary(item.id, { 'condition.time_window': 'TIME_WINDOW_D30' });
            if (data.postback_integration_event_summary) {
              return {
                ...data.postback_integration_event_summary,
                product_id: item.id,
              };
            } else {
              return {};
            }
          },
          enabled: !_.isEmpty(fetchProductList.data),
        };
      }) || [],
  });

  const handleAppListAdd = (type: string) => {
    if (type === 'include') {
      const tmp = update(includeAppList, { $push: [initAppList] });
      setIncludeAppList([...tmp]);
    } else {
      const tmp = update(excludeAppList, { $push: [initAppList] });
      setExcludeAppList([...tmp]);
    }
  };
  const handleAppListRemove = (type: string, idx: number) => {
    if (type === 'include') {
      const tmp = update(includeAppList, { $splice: [[idx, 1]] });
      setIncludeAppList([...tmp]);
    } else {
      const tmp = update(excludeAppList, { $splice: [[idx, 1]] });
      setExcludeAppList([...tmp]);
    }
  };
  const handleDeleteValueClick = (dataKey: any, selectedData: any) => {
    let temp = getValues(dataKey);

    temp = _.filter(temp, (item) => {
      return item !== selectedData;
    });
    setValue(dataKey, temp);
  };
  const handleLocationRemove = (dataKey: any, selectedData: any) => {
    let temp = getValues(dataKey);
    temp = _.filter(temp, (item) => {
      return item !== selectedData;
    });
    setValue(dataKey, temp);
  };
  const onSubmit = (data: any) => {
    /*에러체크 */
    if (_.every(includeAppList, (item) => item.error)) {
      return false;
    }
    if (_.every(excludeAppList, (item) => item.error)) {
      return false;
    }

    const includeAppListMap = _.chain(includeAppList)
      .filter((item) => {
        return !_.isEmpty(item.product_id) && !_.isEmpty(item.event) && !_.isEmpty(item.amount);
      })
      .map((item) => {
        return {
          product_id: item.product_id,
          event: item.event,
          sliding_window_duration: {
            amount: item.amount,
            unit: 'DAY',
          },
        };
      })
      .value();

    const excludeAppListMap = _.chain(excludeAppList)
      .filter((item) => {
        return !_.isEmpty(item.product_id) && !_.isEmpty(item.event) && !_.isEmpty(item.amount);
      })
      .map((item) => {
        return {
          product_id: item.product_id,
          event: item.event,
          sliding_window_duration: {
            amount: item.amount,
            unit: 'DAY',
          },
        };
      })
      .value();

    // 단 하나의 입력값도 없을 경우
    if (
      _.isEmpty(includeAppListMap) &&
      _.isEmpty(excludeAppListMap) &&
      _.isEmpty(data.include.user_list) &&
      _.isEmpty(data.exclude.user_list) &&
      _.isEmpty(data.allowed_languages) &&
      _.isEmpty(data.blocked_languages) &&
      _.isEmpty(data.location) &&
      data.oses === 'ALL'
    ) {
      setIsOpenAlertModal(true);
      return false;
    }

    const payload = {
      title: data.title,
      targeting_condition: {
        custom_audience_set: {
          include_having_all: {
            ...(data.include_type === 'All' && {
              app_events: includeAppListMap,
              user_lists: data.include.user_list,
            }),
          },
          include_having_any: {
            ...(data.include_type === 'Any' && {
              app_events: includeAppListMap,
              user_lists: data.include.user_list,
            }),
          },
          exclude_having_all: {
            ...(data.exclude_type === 'All' && {
              app_events: excludeAppListMap,
              user_lists: data.exclude.user_list,
            }),
          },
          exclude_having_any: {
            ...(data.exclude_type === 'Any' && {
              app_events: excludeAppListMap,
              user_lists: data.exclude.user_list,
            }),
          },
        },
        allowed_languages: data.allowed_languages,
        blocked_languages: data.blocked_languages,
        ...(data.location.length !== 0 && {
          allowed_location_set: {
            osm_ids: data.location,
            zipcodes: [],
          },
        }),
        device_oses:
          data.oses === 'ALL'
            ? []
            : [
                ...(data.android.checked
                  ? [
                      {
                        os: 'ANDROID',
                        ...(data.android.version !== 'ALL' && {
                          min_version: data.android.min,
                          ...(data.android.max !== 'LATEST' && { max_version: data.android.max }),
                        }),
                      },
                    ]
                  : []),

                ...(data.ios.checked
                  ? [
                      {
                        os: 'IOS',
                        ...(data.ios.version !== 'ALL' && {
                          min_version: data.ios.min,
                          ...(data.ios.max !== 'LATEST' && { max_version: data.ios.max }),
                        }),
                      },
                    ]
                  : []),
              ],
        connection_types: [...(data.network ? ['WIFI'] : [])],
      },
    };
    createAudienceTarget({
      queryParams: {
        ad_account_id: selectedAdAccount,
      },
      payload,
    })
      .then(() => {
        navigate('/assets/audience-target');
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  const filteredAppEventSummary = useMemo(() => {
    if (fetchAppEventSummary.some((result) => result.isLoading)) {
      return {
        data: [],
        isLoading: true,
      };
    } else {
      return {
        data: fetchAppEventSummary.map((result: any) => result.data),
        isLoading: false,
      };
    }
  }, [fetchAppEventSummary]);

  const handleLocationSearch = useCallback(
    debounce(async (params) => {
      try {
        const response = await API_GRAPHQL.post('', {
          query:
            '\n  query LocationSearch($request: LocationSearchRequest!) {\n    locationSearch(request: $request) {\n      locations {\n        locationCode\n        locationName\n        division\n      }\n      nextCursor\n      isFirstPage\n    }\n  }\n',
          variables: {
            request: {
              searchValue: params,
              options: {
                pageSize: 500,
                sort: 'DIVISION',
              },
            },
          },
        });
        setLocationResult(response.data.data.locationSearch.locations);
      } catch (e) {
        setLocationResult([]);
      }
    }, 500),
    []
  );

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <StyledAudienceTarget>
      <AppPageHeader title={'맞춤 타겟 생성'} />
      <div style={{ padding: '16px 30px 0 30px' }}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              광고계정명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              맞춤 타겟명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              control={control}
              defaultValue={''}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={255}
                    placeholder={'입력해 주세요.'}
                    value={field.value}
                    style={{ width: 450 }}
                    onChange={(value) => field.onChange(value)}
                  />
                );
              }}
              rules={{
                required: '맞춤 타겟명을 입력하세요.',
              }}
            />
            <ErrorMessage
              name={'title'}
              errors={errors}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <AppDivider />
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>오디언스</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <div className={'inner'}>
              <div className={'inner__title'}>
                <AppTypography.Label className={'text'}>커스텀 오디언스</AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <StyledItems isMultiple>
                  <div className="item item--depth1">
                    <div className="cell">
                      <AppTypography.Label className={'text'}>포함</AppTypography.Label>
                      {includeAppList.map((item, idx) => {
                        return (
                          <div className="item item--depth2" key={idx}>
                            {idx === 0 && includeAppList.length !== 5 && (
                              <img
                                className={'custom-audience__btn'}
                                src={ICON_ADD_GRAY}
                                onClick={() => handleAppListAdd('include')}
                                alt={'추가'}
                              />
                            )}
                            {idx !== 0 && (
                              <img
                                className={'custom-audience__btn'}
                                src={ICON_REMOVE_GRAY}
                                onClick={() => handleAppListRemove('include', idx)}
                                alt={'삭제'}
                              />
                            )}
                            <div className={'cell'}>
                              <AppTypography.Label className={'text'}>앱</AppTypography.Label>
                              <div>
                                <AppSelectPicker
                                  cleanable={true}
                                  searchable={true}
                                  labelKey={'title'}
                                  valueKey={'id'}
                                  block
                                  data={fetchProductList.data}
                                  placeholder={'앱을 선택하세요.'}
                                  value={includeAppList[idx].product_id}
                                  onChange={(value) => {
                                    const selectedValue = value || '';
                                    const errorCheck = !(
                                      _.isEmpty(selectedValue) == _.isEmpty(includeAppList[idx].event) &&
                                      _.isEmpty(includeAppList[idx].amount) == _.isEmpty(selectedValue)
                                    );
                                    const newTmp = update(includeAppList, {
                                      [idx]: {
                                        product_id: { $set: selectedValue },
                                        event: { $set: _.isEmpty(selectedValue) ? '' : includeAppList[idx].event },
                                        amount: { $set: _.isEmpty(selectedValue) ? '' : includeAppList[idx].amount },
                                        error: { $set: _.isEmpty(selectedValue) ? false : errorCheck },
                                      },
                                    });
                                    setIncludeAppList([...newTmp]);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="cell">
                              <AppTypography.Label className={'text'}>앱 이벤트</AppTypography.Label>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 350 }}>
                                  <AppSelectPicker
                                    placeholder={'앱 이벤트를 선택하세요'}
                                    block
                                    cleanable={true}
                                    searchable={false}
                                    disabled={
                                      filteredAppEventSummary.data.length === 0 ||
                                      filteredAppEventSummary.isLoading ||
                                      includeAppList[idx].product_id === ''
                                    }
                                    data={
                                      filteredAppEventSummary.data.length !== 0 &&
                                      !filteredAppEventSummary.isLoading &&
                                      includeAppList[idx].product_id !== ''
                                        ? _.filter(
                                            filteredAppEventSummary.data,
                                            (item) => item.product_id === includeAppList[idx].product_id
                                          )[0]?.summary
                                        : []
                                    }
                                    labelKey={'event_name'}
                                    valueKey={'event_name'}
                                    value={includeAppList[idx].event}
                                    onChange={(value) => {
                                      const selectedValue = value || '';
                                      const errorCheck = !(
                                        _.isEmpty(selectedValue) == _.isEmpty(includeAppList[idx].product_id) &&
                                        _.isEmpty(includeAppList[idx].amount) == _.isEmpty(selectedValue)
                                      );
                                      const newTmp = update(includeAppList, {
                                        [idx]: {
                                          event: { $set: selectedValue },
                                          amount: { $set: _.isEmpty(selectedValue) ? '' : includeAppList[idx].amount },
                                          error: { $set: errorCheck },
                                        },
                                      });
                                      setIncludeAppList([...newTmp]);
                                    }}
                                  />
                                </div>
                                <div style={{ width: 100, marginLeft: 15 }}>
                                  <AppInputCount
                                    isNumber
                                    maxLength={3}
                                    disabled={includeAppList[idx].event === ''}
                                    value={includeAppList[idx].amount}
                                    onChange={(value) => {
                                      const errorCheck = !(
                                        _.isEmpty(value) == _.isEmpty(includeAppList[idx].product_id) &&
                                        _.isEmpty(includeAppList[idx].event) == _.isEmpty(value)
                                      );
                                      const newTmp = update(includeAppList, {
                                        [idx]: { amount: { $set: value }, error: { $set: errorCheck } },
                                      });
                                      setIncludeAppList([...newTmp]);
                                    }}
                                  />
                                </div>
                                <div style={{ marginLeft: 10 }}>
                                  <span>일 이내</span>
                                </div>
                              </div>
                            </div>
                            {item.error && <AppErrorMessage>모든값을 채워야합니다</AppErrorMessage>}
                          </div>
                        );
                      })}
                    </div>
                    <StyledChainRadio>
                      <Controller
                        name={'include_type'}
                        control={control}
                        defaultValue={'Any'}
                        render={({ field }) => (
                          <AppRadioGroup
                            inline
                            data={[
                              {
                                label: '둘 중 하나라도 만족',
                                value: 'Any',
                              },
                              {
                                label: '둘 다 만족',
                                value: 'All',
                              },
                            ]}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
                        )}
                      />
                    </StyledChainRadio>
                    <div className="item item--depth2">
                      <div className={'cell'}>
                        <AppTypography.Label className={'text'}>고객파일</AppTypography.Label>
                        <div>
                          <Controller
                            name={'include.user_list'}
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                              <AppCheckPicker
                                cleanable={false}
                                searchable={false}
                                menuMaxHeight={180}
                                block
                                data={fetchCustomerSetList.data || []}
                                placeholder={'고객 파일을 선택하세요.'}
                                labelKey={'title'}
                                valueKey={'id'}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                renderValue={() => {
                                  return <span style={{ color: 'var(--border-line)' }}>고객 파일을 선택하세요.</span>;
                                }}
                              />
                            )}
                          />
                          {watchIncludeUserList.length !== 0 && (
                            <AppTags
                              selectedData={watchIncludeUserList}
                              data={fetchCustomerSetList.data}
                              dataKey={'include.user_list'}
                              labelKey={'title'}
                              valueKey={'id'}
                              onRemove={handleDeleteValueClick}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="item item--depth1">
                    <div className="cell">
                      <AppTypography.Label className={'text'}>제외</AppTypography.Label>
                      {excludeAppList.map((item, idx) => {
                        return (
                          <div className="item item--depth2" key={idx}>
                            {idx === 0 && excludeAppList.length !== 5 && (
                              <img
                                className={'custom-audience__btn'}
                                src={ICON_ADD_GRAY}
                                onClick={() => handleAppListAdd('exclude')}
                                alt={'추가'}
                              />
                            )}
                            {idx !== 0 && (
                              <img
                                className={'custom-audience__btn'}
                                src={ICON_REMOVE_GRAY}
                                onClick={() => handleAppListRemove('exclude', idx)}
                                alt={'삭제'}
                              />
                            )}
                            <div className={'cell'}>
                              <AppTypography.Label className={'text'}>앱</AppTypography.Label>
                              <div>
                                <AppSelectPicker
                                  cleanable={true}
                                  searchable={true}
                                  labelKey={'title'}
                                  valueKey={'id'}
                                  block
                                  data={fetchProductList.data}
                                  placeholder={'앱을 선택하세요.'}
                                  value={excludeAppList[idx].product_id}
                                  onChange={(value) => {
                                    const selectedValue = value || '';
                                    const errorCheck = !(
                                      _.isEmpty(selectedValue) == _.isEmpty(excludeAppList[idx].event) &&
                                      _.isEmpty(excludeAppList[idx].amount) == _.isEmpty(selectedValue)
                                    );
                                    const newTmp = update(excludeAppList, {
                                      [idx]: {
                                        product_id: { $set: selectedValue },
                                        event: { $set: _.isEmpty(selectedValue) ? '' : includeAppList[idx].event },
                                        amount: { $set: _.isEmpty(selectedValue) ? '' : includeAppList[idx].amount },
                                        error: { $set: _.isEmpty(selectedValue) ? false : errorCheck },
                                      },
                                    });
                                    setExcludeAppList([...newTmp]);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="cell">
                              <AppTypography.Label className={'mb-6'}>앱 이벤트</AppTypography.Label>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: 350 }}>
                                  <AppSelectPicker
                                    cleanable={true}
                                    searchable={true}
                                    placeholder={'앱 이벤트를 선택하세요'}
                                    block
                                    disabled={
                                      filteredAppEventSummary.data.length === 0 ||
                                      filteredAppEventSummary.isLoading ||
                                      excludeAppList[idx].product_id === ''
                                    }
                                    data={
                                      filteredAppEventSummary.data.length !== 0 &&
                                      !filteredAppEventSummary.isLoading &&
                                      excludeAppList[idx].product_id !== ''
                                        ? _.filter(
                                            filteredAppEventSummary.data,
                                            (item) => item.product_id === excludeAppList[idx].product_id
                                          )[0]?.summary
                                        : []
                                    }
                                    labelKey={'event_name'}
                                    valueKey={'event_name'}
                                    value={excludeAppList[idx].event}
                                    onChange={(value) => {
                                      const selectedValue = value || '';
                                      const errorCheck = !(
                                        _.isEmpty(selectedValue) == _.isEmpty(excludeAppList[idx].product_id) &&
                                        _.isEmpty(excludeAppList[idx].amount) == _.isEmpty(selectedValue)
                                      );
                                      const newTmp = update(excludeAppList, {
                                        [idx]: {
                                          event: { $set: selectedValue },
                                          amount: { $set: _.isEmpty(selectedValue) ? '' : excludeAppList[idx].amount },
                                          error: { $set: errorCheck },
                                        },
                                      });
                                      setExcludeAppList([...newTmp]);
                                    }}
                                  />
                                </div>
                                <div style={{ width: 100, marginLeft: 15 }}>
                                  <AppInputCount
                                    isNumber
                                    maxLength={3}
                                    disabled={excludeAppList[idx].event === ''}
                                    value={excludeAppList[idx].amount}
                                    onChange={(value) => {
                                      const errorCheck = !(
                                        _.isEmpty(value) == _.isEmpty(excludeAppList[idx].product_id) &&
                                        _.isEmpty(excludeAppList[idx].event) == _.isEmpty(value)
                                      );
                                      const newTmp = update(excludeAppList, {
                                        [idx]: { amount: { $set: value }, error: { $set: errorCheck } },
                                      });
                                      setExcludeAppList([...newTmp]);
                                    }}
                                  />
                                </div>
                                <div style={{ marginLeft: 10 }}>
                                  <AppTypography.Text>일 이내</AppTypography.Text>
                                </div>
                              </div>
                            </div>
                            {item.error && <AppErrorMessage>모든값을 채워야합니다</AppErrorMessage>}
                          </div>
                        );
                      })}
                    </div>
                    <StyledChainRadio>
                      <Controller
                        name={'exclude_type'}
                        control={control}
                        defaultValue={'Any'}
                        render={({ field }) => (
                          <AppRadioGroup
                            inline
                            data={[
                              {
                                label: '둘 중 하나라도 만족',
                                value: 'Any',
                              },
                              {
                                label: '둘 다 만족',
                                value: 'All',
                              },
                            ]}
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                          />
                        )}
                      />
                    </StyledChainRadio>
                    <div className="item item--depth2">
                      <div className={'cell'}>
                        <AppTypography.Label className={'text'}>고객파일</AppTypography.Label>
                        <div>
                          <Controller
                            name={'exclude.user_list'}
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                              <AppCheckPicker
                                cleanable={false}
                                searchable={false}
                                menuMaxHeight={180}
                                block
                                data={fetchCustomerSetList.data || []}
                                placeholder={'고객 파일을 선택하세요.'}
                                labelKey={'title'}
                                valueKey={'id'}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                renderValue={() => {
                                  return <span style={{ color: 'var(--border-line)' }}>고객 파일을 선택하세요.</span>;
                                }}
                              />
                            )}
                          />
                          {watchExcludeUserList.length !== 0 && (
                            <AppTags
                              selectedData={watchExcludeUserList}
                              data={fetchCustomerSetList.data}
                              dataKey={'exclude.user_list'}
                              labelKey={'title'}
                              valueKey={'id'}
                              onRemove={handleDeleteValueClick}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </StyledItems>
              </div>
            </div>
            <div className={'inner'}>
              <div className={'inner__title'}>
                <AppTypography.Label className={'text'}>언어</AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <StyledItems isMultiple>
                  <div className="item item--depth1">
                    <div className="cell">
                      <AppTypography.Label className={'text'}>포함</AppTypography.Label>
                      <div>
                        <Controller
                          name={'allowed_languages'}
                          control={control}
                          defaultValue={[]}
                          render={({ field }) => {
                            return (
                              <AppCheckPicker
                                block
                                cleanable={false}
                                data={JSON_LANGUAGE}
                                value={field.value}
                                disabledItemValues={[...watchBlockedLanguages]}
                                placeholder={'언어를 선택하세요.'}
                                onChange={(value) => field.onChange(value)}
                                renderValue={() => {
                                  return <span style={{ color: 'var(--border-line)' }}>언어를 선택하세요.</span>;
                                }}
                              />
                            );
                          }}
                        />
                        {watchAllowedLanguages.length !== 0 && (
                          <AppTags
                            selectedData={watchAllowedLanguages}
                            data={JSON_LANGUAGE}
                            dataKey={'allowed_languages'}
                            onRemove={handleDeleteValueClick}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="item item--depth1">
                    <AppTypography.Label className={'text'}>제외</AppTypography.Label>
                    <div>
                      <Controller
                        name={'blocked_languages'}
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => {
                          return (
                            <AppCheckPicker
                              block
                              cleanable={false}
                              data={JSON_LANGUAGE}
                              value={field.value}
                              disabledItemValues={[...watchAllowedLanguages]}
                              onChange={(value) => field.onChange(value)}
                              placeholder={'언어를 선택하세요.'}
                              renderValue={() => {
                                return <span style={{ color: 'var(--border-line)' }}>언어를 선택하세요.</span>;
                              }}
                            />
                          );
                        }}
                      />
                      {watchBlockedLanguages.length !== 0 && (
                        <AppTags
                          selectedData={watchBlockedLanguages}
                          data={JSON_LANGUAGE}
                          dataKey={'blocked_languages'}
                          onRemove={handleDeleteValueClick}
                        />
                      )}
                    </div>
                  </div>
                </StyledItems>
              </div>
            </div>
            <div className={'inner'}>
              <div className={'inner__title'}>
                <AppTypography.Label accepter={'span'} className={'text'}>
                  위치
                </AppTypography.Label>
                <AppTypography.Text
                  accepter={'span'}
                  className={'text'}
                  style={{
                    color: 'var(--orange)',
                    marginLeft: 20,
                  }}
                >
                  ※위치 정보는 대한민국, 미국만 제공됩니다.
                </AppTypography.Text>
              </div>
              <div className={'inner__content'}>
                <StyledItems>
                  <div className="item item--depth1">
                    <div className={'cell'}>
                      <AppTypography.Label className={'text'}>포함</AppTypography.Label>
                      <Controller
                        name={'location'}
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <AppSelectPicker
                            block
                            placeholder={'위치를 검색하세요.'}
                            onSearch={(value) => {
                              handleLocationSearch(value);
                            }}
                            onSelect={(value) => {
                              const fieldValue = field.value;
                              field.onChange([...fieldValue, value]);
                            }}
                            data={_.filter(locationResult, (item: any) => {
                              return (
                                !field.value.includes(item.locationCode) &&
                                (item.locationName.indexOf('United States') || item.locationName.indexOf('South Korea'))
                              );
                            })}
                            valueKey={'locationCode'}
                            labelKey={'locationName'}
                          />
                        )}
                      />
                      {watchLocation.length !== 0 && (
                        <LocationTags data={watchLocation} onRemove={handleLocationRemove} dataKey={'location'} />
                      )}
                    </div>
                  </div>
                </StyledItems>
              </div>
            </div>
          </div>
        </div>
        <AppDivider />
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>디바이스</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <div className={'inner'}>
              <div className={'inner__title'}>
                <AppTypography.Label className={'text'}>OS 및 버전</AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <div>
                  <Controller
                    name={'oses'}
                    control={control}
                    defaultValue={'ALL'}
                    render={({ field }) => {
                      return (
                        <RadioGroup inline value={field.value} onChange={(value) => field.onChange(value)}>
                          <Radio value={'ALL'}>모든 OS</Radio>
                          <Radio value={'CUSTOM'}>맞춤 설정</Radio>
                        </RadioGroup>
                      );
                    }}
                  />
                </div>
                {watchOses === 'CUSTOM' && (
                  <>
                    {/* Android */}
                    <div className={'mb-20'}>
                      <div style={{ marginLeft: 93 }}>
                        <Controller
                          name={'android.checked'}
                          control={control}
                          defaultValue={true}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              disabled={field.value === true && watchIosCheck === false}
                              onChange={(value, checked) => {
                                setOsesChecked((prevState) => ({
                                  ...prevState,
                                  android: checked,
                                }));
                                field.onChange(checked);
                              }}
                            >
                              Android
                            </Checkbox>
                          )}
                          rules={{
                            validate: {
                              checked: (v) => v !== false || watchIosCheck !== false || 'OS를 선택해주세요',
                            },
                          }}
                        />
                      </div>
                      {osesChecked.android && (
                        <div style={{ marginLeft: 93 }}>
                          <Controller
                            name={'android.version'}
                            control={control}
                            defaultValue={'ALL'}
                            render={({ field }) => (
                              <RadioGroup inline value={field.value} onChange={(value) => field.onChange(value)}>
                                <Radio value={'ALL'}>전체버전</Radio>
                                <Radio value={'PART'}>일부버전</Radio>
                              </RadioGroup>
                            )}
                          />
                        </div>
                      )}
                      {watchAndroidVersion === 'PART' && (
                        <div style={{ marginLeft: 93 }}>
                          <div>
                            <span>From</span>
                            <Controller
                              name={'android.min'}
                              control={control}
                              defaultValue={'2.0.0'}
                              render={({ field }) => (
                                <AppSelectPicker
                                  searchable={false}
                                  cleanable={false}
                                  style={{ marginLeft: 5, marginRight: 5, width: 200 }}
                                  data={_.filter(ANDROID_JSON, (item) => item.value !== 'LATEST')}
                                  onChange={(value) => field.onChange(value)}
                                  value={field.value}
                                />
                              )}
                            />
                            <span>To</span>
                            <Controller
                              name={'android.max'}
                              control={control}
                              defaultValue={'LATEST'}
                              render={({ field }) => (
                                <AppSelectPicker
                                  searchable={false}
                                  cleanable={false}
                                  style={{ marginLeft: 5, width: 200 }}
                                  data={_.filter(ANDROID_JSON, (item) => item.value !== '2.0.0')}
                                  onChange={(value) => field.onChange(value)}
                                  value={field.value}
                                />
                              )}
                            />
                          </div>
                          {_.has(errors, 'android.min') ||
                            (_.has(errors, 'android.max') && <AppErrorMessage>버전을 선택해주세요</AppErrorMessage>)}
                        </div>
                      )}
                    </div>
                    {/* iOS */}
                    <div>
                      <div style={{ marginLeft: 93 }}>
                        <Controller
                          name={'ios.checked'}
                          control={control}
                          defaultValue={true}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              disabled={field.value === true && watchAndroidCheck === false}
                              onChange={(value, checked) => {
                                setOsesChecked((prevState) => ({
                                  ...prevState,
                                  ios: checked,
                                }));
                                field.onChange(checked);
                              }}
                            >
                              iOS
                            </Checkbox>
                          )}
                          rules={{
                            validate: {
                              checked: (v) => v !== false || watchAndroidCheck !== false || 'OS를 선택해주세요',
                            },
                          }}
                        />
                      </div>
                      {osesChecked.ios && (
                        <div style={{ marginLeft: 93 }}>
                          <Controller
                            name={'ios.version'}
                            control={control}
                            defaultValue={'ALL'}
                            render={({ field }) => (
                              <RadioGroup inline value={field.value} onChange={(value) => field.onChange(value)}>
                                <Radio value={'ALL'}>전체버전</Radio>
                                <Radio value={'PART'}>일부버전</Radio>
                              </RadioGroup>
                            )}
                          />
                        </div>
                      )}
                      {watchIosVersion === 'PART' && (
                        <div style={{ marginLeft: 93 }}>
                          <div>
                            <span>From</span>
                            <Controller
                              name={'ios.min'}
                              control={control}
                              defaultValue={'2.0.0'}
                              render={({ field }) => (
                                <AppSelectPicker
                                  style={{ marginLeft: 5, marginRight: 5, width: 200 }}
                                  searchable={false}
                                  cleanable={false}
                                  data={_.filter(IOS_JSON, (item) => item.value !== 'LATEST')}
                                  onChange={(value) => field.onChange(value)}
                                  value={field.value}
                                />
                              )}
                              rules={{ required: '버전을 선택해주세요' }}
                            />
                            <span>To</span>

                            <Controller
                              name={'ios.max'}
                              control={control}
                              defaultValue={'LATEST'}
                              render={({ field }) => (
                                <AppSelectPicker
                                  style={{ marginLeft: 5, width: 200 }}
                                  searchable={false}
                                  cleanable={false}
                                  data={_.filter(IOS_JSON, (item) => item.value !== '2.0.0')}
                                  onChange={(value) => field.onChange(value)}
                                  value={field.value}
                                />
                              )}
                              rules={{ required: '버전을 선택해주세요' }}
                            />
                          </div>
                          {_.has(errors, 'ios.checked') ||
                            (_.has(errors, 'android.checked') && <AppErrorMessage>OS를 선택해주세요.</AppErrorMessage>)}
                          {_.has(errors, 'ios.min') ||
                            (_.has(errors, 'ios.max') && <AppErrorMessage>버전을 선택해주세요.</AppErrorMessage>)}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={'inner'}>
              <div className={'inner__title'}>
                <AppTypography.Label className={'text'}>네트워크</AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <Controller
                  name={'network'}
                  control={control}
                  defaultValue={false}
                  render={({ field }) => {
                    return (
                      <Checkbox checked={field.value} onChange={(value, checked) => field.onChange(checked)}>
                        와이파이만 포함
                      </Checkbox>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/audience-target')}>
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ color: 'white', width: 138, marginLeft: 15 }}
          onClick={handleSubmit(onSubmit)}
        >
          생성
        </AppButton>
      </AppPageFooter>

      <AlertModal
        open={isOpenAlertModal}
        onOk={() => setIsOpenAlertModal(false)}
        content={<AppTypography.Text>타겟팅 조건을 설정하세요</AppTypography.Text>}
        title={'타겟팅 조건 미설정'}
      />
    </StyledAudienceTarget>
  );
};

export default AudienceTargetCreate;
