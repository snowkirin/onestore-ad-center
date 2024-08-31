import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCreativeGroupDetail, putCreativeGroup } from '@apis/creative_group.api';
import _, { find as _find, findIndex as _findIndex, isEmpty as _isEmpty } from 'lodash';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { AppInputCount } from '@components/AppInput';
import AppRadioGroup from '@components/AppRadio';
import {
  dateRadioGroup,
  formDefaultValues,
  scheduleConverter,
  StyledDateWrapper,
} from '@pages/Campaigns/CreativeGroup/variables';
import AppSchedule from '@components/AppSchedule';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { creativeByType, toComponentScheduleValue, toScheduleValue, toTargetSchedule } from '@utils/functions';
import dayjs from 'dayjs';
import { CreativeType, DaysType } from '@interface/common.interface';
import { getCreativeList } from '@apis/creative.api';
import AppTabs, { AppTab } from '@components/AppTabs';
import AppTable from '@components/AppTable/Table';
import { ImageCell, ImageSizeCell, VideoCell, VideoLengthCell } from '@components/Common';
import { AppButton } from '@components/AppButton';
import AppPageFooter from '@components/AppPageFooter';
import AppDatePicker from '@components/AppDatePicker';
import AppCheckbox from '@components/AppCheckbox';
import { Loader } from 'rsuite';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import InfoMessage from '@components/AppTypography/InfoMessage';
import CreativeModal from '@pages/Campaigns/CreativeGroup/CreativeModal';
import { FinalActionDivider } from '@components/AppDivider';
import TextCell from '@components/Common/TextCell';
import TimezoneJSON from '@utils/json/timezone.json';

interface CreativeGroupEditProps {}

