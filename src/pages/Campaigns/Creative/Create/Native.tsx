import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import AppTypography from '@components/AppTypography';
import AppUploader from '@components/AppUploader';
import { WISEBIRDS_API } from '@apis/request';
import AppRadioGroup from '@components/AppRadio';
import { AppInputCount } from '@components/AppInput';
import CreativeTooltip from '@pages/Campaigns/Creative/Create/CreativeTooltip';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import InfoTooltip from '@components/InfoTooltip';
import clsx from 'clsx';
import _ from 'lodash';
import { FileType } from 'rsuite/Uploader';
import { calcRatio } from '@utils/functions';
import { AppButton } from '@components/AppButton';
import {
  NATIVE_IMAGE_IMAGE_DIMENSIONS,
  NATIVE_VIDEO_END_CARD_DIMENSIONS,
} from '@pages/Campaigns/Creative/Create/variables';
import { getCreativeVideoInfo } from '@apis/creative.api';

interface CreateNativeProps {
  adAccountId: string;
  onResponseSend: (type: string, data: any) => void;
  onResponseRemove: (type: string, data: any) => void;
}

const CreateNative: React.FC<CreateNativeProps> = ({ adAccountId, onResponseSend, onResponseRemove }) => {
  const {
    control,
    watch,
    clearErrors,
    setError,
    formState: { errors },
  } = useFormContext();

  const watchNativeType = watch('native.type', 'IMAGE');
  const watchIcons = watch('native.icon', []);
  const watchImages = watch('native.image', []);
  const watchVideos = watch('native.video', []);
  const watchBanners = watch('native.end_card', []);
  const iconUploader = React.useRef<any>(null);
  const imageUploader = React.useRef<any>(null);
  const videoUploader = React.useRef<any>(null);
  const endBannerUploader = React.useRef<any>(null);
  const [hasIconError, setHasIconError] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [hasBannerError, setHasBannerError] = useState(false);

  const handleChangeIcon = async (fileList: FileType[], onChange: any) => {
    //한 개만 업로드 가능
    if (fileList.length === 0) {
      clearErrors('native.icon');
      setHasIconError(false);
      onChange(fileList);

      return;
    }

    const newFileDimensionList = await Promise.all(
      fileList.map(async (file: any) => {
        const bmp = await createImageBitmap(file.blobFile);
        const { width, height } = bmp;
        bmp.close();
        return {
          // 확장자 (
          type: file.blobFile.type,
          size: file.blobFile.size,
          dimension: {
            width,
            height,
          },
        };
      })
    );

    const checkResult = _.every(newFileDimensionList, (item) => {
      const ratio = calcRatio(item.dimension.width, item.dimension.height);
      return (
        item.dimension.width >= 256 &&
        ratio === '1:1' &&
        (((item.type === 'image/jpeg' || item.type === 'image/png') && item.size <= 1024 * 1024 * 0.5) ||
          (item.type === 'image/gif' && item.size <= 1024 * 1024))
      );
    });

    if (checkResult) {
      clearErrors('native.icon');
      setHasIconError(false);
    } else {
      setError('native.icon', {
        type: 'validate',
        message: '붉은 색으로 표시된 파일은 제외하고 업로드하세요.',
      });
      setHasIconError(true);
    }
    onChange(fileList);
  };

  const handleChangeImage = async (fileList: FileType[], onChange: any) => {
    //한 개만 업로드 가능
    if (fileList.length === 0) {
      clearErrors('native.image');
      setHasImageError(false);
      onChange(fileList);
      onChange(fileList);
      return;
    }

    const newFileDimensionList = await Promise.all(
      fileList.map(async (file: any) => {
        const bmp = await createImageBitmap(file.blobFile);
        const { width, height } = bmp;
        bmp.close();
        return {
          // 확장자 (
          type: file.blobFile.type,
          size: file.blobFile.size,
          dimension: {
            width,
            height,
          },
        };
      })
    );

    const checkResult = _.every(newFileDimensionList, (item) => {
      return (
        NATIVE_IMAGE_IMAGE_DIMENSIONS.includes(`${item.dimension.width}x${item.dimension.height}`) &&
        (((item.type === 'image/jpeg' || item.type === 'image/png') && item.size <= 1024 * 1024 * 0.5) ||
          (item.type === 'image/gif' && item.size <= 1024 * 1024))
      );
    });

    if (checkResult) {
      clearErrors('native.image');
      setHasImageError(false);
    } else {
      setError('native.image', {
        type: 'validate',
        message: '붉은 색으로 표시된 파일은 제외하고 업로드하세요.',
      });
      setHasImageError(true);
    }
    onChange(fileList);
  };

  const handleChangeVideo = async (fileList: FileType[], onChange: any) => {
    //한 개만 업로드 가능
    if (fileList.length === 0) {
      clearErrors('native.video');
      setHasVideoError(false);
      onChange(fileList);

      return;
    }

    const formData = new FormData();
    fileList.forEach((ele: any) => {
      formData.append('files', ele.blobFile);
    });
    const result = await getCreativeVideoInfo(formData);
    const checkResult = _.every(result.data, (item: any) => {
      const ratio = calcRatio(item.width, item.height);
      return (
        item.suffix === 'mp4' &&
        item.width >= 640 &&
        item.size <= 1024 * 1024 * 10 &&
        (ratio === '16:9' || ratio === '9:16' || ratio === '1:1') &&
        item.seconds >= 6 &&
        item.seconds <= 100 &&
        item.frame_rate >= 24
      );
    });

    if (checkResult) {
      clearErrors('native.video');
      setHasVideoError(false);
    } else {
      setError('native.video', {
        type: 'validate',
        message: '붉은 색으로 표시된 파일은 제외하고 업로드하세요.',
      });
      setHasVideoError(true);
    }
    onChange(fileList);
  };

  const handleChangeBanner = async (fileList: FileType[], onChange: any) => {
    //한 개만 업로드 가능
    if (fileList.length === 0) {
      clearErrors('native.end_card');
      setHasBannerError(false);
      onChange(fileList);

      return;
    }

    const newFileDimensionList = await Promise.all(
      fileList.map(async (file: any) => {
        const bmp = await createImageBitmap(file.blobFile);
        const { width, height } = bmp;
        bmp.close();
        return {
          // 확장자 (
          type: file.blobFile.type,
          size: file.blobFile.size,
          dimension: {
            width,
            height,
          },
        };
      })
    );

    const checkResult = _.every(newFileDimensionList, (item) => {
      return (
        NATIVE_VIDEO_END_CARD_DIMENSIONS.includes(`${item.dimension.width}x${item.dimension.height}`) &&
        (((item.type === 'image/jpeg' || item.type === 'image/png') && item.size <= 1024 * 1024 * 0.5) ||
          (item.type === 'image/gif' && item.size <= 1024 * 1024))
      );
    });
    if (checkResult) {
      clearErrors('native.end_card');
      setHasBannerError(false);
    } else {
      setError('native.end_card', {
        type: 'validate',
        message: '붉은 색으로 표시된 파일은 제외하고 업로드하세요.',
      });
      setHasBannerError(true);
    }
    onChange(fileList);
  };

  const handleUploadSuccess = async (type: string, response: any, file: any) => {
    if (type === 'native > icon') {
      const bmp = await createImageBitmap(file.blobFile);
      const { width, height } = bmp;
      const obj = {
        fileKey: file.fileKey,
        original_filename: file.name,
        image_url: response.url,
        size_in_bytes: file.blobFile.size,
        width: width,
        height: height,
        auto_generated: false,
      };
      onResponseSend(type, obj);
    }
    if (type === 'native > image > image') {
      const bmp = await createImageBitmap(file.blobFile);
      const { width, height } = bmp;
      const obj = {
        fileKey: file.fileKey,
        original_filename: file.name,
        image_url: response.url,
        size_in_bytes: file.blobFile.size,
        width: width,
        height: height,
        auto_generated: false,
      };
      onResponseSend(type, obj);
    }
    if (type === 'native > video > video') {
      const video = document.createElement('video');
      video.src = response.url;
      video.addEventListener('loadeddata', function (e: any) {
        const obj = {
          fileKey: file.fileKey,
          original_filename: file.name,
          video: {
            video_url: response.url,
            width: e.target.videoWidth,
            height: e.target.videoHeight,
            length_seconds: e.target.duration.toFixed(),
            size_in_bytes: file.blobFile.size,
            auto_end_card: false,
          },
        };
        onResponseSend(type, obj);
      });
    }
    if (type === 'native > video > end_card') {
      const bmp = await createImageBitmap(file.blobFile);
      const { width, height } = bmp;
      const obj = {
        fileKey: file.fileKey,
        image_url: response.url,
        size_in_bytes: file.blobFile.size,
        width: width,
        height: height,
        auto_generated: false,
      };
      onResponseSend(type, obj);
    }
  };
  const handleUploadRemove = (type: string, file: any) => {
    onResponseRemove(type, file);
  };

  useEffect(() => {
    if (watchIcons?.length > 0 && !hasIconError) iconUploader?.current!.start();
  }, [watchIcons, hasIconError]);

  useEffect(() => {
    if (watchImages?.length > 0 && !hasImageError) imageUploader?.current!.start();
  }, [watchImages, hasImageError]);

  useEffect(() => {
    if (watchVideos?.length > 0 && !hasVideoError) videoUploader?.current!.start();
  }, [watchVideos, hasVideoError]);

  useEffect(() => {
    if (watchBanners?.length > 0 && !hasBannerError) endBannerUploader?.current!.start();
  }, [watchBanners, hasBannerError]);

  return (
    <div>
      <div className={'row'}>
        <div className={'col col-label'}>
          <AppTypography.Label className={'text'} isRequired>
            소재 스펙
          </AppTypography.Label>
        </div>

        <div className={'col col-input'}>
          <div className={'inner'}>
            {/* 네이티브 유형*/}
            <div className={'inner__wrapper'}>
              <div className={'inner__label'}>
                <AppTypography.Label isRequired className={'text'}>
                  네이티브 유형
                </AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                {/* 라디오 박스.*/}
                <div>
                  <Controller
                    name={'native.type'}
                    control={control}
                    defaultValue={'IMAGE'}
                    render={({ field }) => (
                      <AppRadioGroup
                        inline
                        data={[
                          {
                            label: '이미지',
                            value: 'IMAGE',
                          },
                          {
                            label: '동영상',
                            value: 'VIDEO',
                          },
                        ]}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          clearErrors('native.title');
                          clearErrors('native.text');
                          clearErrors('native.cta_text');
                          clearErrors('native.icon');
                          clearErrors('native.image');
                          clearErrors('native.video');
                          clearErrors('native.end_card');
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            {/* 앱 이름 */}
            <div className={'inner__wrapper'}>
              <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 이름
                </AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <div>
                  <Controller
                    name={'native.title'}
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                      <AppInputCount
                        className={clsx({ 'input-error': _.get(errors, 'native.title') })}
                        maxLength={25}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{
                      required: '앱 이름을 입력하세요.',
                    }}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={'native.title'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
            {/* 설명 */}
            <div className={'inner__wrapper'}>
              <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                <AppTypography.Label isRequired className={'text'}>
                  설명
                </AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <div>
                  <Controller
                    name={'native.text'}
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                      <AppInputCount
                        className={clsx({ 'input-error': _.get(errors, 'native.text') })}
                        maxLength={90}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{
                      required: '설명을 입력하세요.',
                    }}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={'native.text'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
            {/* CTA */}
            <div className={'inner__wrapper'}>
              <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                <AppTypography.Label isRequired className={'text'}>
                  CTA
                </AppTypography.Label>
              </div>
              <div className={'inner__content'}>
                <div>
                  <Controller
                    name={'native.cta_text'}
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                      <AppInputCount
                        className={clsx({ 'input-error': _.get(errors, 'native.cta_text') })}
                        maxLength={15}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{
                      required: 'CTA를 입력하세요.',
                    }}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={'native.cta_text'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
            {/* 아이콘 */}
            <div className={'inner__wrapper'}>
              <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                <AppTypography.Label isRequired className={'text'} accepter={'span'}>
                  아이콘
                </AppTypography.Label>
                <InfoTooltip inner={<CreativeTooltip type={'native > image > icon'} />} placement={'right'} />
              </div>
              <div className={'inner__content'}>
                <div>
                  <Controller
                    name={'native.icon'}
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <AppUploader
                        action={`${WISEBIRDS_API}/v1/files`}
                        autoUpload={false}
                        disabled={field.value.length >= 1}
                        data={{
                          'asset-kind': 'CREATIVE',
                          'ad-account-id': `${adAccountId}`,
                        }}
                        ref={iconUploader}
                        withCredentials={true}
                        fileList={field.value}
                        accept={'.png, .jpg, .jpeg,.gif'}
                        onChange={(fileList) => {
                          handleChangeIcon(fileList, field.onChange);
                        }}
                        onSuccess={(response, file) => handleUploadSuccess('native > icon', response, file)}
                        onRemove={(file) => handleUploadRemove('native > icon', file)}
                        info={'업로드 버튼을 눌러 아이콘 파일을 업로드하세요.'}
                        renderFileInfo={(file, fileElement) => {
                          return (
                            <div
                              style={
                                hasIconError
                                  ? {
                                      color: 'var(--rs-state-error)',
                                      fontWeight: 'bold',
                                    }
                                  : undefined
                              }
                            >
                              {fileElement}
                            </div>
                          );
                        }}
                      >
                        <AppButton theme={'red'} size={'md'}>
                          업로드
                        </AppButton>
                      </AppUploader>
                    )}
                    rules={{
                      required: '아이콘 파일을 업로드하세요.',
                      validate: {
                        custom: () => {
                          return !hasIconError || '붉은 색으로 표시된 파일은 제외하고 업로드하세요.';
                        },
                      },
                    }}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={'native.icon'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
            {watchNativeType === 'IMAGE' && (
              <>
                <div className={'inner__wrapper'}>
                  <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                    <AppTypography.Label isRequired className={'text'} accepter={'span'}>
                      이미지
                    </AppTypography.Label>
                    <InfoTooltip inner={<CreativeTooltip type={'native > image > image'} />} placement={'right'} />
                  </div>
                  <div className={'inner__content'}>
                    <div>
                      <Controller
                        name={'native.image'}
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <AppUploader
                            action={`${WISEBIRDS_API}/v1/files`}
                            autoUpload={false}
                            data={{
                              'asset-kind': 'CREATIVE',
                              'ad-account-id': `${adAccountId}`,
                            }}
                            disabled={field.value.length >= 1}
                            ref={imageUploader}
                            withCredentials={true}
                            multiple={false}
                            fileList={field.value}
                            accept={'.png, .jpg, .jpeg,.gif'}
                            onChange={(fileList) => {
                              handleChangeImage(fileList, field.onChange);
                            }}
                            onSuccess={(response, file) =>
                              handleUploadSuccess('native > image > image', response, file)
                            }
                            onRemove={(file) => handleUploadRemove('native > image > image', file)}
                            info={'업로드 버튼을 눌러 이미지 파일을 업로드하세요.'}
                            renderFileInfo={(file, fileElement) => {
                              return (
                                <div
                                  style={
                                    hasImageError
                                      ? {
                                          color: 'var(--rs-state-error)',
                                          fontWeight: 'bold',
                                        }
                                      : undefined
                                  }
                                >
                                  {fileElement}
                                </div>
                              );
                            }}
                          >
                            <AppButton theme={'red'} size={'md'}>
                              업로드
                            </AppButton>
                          </AppUploader>
                        )}
                        rules={{
                          required: '이미지 파일을 업로드하세요.',
                          validate: {
                            custom: () => {
                              return !hasImageError || '붉은 색으로 표시된 파일은 제외하고 업로드하세요.';
                            },
                          },
                        }}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={'native.image'}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 이미지 */}

            {/* nativeType이 VIDEO 일 경우 - 종료 배너 */}
            {watchNativeType === 'VIDEO' && (
              <>
                <div className={'inner__wrapper'}>
                  <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                    <AppTypography.Label isRequired className={'text'} accepter={'span'}>
                      동영상
                    </AppTypography.Label>
                    <InfoTooltip inner={<CreativeTooltip type={'native > video > video'} />} placement={'right'} />
                  </div>
                  <div className={'inner__content'}>
                    <div>
                      <Controller
                        name={'native.video'}
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <AppUploader
                            action={`${WISEBIRDS_API}/v1/files`}
                            autoUpload={false}
                            data={{
                              'asset-kind': 'CREATIVE',
                              'ad-account-id': `${adAccountId}`,
                            }}
                            disabled={field.value.length >= 1}
                            ref={videoUploader}
                            withCredentials={true}
                            accept={'video/mp4'}
                            multiple={false}
                            fileList={field.value}
                            onChange={(fileList) => {
                              handleChangeVideo(fileList, field.onChange);
                            }}
                            onSuccess={(response, file) =>
                              handleUploadSuccess('native > video > video', response, file)
                            }
                            onRemove={(file) => handleUploadRemove('native > video > video', file)}
                            info={'업로드 버튼을 눌러 동영상 파일을 업로드하세요.'}
                            renderFileInfo={(file, fileElement) => {
                              return (
                                <div
                                  style={
                                    hasVideoError
                                      ? {
                                          color: 'var(--rs-state-error)',
                                          fontWeight: 'bold',
                                        }
                                      : undefined
                                  }
                                >
                                  {fileElement}
                                </div>
                              );
                            }}
                          >
                            <AppButton theme={'red'} size={'md'}>
                              업로드
                            </AppButton>
                          </AppUploader>
                        )}
                        rules={{
                          required: '동영상 파일을 업로드하세요.',
                          validate: {
                            custom: () => {
                              return !hasVideoError || '붉은 색으로 표시된 파일은 제외하고 업로드하세요.';
                            },
                          },
                        }}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={'native.video'}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </div>
                  </div>
                </div>
                <div className={'inner__wrapper'}>
                  <div className={'inner__label'} style={{ margin: '30px 0 0' }}>
                    <AppTypography.Label isRequired className={'text'} accepter={'span'}>
                      종료 배너
                    </AppTypography.Label>
                    <InfoTooltip inner={<CreativeTooltip type={'native > video > end_card'} />} placement={'right'} />
                  </div>
                  <div className={'inner__content'}>
                    <div>
                      <Controller
                        name={'native.end_card'}
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <AppUploader
                            action={`${WISEBIRDS_API}/v1/files`}
                            autoUpload={false}
                            data={{
                              'asset-kind': 'CREATIVE',
                              'ad-account-id': `${adAccountId}`,
                            }}
                            disabled={field.value.length >= 1}
                            ref={endBannerUploader}
                            multiple={false}
                            withCredentials={true}
                            fileList={field.value}
                            accept={'.png, .jpg, .jpeg,.gif'}
                            onChange={(fileList) => {
                              handleChangeBanner(fileList, field.onChange);
                            }}
                            onSuccess={(response, file) =>
                              handleUploadSuccess('native > video > end_card', response, file)
                            }
                            onRemove={(file) => handleUploadRemove('native > video > end_card', file)}
                            info={'업로드 버튼을 눌러 이미지 파일을 업로드하세요.'}
                            renderFileInfo={(file, fileElement) => {
                              return (
                                <div
                                  style={
                                    hasBannerError
                                      ? {
                                          color: 'var(--rs-state-error)',
                                          fontWeight: 'bold',
                                        }
                                      : undefined
                                  }
                                >
                                  {fileElement}
                                </div>
                              );
                            }}
                          >
                            <AppButton theme={'red'} size={'md'}>
                              업로드
                            </AppButton>
                          </AppUploader>
                        )}
                        rules={{
                          required: '종료 배너 파일을 업로드하세요.',
                          validate: {
                            custom: () => {
                              return !hasBannerError || '붉은 색으로 표시된 파일은 제외하고 업로드하세요.';
                            },
                          },
                        }}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={'native.end_card'}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNative;
