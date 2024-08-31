import React, { useMemo, useState } from 'react';
import { AppInput, AppInputCount } from '@components/AppInput';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import { AppButton } from '@components/AppButton';
import mmpData from '@utils/json/mmp.json';
import { updateTrackingLink, viewTrackingLink } from '@apis/tracking_link.api';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { REGEXP_URL } from '@utils/regexp';
import AppTypography from '@components/AppTypography';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';

interface CreateTrackingProps {}

const UpdateTracking: React.FC<CreateTrackingProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  // Variables
  const navigate = useNavigate();
  // parameter
  const { id: trackingLinkId } = useParams();
  const { title: appName } = useParams();

  const [mmp, setMmp] = useState('');
  const [isMmp, setIsMmp] = useState(false);

  const {
    handleSubmit: TRC_handleSubmit,
    control: TRC_control,
    getValues: TRC_getValues,
    formState: { errors: TRC_errors },
  } = useForm();

  const fetchTrackingDetail = useQuery(
    ['fetchTrackingDetail', trackingLinkId],
    async () => {
      const response = await viewTrackingLink({
        tracking_link_id: trackingLinkId,
      });
      if (response.status === 200) {
        return response.data.tracking_link;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(trackingLinkId),
      onSuccess: (data) => {
        if (data.tracking_company !== '' && data.tracking_company !== null) {
          setIsMmp(true);
        }
      },
    }
  );

  const onClickTRCSubmit = (data: any) => {
    const TRC_data = {
      ..._.omit(data, ['view_through_link']),
      id: fetchTrackingDetail.data?.id,
      ad_account_id: localStorage.getItem('selectedAdAccount'),
      product_id: fetchTrackingDetail.data?.product_id,
      device_os: 'ANDROID',
      created_at: fetchTrackingDetail.data?.created_at,
      click_through_link: {
        url: TRC_getValues('click_through_link.url'),

        status: fetchTrackingDetail.data?.click_through_link?.status,
        unverified_status_data: {
          stored_at: fetchTrackingDetail.data?.click_through_link?.unverified_status_data?.stored_at,
        },
      },

      ...(!_.isEmpty(TRC_getValues('view_through_link.url')) && {
        view_through_link: {
          url: TRC_getValues('view_through_link.url'),
          ...(fetchTrackingDetail.data?.view_through_link?.status && {
            status: fetchTrackingDetail.data?.view_through_link?.status,
          }),
          ...(fetchTrackingDetail.data?.view_through_link?.unverified_status_data?.stored_at && {
            unverified_status_data: {
              stored_at: fetchTrackingDetail.data?.view_through_link?.unverified_status_data?.stored_at,
            },
          }),
        },
      }),

      description: TRC_getValues('description') || '',
    };
    /**
     title: 트래킹 링크명
     device_os: OS
     description: 트래킹 링크 설명
     tracking_company: mmp
     click_through_link: 클릭 트래킹 URL
     예시: https://app.adjust.com/fa5ycof?adgroup=%{raw_app_bundle}&campaign=%{campaign}&campaign_id=%{campaign}&cost_amount=%{cost_amount}&cost_currency=%{cost_currency}&cost_type=%{cost_type}&creative=%{creative_id}&creative_id=%{creative_id}&gps_adid=%{a_idfa}&idfa=%{i_idfa}&impression_id=%{bid_id}&molo_click_id=%{mtid}&publisher_id=%{raw_app_bundle}&subpublisher_id=%{raw_app_bundle}
     view_through_link: 뷰 트래킹 URL
     예시 JSON :
     {
      id: 'Y5vkrFRIE8JKUv7z',
      ad_account_id: 'EsGuYyrBzvK8UbwK',
      product_id: 'aRZYgyym4QJLqtyJ',
      title: '천문',
      device_os: 'ANDROID',
      click_through_link: {
        url: 'https://app.adjust.com/6wok8i4?adgroup=%{raw_app_bundle}&campaign=%{campaign}&campaign_id=%{campaign}&cost_amount=%{cost_amount}&cost_currency=%{cost_currency}&cost_type=%{cost_type}&creative=%{creative_id}&creative_id=%{creative_id}&gps_adid=%{a_idfa}&idfa=%{i_idfa}&impression_id=%{bid_id}&molo_click_id=%{mtid}&publisher_id=%{raw_app_bundle}&subpublisher_id=%{raw_app_bundle}&tracker_limit=250000',
        status: 'UNVERIFIED',
        unverified_status_data: {
          stored_at: '2022-10-24T05:14:49Z',
        },
      },
      view_through_link: {
        url: 'https://view.adjust.com/impression/6wok8i4?adgroup=%{raw_app_bundle}&campaign=%{campaign}&campaign_id=%{campaign}&cost_amount=%{cost_amount}&cost_currency=%{cost_currency}&cost_type=%{cost_type}&creative=%{creative_id}&creative_id=%{creative_id}&gps_adid=%{a_idfa}&idfa=%{i_idfa}&impression_id=%{bid_id}&molo_click_id=%{mtid}&publisher_id=%{raw_app_bundle}&subpublisher_id=%{raw_app_bundle}&tracker_limit=250000',
        status: 'UNVERIFIED',
        unverified_status_data: {
          stored_at: '2022-10-24T05:14:49Z',
        },
      },
      tracking_company: 'ADJUST',
      created_at: '2022-10-24T05:14:49.828744Z',
      description: '',
     };
     */
    updateTrackingLink(
      trackingLinkId,
      {
        ad_account_id: localStorage.getItem('selectedAdAccount'),
        product_id: fetchTrackingDetail.data?.product_id,
      },
      TRC_data
    )
      .then((res: any) => {
        if (res.status === 200) {
          navigate('/assets/tracking-link');
        }
      })
      .catch((err: any) => {
        alert('This link isn’t valid. Double-check it with your MMP partner, and contact us if the problem persists.');
      });
  };

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'트래킹 링크 수정'} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              광고계정명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              OS
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>ANDROID</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              앱 이름
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{appName}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>트래킹 링크 ID</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchTrackingDetail.data?.id}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              트래킹 링크명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              defaultValue={fetchTrackingDetail.data?.title}
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={50}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '트래킹 링크명을 입력하세요.',
              }}
            />
            <ErrorMessage
              errors={TRC_errors}
              name={'title'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>트래킹 링크 설명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'description'}
              defaultValue={fetchTrackingDetail.data?.description}
              control={TRC_control}
              render={({ field }) => (
                <AppInputTextArea
                  as="textarea"
                  maxLength={200}
                  height={100}
                  onInput={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              )}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              MMP
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'tracking_company'}
              defaultValue={fetchTrackingDetail.data?.tracking_company}
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppSelectPicker
                    cleanable={false}
                    searchable={false}
                    placeholder={'MMP를 선택하세요.'}
                    block
                    data={mmpData}
                    onChange={(value: any) => {
                      field.onChange(value);
                      setMmp(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: 'MMP를 선택하세요.',
              }}
            />
            <ErrorMessage
              errors={TRC_errors}
              name={'tracking_company'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              클릭 트래킹 URL
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'click_through_link.url'}
              defaultValue={fetchTrackingDetail.data?.click_through_link?.url}
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppInput
                    as={'textarea'}
                    style={{ width: '100%', height: 100, resize: 'none' }}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={!isMmp}
                  />
                );
              }}
              rules={{
                required: '클릭 트래킹 URL을 입력하세요.',
                pattern: {
                  value: REGEXP_URL,
                  message: '잘못된 URL입니다.',
                },
              }}
            />
            <ErrorMessage
              errors={TRC_errors}
              name={'click_through_link.url'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>뷰 트래킹 URL</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'view_through_link.url'}
              defaultValue={fetchTrackingDetail.data?.view_through_link?.url}
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppInput
                    as="textarea"
                    style={{ width: '100%', height: 100, resize: 'none' }}
                    onInput={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    disabled={!isMmp}
                  />
                );
              }}
              rules={{
                pattern: {
                  value: REGEXP_URL,
                  message: '잘못된 URL입니다.',
                },
              }}
            />
            <ErrorMessage
              errors={TRC_errors}
              name={'view_through_link.url'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
      </div>

      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/tracking-link')}>
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={TRC_handleSubmit(onClickTRCSubmit)}
        >
          수정
        </AppButton>
      </AppPageFooter>
    </div>
  );
};
export default UpdateTracking;
