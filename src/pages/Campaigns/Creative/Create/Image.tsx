import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import AppTypography from '@/components/AppTypography';
import AppUploader from '@/components/AppUploader';
import { WISEBIRDS_API } from '@apis/request';
import CreativeTooltip from '@pages/Campaigns/Creative/Create/CreativeTooltip';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { IMAGE_DIMENSIONS } from './variables';
import InfoTooltip from '@components/InfoTooltip';
import { AppButton } from '@components/AppButton';
import { FileType } from 'rsuite/esm/Uploader';

interface CreateImageProps {
  adAccountId: string;
  onResponseSend: (type: string, data: any) => void;
  onResponseRemove: (type: string, data: any) => void;
}

const CreateImage: React.FC<CreateImageProps> = ({ adAccountId, onResponseSend, onResponseRemove }) => {
  const [hasErrorFileKeys, setHasErrorFileKeys] = useState<string[]>([]);
  const {
    control,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext();
  const watchFiles = watch('image');
  const uploader = React.useRef<any>(null);
  const handleChangeFile = async (fileList: FileType[], onChange: any) => {
    // 검증단계
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
          fileKey: file.fileKey,
        };
      })
    );

    const hasErrorFiles = newFileDimensionList
      .filter((file) => {
        return (
          !IMAGE_DIMENSIONS.includes(`${file.dimension.width}x${file.dimension.height}`) ||
          ((file.type === 'image/jpeg' || file.type === 'image/png') && file.size > 1024 * 1024 * 0.5) ||
          (file.type === 'image/gif' && file.size > 1024 * 1024)
        );
      })
      .map((file) => file.fileKey);

    setHasErrorFileKeys(hasErrorFiles);

    if (hasErrorFiles.length > 0) {
      setError('image', {
        type: 'validate',
        message: '붉은 색으로 표시된 파일은 제외하고 업로드하세요.',
      });
    } else {
      clearErrors('image');
    }

    onChange(fileList);
  };

  const handleUploadSuccess = async (response: any, file: any) => {
    const bmp = await createImageBitmap(file.blobFile);
    const { width, height } = bmp;
    const obj = {
      fileKey: file.fileKey,
      type: 'IMAGE',
      original_filename: file.name,
      size_in_bytes: file.blobFile.size,
      image: {
        image_url: response.url,
        width: width,
        height: height,
        size_in_bytes: file.blobFile.size,
        auto_generated: false,
      },
    };
    onResponseSend('image > image', obj);
  };

  const handleUploadRemove = (file: any) => {
    onResponseRemove('image > image', file);
  };

  useEffect(() => {
    if (watchFiles?.length > 0 && hasErrorFileKeys?.length === 0) uploader?.current!.start();
  }, [hasErrorFileKeys, watchFiles]);

  return (
    <>
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
                <AppTypography.Label
                  isRequired
                  className={'text'}
                  accepter={'span'}
                  style={{ verticalAlign: 'middle' }}
                >
                  이미지
                </AppTypography.Label>
                <InfoTooltip inner={<CreativeTooltip type={'image > image'} />} placement={'right'} />
              </div>
              <div className={'inner__content'}>
                <div>
                  <Controller
                    name={'image'}
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <AppUploader
                        ref={uploader}
                        autoUpload={false}
                        fileList={field.value}
                        withCredentials={true}
                        multiple
                        accept={'.png, .jpg, .jpeg,.gif'}
                        action={`${WISEBIRDS_API}/v1/files`}
                        data={{
                          'asset-kind': 'CREATIVE',
                          'ad-account-id': `${adAccountId}`,
                        }}
                        onChange={(fileList) => {
                          handleChangeFile(fileList, field.onChange);
                        }}
                        onSuccess={(response, file) => handleUploadSuccess(response, file)}
                        onRemove={(file) => handleUploadRemove(file)}
                        info={'업로드 버튼을 눌러 이미지 파일을 업로드하세요.'}
                        renderFileInfo={(file, fileElement) => {
                          return (
                            <div
                              style={
                                hasErrorFileKeys.includes(file.fileKey as string)
                                  ? { color: 'var(--rs-state-error)', fontWeight: 'bold' }
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
                          return hasErrorFileKeys.length === 0
                            ? true
                            : '붉은 색으로 표시된 파일은 제외하고 업로드하세요.';
                        },
                      },
                    }}
                  />
                  <ErrorMessage
                    errors={errors}
                    name={'image'}
                    render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateImage;
