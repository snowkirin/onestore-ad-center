import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import { AppInputCount } from '@components/AppInput';
import AppSchedule from '@components/AppSchedule';
import AppTable from '@/components/AppTable';
import AppCheckbox from '@components/AppCheckbox';
import { useQuery } from '@tanstack/react-query';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import _, { find as _find, findIndex as _findIndex, isEmpty as _isEmpty } from 'lodash';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppDatePicker from '@components/AppDatePicker';
import { creativeByType, toScheduleValue, toTargetSchedule } from '@utils/functions';
import { AppButton } from '@components/AppButton';
import { getCreativeList } from '@apis/creative.api';
import AppTabs, { AppTab } from '@components/AppTabs';
import { ImageCell, ImageSizeCell, VideoCell, VideoLengthCell } from '@components/Common';
import { postCreativeGroup } from '@apis/creative_group.api';
import AppRadioGroup from '@components/AppRadio';
import dayjs from 'dayjs';
import {
  dateRadioGroup,
  formDefaultValues,
  scheduleConverter,
  StyledDateWrapper,
} from '@pages/Campaigns/CreativeGroup/variables';
import { DaysType } from '@interface/common.interface';
import AppPageFooter from '@components/AppPageFooter';
import AppPageHeader from '@components/AppPageHeader';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import InfoMessage from '@components/AppTypography/InfoMessage';
import { Loader } from 'rsuite';
import CreativeModal from '@pages/Campaigns/CreativeGroup/CreativeModal';
import { FinalActionDivider } from '@components/AppDivider';
import TextCell from '@components/Common/TextCell';
import TimezoneJSON from '@utils/json/timezone.json';

interface CreativeGroupCreateProps {}

const CreativeGroupCreate: React.FC<CreativeGroupCreateProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  // 소재그룹 리스트에서 생성버튼 클릭시 이동하면서 정보 받아옴 (현재 선택된 Product 정보)
  const { state }: { state: any } = useLocation();
  const navigate = useNavigate();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  /* State */
  const [isDateSetting, setIsDateSetting] = useState<'not' | 'set'>('not');
  const [isLimitEndDate, setIsLimitEndDate] = useState(['true']);
  const [isShowSchedule, setIsShowSchedule] = useState(false);
  const [selectedTrackingLink, setSelectedTrackingLink] = useState<any>('');
  const [creativeListTab, setCreativeListTab] = useState<'IMAGE' | 'NATIVE' | 'VIDEO'>('IMAGE');
  const [loading, setLoading] = useState(false);

  // 소재 리스트 모달창
  const [isOpenCreativeListModal, setIsOpenCreativeListModal] = useState(false);
  const [creativeType, setCreativeType] = useState<'IMAGE' | 'NATIVE' | 'VIDEO'>('IMAGE');
  const [tmpSelectedCreativeList, setTmpSelectedCreativeList] = useState<any[]>([]);
  // 소재 항목을 change 했는지 여부, validation을 위해 씀
  const [isInitState, setIsInitState] = useState(true);

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

  /* Data Fetch  */

  // Fetch TrackingList
  const fetchTrackingLinkList = useQuery(
    ['fetchTrackingLinkList', { ad_account_id: selectedAdAccount, product_id: state.currentProductData.id }],
    async () => {
      // 트래킹링크 리스트 가져올 ad_account_id와 product_id
      const params = {
        ad_account_id: selectedAdAccount,
        product_id: state.currentProductData.id,
        inquiry_option: 'INQUIRY_OVERVIEW',
      };
      const { data } = await getTrackingLinkList(params);
      if (data.tracking_link_overviews && data.tracking_link_overviews.length !== 0) {
        return _.orderBy(data.tracking_link_overviews, ['title'], ['asc']);
      } else {
        return [];
      }
    },
    {
      enabled: !_isEmpty(selectedAdAccount) && !_isEmpty(state.currentProductData.id),
    }
  );

  // Fetch CreativeList
  const fetchCreativeList = useQuery(
    ['fetchCreativeList', { ad_account_id: selectedAdAccount, product_id: state.currentProductData.id }],
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
    },
    {
      enabled: isOpenCreativeListModal,
    }
  );

  // 소재불러오기 모달 관련 함수들
  const handleCloseCreativeListModal = () => {
    setIsOpenCreativeListModal(false);
    setCreativeType('IMAGE');
  };
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
  const handleOkCreativeListModal = () => {
    setValue('creatives', tmpSelectedCreativeList);
    setIsInitState(false);
    handleCloseCreativeListModal();
  };

  const onCreateCreativeGroup = (data: typeof formDefaultValues) => {
    setLoading(true);
    const queryParams = {
      ad_account_id: selectedAdAccount,
      product_id: state.currentProductData.id,
    };
    const bodyParams = {
      id: '',
      ad_account_id: '',
      product_id: '',
      title: data.name,
      description: '',
      creative_ids: data.creatives.map((ele) => ele.id),
      tracking_link_id: _isEmpty(selectedTrackingLink) ? '' : selectedTrackingLink,
      mmp_tag: '',
      lading_url: '',
      feature: {
        type: 'GENERAL',
      },
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

    postCreativeGroup(queryParams, bodyParams)
      .then(() => {
        navigate('/campaigns/creative-group');
      })
      .finally(() => {
        setLoading(false);
      });
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
    if (watchCreatives.length === 0 && !isInitState)
      setError('creatives', { type: 'required', message: '소재를 추가하세요.' });
    else clearErrors('creatives');
  }, [watchCreatives, isInitState]);

  return (
    <div>
      {loading && <Loader center backdrop style={{ zIndex: 99 }} />}
      <AppPageHeader title={'소재그룹 생성'} />
      <div className={'content__inner'}>
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
              searchable={false}
              block
              data={fetchTrackingLinkList.data}
              value={selectedTrackingLink}
              labelKey={'title'}
              valueKey={'id'}
              onChange={(value) => {
                setSelectedTrackingLink(value);
              }}
              placeholder={'트래킹 링크를 선택하세요.'}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>소재</AppTypography.Label>
          </div>
          <div className={'col col-input'} style={{ width: 650 }}>
            <AppButton type={'submit'} size={'md'} theme={'red'} onClick={() => setIsOpenCreativeListModal(true)}>
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
            </AppTable>
            <ErrorMessage
              name={`creatives`}
              errors={errors}
              render={({ message }) => <AppErrorMessage style={{ marginTop: 50 }}>{message}</AppErrorMessage>}
            />
          </div>
        </div>{' '}
      </div>
      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/campaigns/creative-group')}>
          취소
        </AppButton>
        <AppButton
          theme={'red'}
          size={'lg'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={() => {
            setIsInitState(false);
            handleSubmit(onCreateCreativeGroup)();
          }}
        >
          생성
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

export default CreativeGroupCreate;
