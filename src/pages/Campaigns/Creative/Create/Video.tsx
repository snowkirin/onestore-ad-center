import React, { useEffect, useState } from 'react';
import AppTypography from '@components/AppTypography';
import { Controller, useFormContext } from 'react-hook-form';
import AppUploader from '@components/AppUploader';
import { WISEBIRDS_API } from '@apis/request';
import CreativeTooltip from '@pages/Campaigns/Creative/Create/CreativeTooltip';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import _ from 'lodash';
import { getCreativeVideoInfo } from '@apis/creative.api';
import { calcRatio } from '@utils/functions';
import InfoTooltip from '@components/InfoTooltip';
import { AppButton } from '@components/AppButton';
import { FileType } from 'rsuite/Uploader';

interface CreateVideoProps {
  adAccountId: string;
  onResponseSend: (type: string, data: any) => void;
  onResponseRemove: (type: string, data: any) => void;
}

const CreateVideo: React.FC<CreateVideoProps> = ({ adAccountId, onResponseSend, onResponseRemove }) => {
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
    watch,
  } = useFormContext();

  const watchVideos = watch('video.video', []);
  const watchBanners = watch('video.end_card', []);
  const videoUploader = React.useRef<any>(null);
  const endBannerUploader = React.useRef<any>(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [hasBannerError, setHasBannerError] = useState(false);
  const [uploadedVideoDimension, setUploadedVideoDimension] = useState('');

  const handleChangeVideo = async (fileList: FileType[], onChange: any) => {
    //한 개만 업로드 가능
    if (fileList.length === 0) {
      clearErrors('video.video');
      setHasVideoError(false);
      setUploadedVideoDimension('');
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
      setUploadedVideoDimension(`${item.width}x${item.height}`);
      return (
        item.suffix === 'mp4' &&
        item.width >= 640 &&
        item.size <= 1024 * 1024 * 10 &&
        (ratio === '16:9' || ratio === '9:16' || ratio === '1:1')
      );
    });

    if (checkResult) {
      clearErrors('video.video');
      setHasVideoError(false);
    } else {
      setError('video.video', {
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
      clearErrors('video.end_card');
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
      if (
        item.dimension.width >= 320 &&
        `${item.dimension.width}x${item.dimension.height}` === uploadedVideoDimension
      ) {
        if ((item.type === 'image/jpeg' || item.type === 'image/png') && item.size <= 1024 * 1024 * 0.5) {
          return true;
        }
        if (item.type === 'image/gif' && item.size <= 1024 * 1024) {
          return true;
        }
      }
      return false;
    });

    if (checkResult) {
      clearErrors('video.end_card');
      setHasBannerError(false);
    } else {
      setError('video.end_card', {
        type: 'validate',
        message: '붉은 색으로 표시된 파일은 제외하고 업로드하세요.',
      });
      setHasBannerError(true);
    }
    onChange(fileList);
  };

  const handleUploadSuccess = async (type: string, response: any, file: any) => {
    if (type === 'video > video') {
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
            auto_endcard: false,
          },
        };
        onResponseSend(type, obj);
      });
    }
    if (type === 'video > end_card') {
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
    if (watchVideos?.length > 0 && !hasVideoError) videoUploader?.current!.start();
  }, [watchVideos, hasVideoError]);

  useEffect(() => {
    if (watchBanners?.length > 0 && !hasBannerError) endBannerUploader?.current!.start();
  }, [watchBanners, hasBannerError]);

  return (
    <div className={'row'}>
      <div className={'col col-label'}>
        <AppTypography.Label className={'text'} isRequired>
          소재 스펙
        </AppTypography.Label>
      </div>
      <div className={'col col-input'}>
        <div className={'inner'}>
          <div className={'inner__wrapper'}>
            <div className={'inner__label'}>
              <AppTypography.Label isRequired className={'text'} accepter={'span'}>
                동영상
              </AppTypography.Label>
              <InfoTooltip inner={<CreativeTooltip type={'video > video'} />} placement={'right'} />
            </div>
            <div className={'inner__content'}>
              <div>
                <Controller
                  name={'video.video'}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => {
                    return (
                      <AppUploader
                        action={`${WISEBIRDS_API}/v1/files`}
                        autoUpload={false}
                        data={{
                          'asset-kind': 'CREATIVE',
                          'ad-account-id': `${adAccountId}`,
                        }}
                        multiple={false}
                        ref={videoUploader}
                        disabled={watchVideos.length === 1}
                        fileList={field.value}
                        accept={'.mp4'}
                        onChange={(fileList) => {
                          handleChangeVideo(fileList, field.onChange);
                        }}
                        onSuccess={(response, file) => handleUploadSuccess('video > video', response, file)}
                        onRemove={(file) => handleUploadRemove('video > video', file)}
                        withCredentials={true}
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
                    );
                  }}
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
                  name={'video.video'}
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
              <InfoTooltip inner={<CreativeTooltip type={'video > end_card'} />} placement={'right'} />
            </div>
            <div className={'inner__content'}>
              <div>
                <Controller
                  name={'video.end_card'}
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
                      ref={endBannerUploader}
                      multiple={false}
                      disabled={watchVideos?.length === 0 || hasVideoError || field.value.length === 1}
                      fileList={field.value}
                      accept={'.png, .jpg, .jpeg,.gif'}
                      onChange={(fileList) => {
                        handleChangeBanner(fileList, field.onChange);
                      }}
                      onSuccess={(response, file) => handleUploadSuccess('video > end_card', response, file)}
                      onRemove={(file) => handleUploadRemove('video > end_card', file)}
                      withCredentials={true}
                      info={'동영상 파일을 먼저 업로드 한 후 업로드 버튼을 눌러 이미지 파일을 업로드하세요.'}
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
                  name={'video.end_card'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;
