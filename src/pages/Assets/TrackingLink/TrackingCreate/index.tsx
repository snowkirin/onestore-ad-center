import React, { useEffect, useMemo, useState } from 'react';
import { AppInput, AppInputCount } from '@components/AppInput';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import { AppButton } from '@components/AppButton';
import { Controller, useForm } from 'react-hook-form';
import { useToaster } from 'rsuite';
import mmpData from '@utils/json/mmp.json';
import { createTrackingLink } from '@apis/tracking_link.api';
import { getProductList } from '@apis/product.api';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { REGEXP_URL } from '@utils/regexp';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';

interface CreateTrackingProps {}

const CreateTracking: React.FC<CreateTrackingProps> = () => {
  let adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  // Variables
  const toaster = useToaster();

  let navigate = useNavigate();
  const {
    handleSubmit: TRC_handleSubmit,
    control: TRC_control,
    getValues: TRC_getValues,
    formState: { errors: TRC_errors },
    reset: TRC_reset,
  } = useForm();

  // UseState
  const [productList, setProductList] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [mmp, setMmp] = useState('');
  const [isMmp, setIsMmp] = useState(false);
  const [productData, setProductData] = useState<any>([]);
  const [appName, setAppName] = useState('');

  // Function
  const fetchProductList = () => {
    const params = {
      ad_account_id: selectedAdAccount,
      show_deleted: false,
    };
    getProductList(params).then((res) => {
      const { data } = res;
      setProductList(data.products);
      if (data.products.length > 0) {
        const convertProductList = data.products.map((item: any) => {
          return {
            value: item.id,
            label: item.title,
          };
        });
        // 텍스트 오름차순
        convertProductList.sort((a: any, b: any) => {
          return a.label > b.label ? 1 : -1;
        });
        setProductData(convertProductList);
      }
    });
  };

  const onClickTRCSubmit = (data: any) => {
    const TRC_data = data;
    /**
     title: 트래킹 링크명
     device_os: OS
     description: 트래킹 링크 설명
     tracking_company: mmp
     click_through_link: 클릭 트래킹 URL
     예시: https://app.adjust.com/fa5ycof?adgroup=%{raw_app_bundle}&campaign=%{campaign}&campaign_id=%{campaign}&cost_amount=%{cost_amount}&cost_currency=%{cost_currency}&cost_type=%{cost_type}&creative=%{creative_id}&creative_id=%{creative_id}&gps_adid=%{a_idfa}&idfa=%{i_idfa}&impression_id=%{bid_id}&molo_click_id=%{mtid}&publisher_id=%{raw_app_bundle}&subpublisher_id=%{raw_app_bundle}
     view_through_link: 뷰 트래킹 URL
     */
    TRC_data.device_os = 'ANDROID';
    if (TRC_data.view_through_link.url === '') {
      delete TRC_data.view_through_link;
    }
    createTrackingLink(
      {
        ad_account_id: selectedAdAccount,
        product_id: TRC_getValues('productId'),
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

  useEffect(() => {
    fetchProductList();
  }, []);

  useEffect(() => {
    if (mmp === '' || mmp === null) {
      setIsMmp(false);
      TRC_reset({
        click_through_link: {
          url: '',
        },
        view_through_link: {
          url: '',
        },
      });
    } else {
      setIsMmp(true);
    }
  }, [mmp]);
  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'트래킹 링크 생성'} />
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
            <AppTypography.Label className={'text'}>앱 검색</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'productId'}
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppSelectPicker
                    cleanable={false}
                    searchable={false}
                    placeholder={'앱을 검색하세요.'}
                    block
                    value={field.value}
                    onSelect={(value: any, item: any) => {
                      setAppName(item.label);
                      field.onChange(value);
                    }}
                    data={productData}
                    renderValue={(value: any, item: any) => {
                      return (
                        <div style={{ display: 'flex' }}>
                          <div
                            style={{
                              paddingRight: '10px',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '400px',
                            }}
                          >
                            {item.label}
                          </div>
                        </div>
                      );
                    }}
                  />
                );
              }}
              rules={{
                required: '앱 검색에서 앱을 선택하세요.',
              }}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              앱 이름
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{appName || '-'}</AppTypography.Text>
            <ErrorMessage
              errors={TRC_errors}
              name={'productId'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
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
              control={TRC_control}
              render={({ field }) => (
                <AppInputTextArea
                  as="textarea"
                  height={100}
                  maxLength={200}
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
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppSelectPicker
                    placeholder={'MMP를 선택하세요.'}
                    block
                    data={mmpData}
                    cleanable={false}
                    searchable={false}
                    onChange={(value: any) => {
                      field.onChange(value);
                      setMmp(value);
                    }}
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
              control={TRC_control}
              render={({ field }) => {
                return (
                  <AppInput
                    as="textarea"
                    style={{ width: '100%', height: 100, resize: 'none' }}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={!isMmp}
                    value={field.value}
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
          생성
        </AppButton>
      </AppPageFooter>
    </div>
  );
};
export default CreateTracking;
