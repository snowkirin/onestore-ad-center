import React, { useMemo } from 'react';
import '../style.less';
import { AppInputCount } from '@components/AppInput';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import { AppButton } from '@components/AppButton';
import { getProductDetail, updateProduct } from '@apis/product.api';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import { updateApp } from '@apis/apps.api';
import AppTypography from '@components/AppTypography';
import { Controller, useForm } from 'react-hook-form';
import {
  REGEXP_ADVERTISER_DOMAIN,
  REGEXP_ADVERTISER_DOMAIN_WWW,
  REGEXP_EMOJI,
  REGEXP_SPECIAL_CHAR,
} from '@utils/regexp';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import RTB_JSON from '@utils/json/rtb.json';
import RATING_JSON from '@utils/json/rating.json';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import InfoTooltip from '@components/InfoTooltip';

interface CreateAppProps {}

const AppUpdate: React.FC<CreateAppProps> = () => {
  const navigate = useNavigate();
  const { id: productID } = useParams();
  // adAccountId
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const {
    handleSubmit: AU_handleSubmit,
    control: AU_control,
    getValues: AU_getValues,
    formState: { errors: AU_errors },
  } = useForm();

  // parameter
  // Function
  const fetchProductDetail = useQuery(
    ['fetchProductDetail', productID],
    async () => {
      const result = await getProductDetail(productID);
      if (result.status === 200) {
        return {
          ...result.data.product,
          category: result.data.product.category,
          contentRating: result.data.product.contentRating,
          title: result.data.product.title || '',
          description: result.data.product.description || '',
          domain: result.data.product.domain || '',
        };
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(productID),
    }
  );

  const onClickAUSubmit = (data: any) => {
    const AU_data = {
      ...data,
      //ad_account_id: selectedAdAccounts,
      ad_account_id: selectedAdAccount,
      advertiser_domain: AU_getValues('advertiser_domain'),
      app: {
        app_store_url: fetchProductDetail.data?.app?.app_store_url,
        category: AU_getValues('app.category'),
        rating: 0,
        content_rating: AU_getValues('app.content_rating'),
        bundle_id: fetchProductDetail.data?.app.bundle_id,
        mmp_integration: {
          id: fetchProductDetail.data?.app?.mmp_integration?.id,
          mmp: fetchProductDetail.data?.app?.mmp_integration?.mmp,
          mmp_bundle_id: fetchProductDetail.data?.app?.mmp_integration?.mmp_bundle_id,
          status: fetchProductDetail.data?.app?.mmp_integration?.status,
        },
        postback_integration: {
          bundle_id: fetchProductDetail.data?.app?.postback_integration?.bundle_id,
          mmp: fetchProductDetail.data?.app?.postback_integration?.mmp,
        },
      },
      developer_name: fetchProductDetail.data?.developer_name,
      device_os: 'ANDROID',
      id: productID,
      type: 'APP',
    };
    const payload = {
      product_id: productID!,
    };
    updateProduct(payload, AU_data).then((res: any) => {
      if (res.status === 200) {
        updateApp({ appId: productID! }, { title: AU_getValues('title') }).then((res: any) => {
          if (res.status === 200) {
            navigate('/assets/app');
          }
        });
      }
    });
  };

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <>
      {fetchProductDetail.isSuccess && (
        <div>
          <AppPageHeader title={'앱 수정'} />
          <div style={{ padding: '16px 30px 0 30px' }}>
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
                  앱 ID
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchProductDetail.data?.id}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 이름
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'title'}
                  defaultValue={fetchProductDetail.data?.title}
                  control={AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount maxLength={50} value={field.value} onChange={(value) => field.onChange(value)} />
                    );
                  }}
                  rules={{
                    required: '앱 이름을 입력해 주세요.',
                    validate: {
                      noSpecialChar: (value) => !REGEXP_SPECIAL_CHAR.test(value) || '특수문자는 입력 불가합니다.',
                      noEmoji: (value) => !REGEXP_EMOJI.test(value) || '특수문자는 입력 불가합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  name={'title'}
                  errors={AU_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>앱 설명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'description'}
                  defaultValue={fetchProductDetail.data?.description}
                  control={AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputTextArea
                        maxLength={200}
                        height={100}
                        as={'textarea'}
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                      />
                    );
                  }}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>상태</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchProductDetail.data?.app?.mmp_integration?.status}
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  <span>도메인</span>
                  <InfoTooltip inner={'http://, https://, www. 를 제외하고 입력하세요.'} />
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'advertiser_domain'}
                  defaultValue={fetchProductDetail.data?.advertiser_domain}
                  control={AU_control}
                  render={({ field }) => (
                    <AppInputCount maxLength={2083} value={field.value} onChange={(value) => field.onChange(value)} />
                  )}
                  rules={{
                    required: '도메인을 입력해 주세요.',
                    validate: {
                      noSpecialChar: (value) => REGEXP_ADVERTISER_DOMAIN.test(value) || '잘못된 URL입니다.',
                      noHTTP: (value) =>
                        REGEXP_ADVERTISER_DOMAIN_WWW.test(value) || 'http://, https://, www. 를 제외하고 입력하세요.',
                    },
                  }}
                />
                <ErrorMessage
                  name={'advertiser_domain'}
                  errors={AU_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 마켓 URL
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchProductDetail.data?.app.app_store_url}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 마켓 번들 ID
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchProductDetail.data?.app.bundle_id}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  개발자명
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchProductDetail.data?.developer_name}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  카테고리
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.category'}
                  defaultValue={fetchProductDetail.data?.app?.category}
                  control={AU_control}
                  render={({ field }) => (
                    <AppSelectPicker
                      block
                      data={RTB_JSON}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      cleanable={false}
                    />
                  )}
                  rules={{
                    required: '카테고리를 선택하세요.',
                  }}
                />
                <ErrorMessage
                  name={'app.category'}
                  errors={AU_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  콘텐츠 등급
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.content_rating'}
                  defaultValue={fetchProductDetail.data?.app?.content_rating}
                  control={AU_control}
                  render={({ field }) => (
                    <AppSelectPicker
                      block
                      data={RATING_JSON}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      cleanable={false}
                      searchable={false}
                    />
                  )}
                  rules={{
                    required: '콘텐츠 등급을 선택하세요.',
                  }}
                />
                <ErrorMessage
                  name={'app.content_rating'}
                  errors={AU_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  <span>MMP</span>
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchProductDetail.data?.app?.mmp_integration?.mmp}
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  MMP 번들 ID
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchProductDetail.data?.app?.mmp_integration?.mmp_bundle_id}
                </AppTypography.Text>
              </div>
            </div>
          </div>
          <FinalActionDivider />
          <AppPageFooter>
            <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/app')}>
              취소
            </AppButton>
            <AppButton
              theme={'red'}
              size={'lg'}
              style={{ width: 138, marginLeft: 20 }}
              onClick={AU_handleSubmit(onClickAUSubmit)}
            >
              수정
            </AppButton>
          </AppPageFooter>
        </div>
      )}
    </>
  );
};
export default AppUpdate;
