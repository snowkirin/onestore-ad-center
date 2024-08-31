import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdvertiserDetail, updateAdvertiserDetail, uploadBusinessLicense } from '@apis/account.api';
import { useQuery } from '@tanstack/react-query';
import AppTypography from '@components/AppTypography';
import DeleteIcon from '@assets/images/addIcons/multiplication-gray.svg';
import AppUploader from '@components/AppUploader';
import AppInputCount from '@components/AppInput/AppInputCount';
import { AppButton } from '@components/AppButton';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import {
  REGEXP_EMAIL,
  REGEXP_EN_KR_NUM_HYPHEN_SPACE,
  REGEXP_EN_KR_NUM_SPACE,
  REGEXP_EN_KR_SPACE,
  REGEXP_NUMBER,
} from '@utils/regexp';
import AppPageFooter from '@components/AppPageFooter';
import AppPageHeader from '@components/AppPageHeader';
import { ConfirmModal } from '@components/AppModal';

interface AccountAdvertiserUpdateProps {}

const ENV = import.meta.env;
const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;

const AccountAdvertiserUpdate: React.FC<AccountAdvertiserUpdateProps> = () => {
  const navigate = useNavigate();
  const { advertiserId: advertiserId } = useParams();

  const [isFile, setIsFile] = useState<boolean>(false);
  const [isUpload, setIsUpload] = useState<boolean>(false);

  // 저장값
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [businessLicenseFileName, setBusinessLicenseUrlFileName] = useState('');
  const [enabled, setEnabled] = useState(false);

  const [file, setFile] = useState('');

  // Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const {
    handleSubmit: AU_handleSubmit,
    control: AU_control,
    formState: { errors: AU_errors },
  } = useForm();

  const deleteFile = () => {
    setIsFile(false);
    setIsUpload(false);
  };

  const handleCancelClick = () => {
    setIsConfirmModalOpen(true);
    // if (!confirm('광고주 수정을 취소하시겠습니까? 수정한 내용은 저장되지 않습니다.')) {
    //   return;
    // }
    // navigate(`/account/advertiser/detail/${advertiserId}`);
  };

  const onClickAUSubmit = async (data: any) => {
    const AU_data = {
      ...data,
      business_license_file_name: isUpload ? businessLicenseFileName : '',
      enabled: enabled,
    };

    const blob = new Blob([JSON.stringify(AU_data)], { type: 'application/json' });
    let form = new FormData();
    if (file !== '') {
      form.append('business_license_file', file);
    }
    form.append('param', blob);

    updateAdvertiserDetail(advertiserId, form).then((res: any) => {
      if (res.status === 200) {
        navigate(`/account/advertiser/detail/${advertiserId}`);
      }
    });
  };

  const handleShouldQueueUpdate = (file: any) => {
    const size = Number(file[0].blobFile.size / 1024).toFixed(2);
    const reg = /(.*?)\.(jpg|jpeg|png|pdf)$/;
    if (Number(size) > 1024) {
      alert('파일 용량은 최대 1MB까지 업로드할 수 있습니다.');
      return false;
    } else if (!file[0].name.match(reg)) {
      alert('jpg, png, pdf 파일만 업로드할 수 있습니다.');
      return false;
    } else {
      return true;
    }
  };
  const fetchUploadFile = async (file: any) => {
    const formData = new FormData();
    if (file.length > 0) {
      setIsUpload(true);
      formData.append('business_license_file', file[0].blobFile);
      setFile(file[0].blobFile);
      uploadBusinessLicense(formData).then((res: any) => {
        if (res.status === 200) {
          const { data } = res;
          setBusinessLicenseUrl(data.file_path);
          setBusinessLicenseUrlFileName(data.file_name);
        }
      });
    } else {
      setIsUpload(false);
    }
  };

  const handleConfirmModalClose = () => {
    setIsConfirmModalOpen(false);
  };

  const fetchAdvertiserDetail = useQuery(
    ['fetchAdvertiserDetail', advertiserId],
    async () => {
      const { data } = await getAdvertiserDetail(advertiserId);
      if (data) {
        return {
          ...data,
          identity_number: data.identity_number || '-',
          birthday: data.birthday || '',
          businessLicenseUrl: data.business_license_url || '',
          businessLicenseFileName: data.business_license_file_name || '',
          invoice_manager: data.invoice_manager || '',
          invoice_email: data.invoice_email || '',
          invoice_tel: data.invoice_tel || '',
          memo: data.memo || '',
          enabled: data.enabled === '활성',
        };
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        if (data.business_license_file_name !== '' && data.business_license_file_name !== null) {
          setIsFile(true);
        } else {
          setIsFile(false);
        }
        setBusinessLicenseUrl(data.businessLicenseUrl);
        setBusinessLicenseUrlFileName(data.businessLicenseFileName);
        setEnabled(data.enabled);
      },
    }
  );
  return (
    <div>
      {!fetchAdvertiserDetail.isFetching && (
        <>
          <AppPageHeader title={'광고주 수정'} />
          <div className={'content__inner'}>
            {fetchAdvertiserDetail.data?.type === '사업자' ? (
              <>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.type}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>사용자등록번호</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>
                      {fetchAdvertiserDetail.data?.identity_number}
                    </AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>사업자등록증</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    {isFile ? (
                      <>
                        <a
                          href={`${WISEBIRDS_API}/v1/advertisers/${advertiserId}/business-license`}
                          style={{ marginRight: '10px' }}
                        >
                          {fetchAdvertiserDetail.data?.business_license_file_name}
                        </a>
                        <img src={DeleteIcon} onClick={deleteFile} style={{ cursor: 'pointer' }} alt={'삭제'} />
                      </>
                    ) : (
                      <>
                        <div className={'advertiser-fileUpload'}>
                          <form style={{ height: '32px' }}>
                            <AppUploader
                              action={''}
                              multiple={false}
                              autoUpload={false}
                              onChange={fetchUploadFile}
                              accept={'jpg, jpeg, png, pdf'}
                              shouldQueueUpdate={(fileList) => handleShouldQueueUpdate(fileList)}
                            >
                              {isUpload ? (
                                <div
                                  style={{
                                    display: 'none',
                                  }}
                                />
                              ) : (
                                <AppButton size={'md'}>업로드</AppButton>
                              )}
                            </AppUploader>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label isRequired className={'text'}>
                      광고주명
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'name'}
                      defaultValue={fetchAdvertiserDetail.data?.name}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={16}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                      rules={{
                        required: '광고주명을 입력해 주세요.',
                        minLength: {
                          value: 2,
                          message: '광고주명은 2~16자로 입력해 주세요',
                        },
                        pattern: {
                          value: REGEXP_EN_KR_NUM_SPACE,
                          message: '광고주명은 영문(대소), 한글, 숫자, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'name'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
                      영문(대소), 한글, 숫자, 띄어쓰기 사용 가능
                    </AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label isRequired className={'text'}>
                      대표자명
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'owner_name'}
                      defaultValue={fetchAdvertiserDetail.data?.owner_name}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={16}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                      rules={{
                        required: '대표자명을 입력해 주세요.',
                        minLength: {
                          value: 2,
                          message: '대표자명은 2~16자로 입력해 주세요',
                        },
                        pattern: {
                          value: REGEXP_EN_KR_SPACE,
                          message: '대표자명은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'owner_name'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
                      영문(대소), 한글, 띄어쓰기 사용 가능
                    </AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label isRequired className={'text'}>
                      사업자 주소
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'address'}
                      defaultValue={fetchAdvertiserDetail.data?.address}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={128}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                      rules={{
                        required: '사업자주소를 입력해 주세요.',
                        pattern: {
                          value: REGEXP_EN_KR_NUM_HYPHEN_SPACE,
                          message: '사업자 주소는 영문(대소), 한글, 숫자, -, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'address'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
                      영문(대소), 한글, 숫자, -, 띄어쓰기 사용 가능
                    </AppTypography.Text>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.type}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label isRequired className={'text'}>
                      광고주명
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'name'}
                      defaultValue={fetchAdvertiserDetail.data?.name}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={16}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                      rules={{
                        required: '광고주명을 입력해 주세요.',
                        minLength: {
                          value: 2,
                          message: '광고주명은 2~16자로 입력해 주세요',
                        },
                        pattern: {
                          value: REGEXP_EN_KR_NUM_SPACE,
                          message: '광고주명은 영문(대소), 한글, 숫자, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'name'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
                      영문(대소), 한글, 숫자, 띄어쓰기 사용 가능
                    </AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label isRequired className={'text'}>
                      생년월일
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'birthday'}
                      defaultValue={fetchAdvertiserDetail.data?.identity_number}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={8}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                      rules={{
                        required: '생년월일을 입력해 주세요.',
                        minLength: {
                          value: 8,
                          message: '생년월일 형식에 맞게 입력해 주세요.',
                        },
                        pattern: {
                          value: REGEXP_NUMBER,
                          message: '생년월일은 숫자만 입력해 주세요.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'birthday'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
                      숫자만 사용 가능
                    </AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label isRequired className={'text'}>
                      주소
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'address'}
                      defaultValue={fetchAdvertiserDetail.data?.address}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={128}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                      rules={{
                        required: '주소를 입력해 주세요.',
                        pattern: {
                          value: REGEXP_EN_KR_NUM_HYPHEN_SPACE,
                          message: '주소는 영문(대소), 한글, 숫자, -, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'address'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
                      영문(대소), 한글, 숫자, -, 띄어쓰기 사용 가능
                    </AppTypography.Text>
                  </div>
                </div>
              </>
            )}
            <AppDiver />
            <div className={'row'}>
              <div className={'col col-label--big'}>
                <AppTypography.Label className={'text'}>정산 담당자 이름</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'invoice_manager'}
                  defaultValue={fetchAdvertiserDetail.data?.invoice_manager}
                  control={AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={128}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    pattern: {
                      value: REGEXP_EN_KR_SPACE,
                      message: '이름은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AU_errors}
                  name={'invoice_manager'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} className={'text'}>
                  영문(대소), 한글, 띄어쓰기 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label--big'}>
                <AppTypography.Label className={'text'}>정산 담당자 이메일</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'invoice_email'}
                  defaultValue={fetchAdvertiserDetail.data?.invoice_email}
                  control={AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={80}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    pattern: {
                      value: REGEXP_EMAIL,
                      message: '이메일 형식에 맞게 입력해 주세요.(영문(대소), 숫자, @, 언더바(_), ., -, 사용 가능)',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AU_errors}
                  name={'invoice_email'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} className={'text'}>
                  영문(대소), 숫자, @, 언더바(_), ., -, 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label--big'}>
                <AppTypography.Label className={'text'}>정산 담당자 휴대폰 번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'invoice_tel'}
                  defaultValue={fetchAdvertiserDetail.data?.invoice_tel}
                  control={AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={11}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    pattern: {
                      value: REGEXP_NUMBER,
                      message: '휴대폰 번호는 숫자만 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AU_errors}
                  name={'invoice_tel'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} className={'text'}>
                  숫자만 사용 가능
                </AppTypography.Text>
              </div>
            </div>
          </div>
          <FinalActionDivider />
          <AppPageFooter>
            <AppButton size={'lg'} style={{ width: 138 }} onClick={handleCancelClick}>
              취소
            </AppButton>
            <AppButton
              size={'lg'}
              theme={'red'}
              style={{ width: 138, marginLeft: 15 }}
              onClick={AU_handleSubmit(onClickAUSubmit)}
            >
              저장
            </AppButton>
          </AppPageFooter>
        </>
      )}

      <ConfirmModal
        size={'xs'}
        open={isConfirmModalOpen}
        onClose={handleConfirmModalClose}
        onOk={() => navigate(`/account/advertiser/detail/${advertiserId}`)}
        okText={'확인'}
        content={
          <AppTypography.Text>
            광고주 수정을 취소하시겠습니까?
            <br />
            수정한 내용은 저장되지 않습니다.
          </AppTypography.Text>
        }
        title={'광고주 수정 취소'}
      />
    </div>
  );
};

export default AccountAdvertiserUpdate;