const CreativeGroupEdit: React.FC<CreativeGroupEditProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const { id: creativeGroupId } = useParams();
  const { state }: { state: any } = useLocation();
  const navigate = useNavigate();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const [isDateSetting, setIsDateSetting] = useState<'not' | 'set'>('not');
  const [isLimitEndDate, setIsLimitEndDate] = useState(['true']);
  const [isShowSchedule, setIsShowSchedule] = useState(false);
  const [selectedTrackingLink, setSelectedTrackingLink] = useState('');
  const [creativeListTab, setCreativeListTab] = useState<CreativeType>('IMAGE');

  const [isOpenCreativeListModal, setIsOpenCreativeListModal] = useState(false);
  const [creativeType, setCreativeType] = useState<CreativeType>('IMAGE');
  const [tmpSelectedCreativeList, setTmpSelectedCreativeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    clearErrors,
    setValue,
    watch,
    setError,
  } = useForm({
    defaultValues: formDefaultValues,
  });
  const watchCreatives = watch('creatives');

  /* 데이터 가져오기 */

  // 그룹 상세 데이터 가져오기
  const fetchCreativeGroupDetail = useQuery(
    ['fetchCreativeGroupDetail', creativeGroupId],
    async () => {
      const { data } = await getCreativeGroupDetail(creativeGroupId!, { inquiry_option: 'INQUIRY_OVERVIEW' });

      // Set CreativeGroup Name
      setValue('name', data.creative_group_overview.creative_group.title);

      // Date Setting
      if (data.creative_group_overview.creative_group.audience.targeting_condition.schedule) {
        setIsDateSetting('set');
        setValue(
          'scheduleStartDate',
          dayjs(data.creative_group_overview.creative_group.audience.targeting_condition.schedule.start).toDate()
        );

        if (data.creative_group_overview.creative_group.audience.targeting_condition.schedule.end) {
          setIsLimitEndDate(['false']);
          setValue(
            'scheduleEndDate',
            dayjs(data.creative_group_overview.creative_group.audience.targeting_condition.schedule.end).toDate()
          );
        }
      } else {
        setIsDateSetting('not');
      }

      // Set Tracking Link
      if (data.tracking_link) {
        setSelectedTrackingLink(data.tracking_link.id);
      }

      // Set Schedule
      if (data.creative_group_overview.creative_group.audience.targeting_condition.weekly_schedules) {
        setValue(
          'schedule',
          toComponentScheduleValue(
            data.creative_group_overview.creative_group.audience.targeting_condition.weekly_schedules
          )
        );
      }

      // Set Creative
      if (data.creatives) {
        setValue('creatives', data.creatives);
      }

      return data;
    },
    {
      enabled: !_isEmpty(creativeGroupId),
    }
  );

  // 트래킹 데이터 가져오기
  const fetchTrackingLinkList = useQuery(
    ['fetchTrackingLinkList', selectedAdAccount, state.currentProductData.id],
    async () => {
      // 트래킹링크 리스트 가져올 ad_account_id와 product_id
      const params = {
        ad_account_id: selectedAdAccount,
        product_id: state.currentProductData.id,
        inquiry_option: 'INQUIRY_OVERVIEW',
      };
      const { data } = await getTrackingLinkList(params);
      if (data.tracking_link_overviews && data.tracking_link_overviews.length !== 0) {
        return data.tracking_link_overviews;
      } else {
        return [];
      }
    },
    {
      enabled: !_isEmpty(selectedAdAccount) && !_isEmpty(state.currentProductData.id),
    }
  );

  // 소재데이터 가져오기
  const fetchCreativeList = useQuery(
    ['fetchCreativeList'],
    async () => {
      const response = await getCreativeList({
        ad_account_id: selectedAdAccount,
        product_id: state.currentProductData.id,
      });

      if (response.status === 200) {
        if (response.data.creatives && response.data.creatives.length !== 0) {
          return creativeByType(response.data.creatives);
        } else {
          return {
            IMAGE: [],
            NATIVE: [],
            VIDEO: [],
          };
        }
      }

      return response.data;

      // return data;
    },
    {
      enabled: isOpenCreativeListModal,
    }
  );

  /* 소재 관련 함수 */

  const onDeleteCreative = (id: string) => {
    setValue(
      'creatives',
      watchCreatives.filter((item) => item.id !== id)
    );
  };

  const onCreateCreativeGroup = (data: typeof formDefaultValues) => {
    setLoading(true);

    const bodyParams = {
      title: data.name,
      creative_ids: data.creatives.map((ele) => ele.id),
      tracking_link_id: _isEmpty(selectedTrackingLink) ? '' : selectedTrackingLink,
      audience: {
        targeting_condition: {
          ...(isDateSetting !== 'not' && {
            schedule: {
              start: data.scheduleStartDate,
              end: isLimitEndDate.includes('true') ? undefined : data.scheduleEndDate,
            },
          }),
          weekly_schedules: scheduleConverter(data.schedule),
        },
      },
    };
    putCreativeGroup(creativeGroupId!, bodyParams)
      .then(() => {
        navigate('/campaigns/creative-group');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /* 소재 모달 관련 함수들 */

  // 소재 모달 열기
  const handleOpenCreativeListModal = () => {
    setTmpSelectedCreativeList(watchCreatives);
    setIsOpenCreativeListModal(true);
  };

  // 소재 선택
  const handleCheckCreativeList = (value: any, checked: any) => {
    const newSelectedCreativeList = [...tmpSelectedCreativeList];
    if (checked) {
      const selectedObj = _find(fetchCreativeList.data[creativeType], { id: value });
      newSelectedCreativeList.push(selectedObj);
    } else {
      newSelectedCreativeList.splice(_findIndex(newSelectedCreativeList, { id: value }), 1);
    }
    setTmpSelectedCreativeList(newSelectedCreativeList);
  };

  // 소재 모달 확인
  const handleOkCreativeListModal = () => {
    setValue('creatives', tmpSelectedCreativeList);
    handleCloseCreativeListModal();
  };
  // 소재 모달 닫기
  const handleCloseCreativeListModal = () => {
    setIsOpenCreativeListModal(false);
    setCreativeType('IMAGE');
  };

  const convertCreativeList = useMemo(() => {
    if (watchCreatives.length !== 0) {
      return creativeByType(watchCreatives);
    } else {
      return {
        IMAGE: [],
        NATIVE: [],
        VIDEO: [],
      };
    }
  }, [watchCreatives]);

  const currentTimezone = useMemo(() => {
    const adAccountTimezone = adAccountList.find((item: any) => item.id === selectedAdAccount).timezone;
    return TimezoneJSON.find((item) => item.value === adAccountTimezone);
  }, [selectedAdAccount]);

  useEffect(() => {
    if (watchCreatives.length === 0) setError('creatives', { type: 'required', message: '소재를 추가하세요.' });
    else clearErrors('creatives');
  }, [watchCreatives]);

  return (
    <div>
      {(fetchCreativeGroupDetail.isFetching || loading) && <Loader center backdrop style={{ zIndex: 99 }} />}
      <AppPageHeader title={'소재그룹 수정'} />
      {fetchCreativeGroupDetail.isSuccess && (
        <div className={'content__inner'}>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label isRequired className={'text'}>
                앱이름
              </AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{state.currentProductData.title}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label isRequired className={'text'}>
                소재그룹 ID
              </AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>
                {fetchCreativeGroupDetail.data.creative_group_overview.creative_group.id}
              </AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label isRequired className={'text'}>
                소재그룹명
              </AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <Controller
                name={'name'}
                control={control}
                render={({ field }) => (
                  <AppInputCount
                    className={clsx({ 'input-error': _.get(errors, 'name') })}
                    style={{ width: 450 }}
                    maxLength={50}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
                rules={{
                  required: '소재그룹명을 입력하세요.',
                }}
              />
              <ErrorMessage
                name={'name'}
                errors={errors}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>상태</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>
                {fetchCreativeGroupDetail.data.creative_group_overview.inactive_reasons ? 'inactive' : 'active'}
              </AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>시작일/종료일</AppTypography.Label>
            </div>
            <div className={'col col-input'} style={{ width: 650 }}>
              <div>
                <AppRadioGroup
                  inline
                  data={dateRadioGroup}
                  value={isDateSetting}
                  onChange={(value) => setIsDateSetting(value)}
                />
              </div>

              {isDateSetting === 'set' && (
                <>
                  <StyledDateWrapper>
                    <div className={'input-wrapper'}>
                      {/* Start Date */}
                      <Controller
                        name={'scheduleStartDate'}
                        control={control}
                        render={({ field }) => (
                          <AppDatePicker
                            oneTap
                            ranges={[]}
                            style={{ width: 130 }}
                            isoWeek={true}
                            value={field.value}
                            cleanable={false}
                            disabledDate={(date) => dayjs(date).isBefore(dayjs(), 'date')}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            format={'yyyy-MM-dd'}
                          />
                        )}
                      />
                      <Controller
                        name={'scheduleStartDate'}
                        control={control}
                        render={({ field }) => (
                          <AppDatePicker
                            format={'HH:mm'}
                            style={{ width: 100 }}
                            value={field.value}
                            cleanable={false}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            disabledDate={(date) => dayjs(date).isBefore(dayjs(), 'minute')}
                          />
                        )}
                      />
                      <span>~</span>
                      {/* EndDate */}
                      <Controller
                        name={'scheduleEndDate'}
                        control={control}
                        render={({ field }) => (
                          <AppDatePicker
                            oneTap
                            ranges={[]}
                            className={clsx({ 'input-error': _.get(errors, 'scheduleEndDate') })}
                            style={{ width: 130 }}
                            isoWeek={true}
                            value={field.value}
                            cleanable={false}
                            disabledDate={(date) => dayjs(date).isBefore(getValues('scheduleStartDate'), 'date')}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            format={'yyyy-MM-dd'}
                            disabled={isLimitEndDate.includes('true')}
                          />
                        )}
                      />
                      <Controller
                        name={'scheduleEndDate'}
                        control={control}
                        render={({ field }) => (
                          <AppDatePicker
                            format={'HH:mm'}
                            className={clsx({ 'input-error': _.get(errors, 'scheduleEndDate') })}
                            style={{ width: 100 }}
                            value={field.value}
                            cleanable={false}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            disabledDate={(date) => dayjs(date).isBefore(getValues('scheduleStartDate'), 'minute')}
                            disabled={isLimitEndDate.includes('true')}
                          />
                        )}
                        rules={{
                          validate: {
                            afterStartDate: (v: Date) => {
                              return isLimitEndDate.includes('true') ||
                                dayjs(v).isSame(getValues('scheduleStartDate'), 'date') ||
                                dayjs(v).isAfter(getValues('scheduleStartDate'), 'date')
                                ? true
                                : '종료일은 시작일보다 미래일자로 설정하세요.';
                            },
                          },
                        }}
                      />
                      <AppCheckbox
                        data={[
                          {
                            label: '종료일 없음',
                            value: 'true',
                          },
                        ]}
                        value={isLimitEndDate}
                        onChange={(value) => {
                          setIsLimitEndDate(value);
                          clearErrors('scheduleEndDate');
                        }}
                      />
                    </div>
                    <div className={'text-wrapper'}>
                      <ErrorMessage
                        name={`scheduleEndDate`}
                        errors={errors}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                      <InfoMessage>Timezone: {currentTimezone ? currentTimezone.label : ''}</InfoMessage>
                    </div>
                  </StyledDateWrapper>
                </>
              )}
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>스케줄</AppTypography.Label>
            </div>
            <div className={'col col-input'} style={{ width: 650 }}>
              <AppTypography.Link className={'text'} onClick={() => setIsShowSchedule(!isShowSchedule)}>
                스케줄 설정 ▼
              </AppTypography.Link>
              {isShowSchedule && (
                <Controller
                  name={'schedule'}
                  control={control}
                  render={({ field }) => (
                    <AppSchedule
                      value={toScheduleValue(field.value)}
                      onSelect={(v) => {
                        field.onChange(toTargetSchedule(v));
                      }}
                    />
                  )}
                  rules={{
                    validate: {
                      required: (v) => {
                        return (
                          (Object.keys(v) as DaysType[]).every((day: DaysType) => v[day].length > 0) ||
                          '노출시점을 선택하세요.'
                        );
                      },
                    },
                  }}
                />
              )}
              <ErrorMessage
                name={`schedule`}
                errors={errors}
                render={({ message }) => <AppErrorMessage style={{ marginTop: 50 }}>{message}</AppErrorMessage>}
              />
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>트래킹 링크</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppSelectPicker
                cleanable={false}
                searchable={false}
                data={fetchTrackingLinkList.data}
                value={selectedTrackingLink}
                labelKey={'title'}
                valueKey={'id'}
                onChange={(value) => {
                  setSelectedTrackingLink(value);
                }}
                placeholder={'트래킹 링크를 선택하세요.'}
                block
              />
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label isRequired className={'text'}>
                소재
              </AppTypography.Label>
            </div>
            <div className={'col col-input'} style={{ width: 650 }}>
              <AppButton size={'md'} type={'submit'} theme={'red'} onClick={handleOpenCreativeListModal}>
                불러오기
              </AppButton>
              <div style={{ marginTop: 30 }}>
                <AppTabs activeKey={creativeListTab} onSelect={(value) => setCreativeListTab(value)}>
                  <AppTab eventKey={'IMAGE'}>이미지</AppTab>
                  <AppTab eventKey={'NATIVE'}>네이티브</AppTab>
                  <AppTab eventKey={'VIDEO'}>비디오</AppTab>
                </AppTabs>
              </div>
              <AppTable data={convertCreativeList[creativeListTab]} style={{ borderTop: 'none' }}>
                <AppTable.Column>
                  <AppTable.HeaderCell>소재명</AppTable.HeaderCell>
                  <TextCell dataKey={'title'} />
                </AppTable.Column>
                {creativeListTab === 'IMAGE' && (
                  <>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                      <ImageCell dataKey={'image.image_url'} />
                    </AppTable.Column>
                    <AppTable.Column verticalAlign={'middle'}>
                      <AppTable.HeaderCell>사이즈</AppTable.HeaderCell>
                      <ImageSizeCell dataKey={'image.width, image.height'} />
                    </AppTable.Column>
                  </>
                )}
                {creativeListTab === 'NATIVE' && (
                  <>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>아이콘</AppTable.HeaderCell>
                      <ImageCell dataKey={'native.icon_image.image_url'} />
                    </AppTable.Column>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>동영상</AppTable.HeaderCell>
                      <VideoCell dataKey={'native.video.video_url'} />
                    </AppTable.Column>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                      <ImageCell dataKey={'native.main_image.image_url'} />
                    </AppTable.Column>
                    <AppTable.Column verticalAlign={'middle'}>
                      <AppTable.HeaderCell>이미지 사이즈</AppTable.HeaderCell>
                      <ImageSizeCell dataKey={'native.main_image.width, native.main_image.height'} />
                    </AppTable.Column>
                  </>
                )}
                {creativeListTab === 'VIDEO' && (
                  <>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>동영상</AppTable.HeaderCell>
                      <VideoCell dataKey={'video.video_url'} />
                    </AppTable.Column>
                    <AppTable.Column width={100} verticalAlign={'middle'}>
                      <AppTable.HeaderCell>영상길이</AppTable.HeaderCell>
                      <VideoLengthCell dataKey={'video.length_seconds'} />
                    </AppTable.Column>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                      <ImageCell dataKey={'video.companion_images[0].image_url'} />
                    </AppTable.Column>
                    <AppTable.Column verticalAlign={'middle'}>
                      <AppTable.HeaderCell>이미지 사이즈</AppTable.HeaderCell>
                      <ImageSizeCell dataKey={'video.companion_images[0].width, video.companion_images[0].height'} />
                    </AppTable.Column>
                  </>
                )}
                <AppTable.Column verticalAlign={'middle'} width={80}>
                  <AppTable.HeaderCell>삭제</AppTable.HeaderCell>
                  <AppTable.Cell>
                    {(rowData) => (
                      <AppTypography.Link
                        onClick={() => {
                          onDeleteCreative(rowData['id']);
                        }}
                      >
                        삭제
                      </AppTypography.Link>
                    )}
                  </AppTable.Cell>
                </AppTable.Column>
              </AppTable>
              <ErrorMessage
                name={`creatives`}
                errors={errors}
                render={({ message }) => <AppErrorMessage style={{ marginTop: 50 }}>{message}</AppErrorMessage>}
              />
            </div>
          </div>
        </div>
      )}
      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/campaigns/creative-group')}>
          취소
        </AppButton>
        <AppButton
          theme={'red'}
          size={'lg'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={handleSubmit(onCreateCreativeGroup)}
        >
          수정
        </AppButton>
      </AppPageFooter>

      {/* 소재 모달창 */}
      <CreativeModal
        open={isOpenCreativeListModal}
        onClose={handleCloseCreativeListModal}
        creativeType={creativeType}
        data={fetchCreativeList.data}
        loading={fetchCreativeList.isLoading}
        onCheck={handleCheckCreativeList}
        tmpSelected={tmpSelectedCreativeList}
        setCreativeType={setCreativeType}
        onOk={handleOkCreativeListModal}
      />
    </div>
  );
};

export default CreativeGroupEdit;
