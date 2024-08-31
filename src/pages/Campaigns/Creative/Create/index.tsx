import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateImage from './Image';
import CreateVideo from './Video';
import CreateNative from './Native';
import AppPageHeader from '@/components/AppPageHeader';
import AppTypography from '@/components/AppTypography';
import AppDivider, { FinalActionDivider } from '@/components/AppDivider';
import AppRadioGroup from '@components/AppRadio';
import { AppInputCount } from '@components/AppInput';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import AppPageFooter from '@components/AppPageFooter';
import { AppButton } from '@components/AppButton';
import _ from 'lodash';
import { getMolocoToken } from '@apis/auth.api';
import { createCreativeBulk } from '@apis/creative.api';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { useQuery } from '@tanstack/react-query';
import { getProductDetail } from '@apis/product.api';
import { Loader } from 'rsuite';
import clsx from 'clsx';
import { CREATIVE_KR_TYPE } from '@pages/Campaigns/Creative/variables';

interface IndexProps {}

const creativeNameTypeList = [
  {
    label: '파일명',
    value: 'fileName',
  },
  {
    label: '수동입력',
    value: 'manual',
  },
];

const Index: React.FC<IndexProps> = () => {
  const { type, productId } = useParams();
  const navigate = useNavigate();
  const methods = useForm();
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const watchCreativeNameType = watch('creative.type');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  // 이미지
  const [image_imageList, setImage_ImageList] = useState<any[]>([]);
  // 동영상
  const [video_videoList, setVideo_VideoList] = useState<any[]>([]);
  const [video_endCardList, setVideo_EndCardList] = useState<any[]>([]);

  // 네이티브
  const [native_iconList, setNative_IconList] = useState<any[]>([]);
  const [native_image_imageList, setNative_Image_ImageList] = useState<any[]>([]);
  const [native_video_videoList, setNative_Video_VideoList] = useState<any[]>([]);
  const [native_video_endCardList, setNative_Video_EndCardList] = useState<any[]>([]);

  // Common Function

  const fetchProductDetail = useQuery(
    ['fetchProductDetail', productId],
    async () => {
      const result = await getProductDetail(productId);
      return result.data.product;
    },
    {
      enabled: !!productId,
    }
  );

  const handleCancelClick = () => {
    navigate('/campaigns/creative');
  };
  const onSubmit = (data: any) => {
    let payload: any[] = [];

    setLoading(true);
    if (type === 'image') {
      payload = _.map(image_imageList, (item: any) => {
        return {
          ..._.omit(item, ['fileKey']),
          title: data.creative.type === 'fileName' ? item.original_filename : data.creative.name,
        };
      });
    }
    if (type === 'video') {
      const videoList = video_videoList;
      const endCardList = video_endCardList;
      _.forEach(videoList, (videoItem: any) => {
        _.forEach(endCardList, (endCardItem: any) => {
          payload.push({
            ...videoItem,
            video: {
              ...videoItem.video,
              companion_images: [_.omit(endCardItem, ['fileKey'])],
            },
          });
        });
      });
      payload = _.map(payload, (item: any) => {
        return {
          ..._.omit(item, ['fileKey']),
          title: data.creative.type === 'fileName' ? item.original_filename : data.creative.name,
        };
      });
    }
    if (type === 'native') {
      if (data.native.type === 'IMAGE') {
        payload = _.map(native_image_imageList, (item: any) => {
          return {
            original_filename: item.original_filename,
            title: data.creative.type === 'fileName' ? item.original_filename : data.creative.name,
            native: {
              original_filename: item.original_filename,
              title: data.native.title,
              text: data.native.text,
              cta_text: data.native.cta_text,
              icon_image: {
                ..._.omit(native_iconList[0], ['fileKey']),
                image_url: native_iconList[0].image_url,
                width: native_iconList[0].width,
                height: native_iconList[0].height,
                size_in_bytes: native_iconList[0].size_in_bytes,
                auto_generated: false,
              },
              main_image: {
                image_url: item.image_url,
                width: item.width,
                height: item.height,
                size_in_bytes: item.size_in_bytes,
                auto_generated: false,
              },
            },
          };
        });
      }
      if (data.native.type === 'VIDEO') {
        // 동영상 forEach
        _.forEach(native_video_videoList, (videoItem: any) => {
          _.forEach(native_video_endCardList, (endCardItem: any) => {
            payload.push({
              title: data.creative.type === 'fileName' ? videoItem.original_filename : data.creative.name,
              original_filename: videoItem.original_filename,
              native: {
                original_filename: videoItem.original_filename,
                title: data.native.title,
                text: data.native.text,
                cta_text: data.native.cta_text,
                // main image (end_card)
                main_image: {
                  image_url: endCardItem.image_url,
                  width: endCardItem.width,
                  height: endCardItem.height,
                  size_in_bytes: endCardItem.size_in_bytes,
                  auto_generated: false,
                },
                // video (video)
                video: {
                  video_url: videoItem.video.video_url,
                  width: videoItem.video.width,
                  height: videoItem.video.height,
                  length_seconds: videoItem.video.length_seconds,
                  size_in_bytes: videoItem.video.size_in_bytes,
                  auto_generated: false,
                  companion_images: [],
                },
                // icon image (icon)
                icon_image: {
                  image_url: native_iconList[0].image_url,
                  width: native_iconList[0].width,
                  height: native_iconList[0].height,
                  size_in_bytes: native_iconList[0].size_in_bytes,
                  auto_generated: false,
                },
              },
            });
          });
        });
      }
    }

    createCreativeBulk({
      queryParams: {
        ad_account_id: selectedAdAccount,
        product_id: productId!,
      },
      bodyParams: { creatives: payload },
    })
      .then(() => {
        navigate('/campaigns/creative', { state: { tab: type?.toUpperCase() } });
      })
      .catch((err) => {
        alert(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResponseSend = (type: string, data: any) => {
    if (type === 'image > image') {
      setImage_ImageList((prevState) => [...prevState, data]);
    }
    if (type === 'video > video') {
      setVideo_VideoList((prevState) => [...prevState, data]);
    }
    if (type === 'video > end_card') {
      setVideo_EndCardList((prevState) => [...prevState, data]);
    }
    if (type === 'native > icon') {
      setNative_IconList((prevState) => [...prevState, data]);
    }
    if (type === 'native > image > image') {
      setNative_Image_ImageList((prevState) => [...prevState, data]);
    }
    if (type === 'native > video > video') {
      setNative_Video_VideoList((prevState) => [...prevState, data]);
    }
    if (type === 'native > video > end_card') {
      setNative_Video_EndCardList((prevState) => [...prevState, data]);
    }
  };

  const handleResponseRemove = (type: string, data: any) => {
    if (type === 'image > image') {
      setImage_ImageList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
    if (type === 'video > video') {
      setVideo_VideoList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
    if (type === 'video > end_card') {
      setVideo_EndCardList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
    if (type === 'native > icon') {
      setNative_IconList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
    if (type === 'native > image > image') {
      setNative_Image_ImageList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
    if (type === 'native > video > video') {
      setNative_Video_VideoList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
    if (type === 'native > video > end_card') {
      setNative_Video_EndCardList((prevState) => prevState.filter((item) => item.fileKey !== data.fileKey));
    }
  };

  useEffect(() => {
    if (!(type === 'image' || type === 'video' || type === 'native')) {
      alert('잘못된 접근입니다.');
    }
  }, [type]);

  useEffect(() => {
    if (_.isEmpty(accessToken)) {
      getMolocoToken().then((res) => {
        setAccessToken(res.data.token);
      });
    }
    // Cleanup - Reset
    return () => {
      setAccessToken('');
      reset();
    };
  }, []);

  if (!type) {
    return <div>잘못된 접근입니다.</div>;
  }
  return (
    <div>
      {(fetchProductDetail.isFetching || loading) && <Loader center style={{ zIndex: 99, minHeight: 1940 }} backdrop />}
      <AppPageHeader title={'소재 생성'} />
      <div style={{ padding: '16px 30px' }}>
        <FormProvider {...methods}>
          {/* 앱 이름 */}
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'} isRequired>
                앱 이름
              </AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{fetchProductDetail.data?.title}</AppTypography.Text>
            </div>
          </div>
          {/* 소재 유형 */}
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'} isRequired>
                소재 유형
              </AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{CREATIVE_KR_TYPE[type]}</AppTypography.Text>
            </div>
          </div>
          {/* 소재 명 */}
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'} isRequired>
                소재명
              </AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <Controller
                name={'creative.type'}
                control={control}
                defaultValue={'fileName'}
                render={({ field }) => (
                  <AppRadioGroup
                    inline
                    data={creativeNameTypeList}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />
              {watchCreativeNameType === 'manual' && (
                <>
                  <Controller
                    name={'creative.name'}
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                      <AppInputCount
                        maxLength={255}
                        className={clsx({ 'input-error': _.get(errors, 'creative.name') })}
                        style={{ marginLeft: 70 }}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{ required: '소재명을 입력하세요' }}
                  />
                  <div style={{ marginLeft: 70 }}>
                    <ErrorMessage
                      errors={errors}
                      name={'creative.name'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <AppDivider />
          {type === 'image' && (
            <CreateImage
              adAccountId={selectedAdAccount}
              onResponseSend={handleResponseSend}
              onResponseRemove={handleResponseRemove}
            />
          )}
          {type === 'video' && (
            <CreateVideo
              adAccountId={selectedAdAccount}
              onResponseSend={handleResponseSend}
              onResponseRemove={handleResponseRemove}
            />
          )}
          {type === 'native' && (
            <CreateNative
              adAccountId={selectedAdAccount}
              onResponseSend={handleResponseSend}
              onResponseRemove={handleResponseRemove}
            />
          )}
        </FormProvider>
      </div>
      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={handleCancelClick}>
          취소
        </AppButton>
        <AppButton theme={'red'} size={'lg'} style={{ width: 138, marginLeft: 20 }} onClick={handleSubmit(onSubmit)}>
          생성
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default Index;
