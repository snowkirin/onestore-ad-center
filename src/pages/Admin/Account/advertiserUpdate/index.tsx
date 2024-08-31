import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  chkAdvertiserDisabled,
  getAdvertiserDetail,
  updateAdvertiserDetail,
  uploadBusinessLicense,
} from '@apis/account.api';
import AppTypography from '@components/AppTypography';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import DeleteIcon from '@assets/images/addIcons/multiplication-gray.svg';
import AppUploader from '@components/AppUploader';
import AppInputCount from '@components/AppInput/AppInputCount';
import AppInputTextArea from '../../../../components/AppInput/AppInputTextArea';
import AppToggle from '@components/AppToggle';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { WISEBIRDS_API } from '@apis/request';
import {
  REGEXP_EMAIL,
  REGEXP_EN_KR_NUM_HYPHEN_SPACE,
  REGEXP_EN_KR_NUM_SPACE,
  REGEXP_EN_KR_SPACE,
  REGEXP_NUMBER,
} from '@utils/regexp';
import _ from 'lodash';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';

interface AdminAccountAdvertiserUpdateProps {}

const AdminAccountAdvertiserUpdate: React.FC<AdminAccountAdvertiserUpdateProps> = () => {
  const myRole = sessionStorage.getItem('role');

  const navigate = useNavigate();
  const { advertiserId: advertiserId } = useParams();
  const [isFile, setIsFile] = useState<boolean>(false);
  const [isUpload, setIsUpload] = useState<boolean>(false);

  // 저장값
  const [name, setName] = useState('');
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [businessLicenseFileName, setBusinessLicenseUrlFileName] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [adAccounts, setAdAccounts] = useState<any>([]);

  const [file, setFile] = useState('');

  const {
    handleSubmit: AD_AU_handleSubmit,
    control: AD_AU_control,
    formState: { errors: AD_AU_errors },
  } = useForm();

  const deleteFile = () => {
    setIsFile(false);
    setIsUpload(false);
    setBusinessLicenseUrl('');
    setBusinessLicenseUrlFileName('');
  };

  const cancelSave = () => {
    if (!confirm('광고주 수정을 취소하시겠습니까? 수정한 내용은 저장되지 않습니다.')) {
      return;
    }
    navigate('/admin/account/advertiser');
  };

  const setEnabledToggle = (value: boolean) => {
    if (!value) {
      if (
        !confirm(
          '광고주 비활성 시 소속된 모든 회원의 로그인이 제한되며, 캠페인 상태는 자동으로 변경되지 않습니다. 계속하시겠습니까?'
        )
      ) {
        return;
      }
    }
    const params = {
      enabled: value,
    };
    chkAdvertiserDisabled(advertiserId, params)
      .then((res) => {
        if (res) {
          setEnabled(value);
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          alert(err.response.data.message);
        }
      });
  };

  const onClickADAUSubmit = async (data: any) => {
    const AD_AU_data = {
      ...data,
      business_license_file_name: isUpload ? businessLicenseFileName : '',
      enabled: enabled,
    };

    const blob = new Blob([JSON.stringify(AD_AU_data)], { type: 'application/json' });
    let form = new FormData();
    if (file !== '') {
      form.append('business_license_file', file);
    }
    form.append('param', blob);

    updateAdvertiserDetail(advertiserId, form).then((res: any) => {
      if (res.status === 200) {
        navigate('/admin/account/advertiser');
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

  const fetchAdvertiserDetail = useQuery(
    ['fetchAdvertiserDetail', advertiserId],
    async () => {
      const { data } = await getAdvertiserDetail(advertiserId);
      if (data) {
        return {
          ...data,
          enabled: data.enabled === '활성',
          name: data.name || '',
          owner_name: data.owner_name || '',
          address: data.address || '',
          business_license_url: data.business_license_url || '',
          business_license_file_name: data.business_license_file_name || '',
          birthday: data.birthday || '',
          invoice_manager: data.invoice_manager || '',
          invoice_email: data.invoice_email || '',
          invoice_tel: data.invoice_tel || '',
          memo: data.memo || '',
          ad_accounts: data.ad_accounts || [],
        };
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(advertiserId),
      onSuccess: (data: any) => {
        if (data.business_license_file_name !== '' && data.business_license_file_name !== null) {
          setIsFile(true);
        } else {
          setIsFile(false);
        }
        setAdAccounts(data.ad_accounts);
        setName(data.name);
        setEnabled(data.enabled);
        setBusinessLicenseUrl(data.business_license_url);
        setBusinessLicenseUrlFileName(data.business_license_file_name);
      },
    }
  );

  return (
    <>
      {!fetchAdvertiserDetail.isFetching && (
        <div>
          <AppPageHeader title={'광고주 조회/수정'} />
          <div className={'content__inner'}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: 570 }}>
              <div style={{ marginRight: '10px' }}>{enabled ? '활성' : '비활성'}</div>
              <AppToggle checked={enabled} onChange={() => setEnabledToggle(!enabled)} />
            </div>

            {fetchAdvertiserDetail.data?.type === '사업자' ? (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.type}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>사용자등록번호</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>
                      {fetchAdvertiserDetail.data?.identity_number}
                    </AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>사업자등록증</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    {isFile ? (
                      <>
                        <a
                          href={`${WISEBIRDS_API}/v1/advertisers/${advertiserId}/business-license`}
                          className={'text'}
                          style={{ marginRight: 10 }}
                        >
                          {fetchAdvertiserDetail.data?.business_license_file_name}
                        </a>
                        <img src={DeleteIcon} onClick={deleteFile} style={{ cursor: 'pointer' }} alt={'삭제'} />
                      </>
                    ) : (
                      <div className={'advertiser-fileUpload'}>
                        <form style={{ height: 32 }}>
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
                    )}
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      광고주명
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'name'}
                      defaultValue={fetchAdvertiserDetail.data?.name}
                      control={AD_AU_control}
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
                      errors={AD_AU_errors}
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
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>대표자명</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'owner_name'}
                      defaultValue={fetchAdvertiserDetail.data?.owner_name}
                      control={AD_AU_control}
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
                      errors={AD_AU_errors}
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
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      사업자 주소
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'address'}
                      defaultValue={fetchAdvertiserDetail.data?.address}
                      control={AD_AU_control}
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
                      errors={AD_AU_errors}
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
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>광고계정</AppTypography.Label>
                  </div>
                  <div className={'col col-input'} style={{ width: 'calc(100% - 120px)' }}>
                    <div style={{ display: 'flex' }}>
                      <AppButton
                        style={{ width: '100px', flex: '0 0 100px' }}
                        size={'md'}
                        onClick={() => navigate(`/admin/account/ad-account/create?name=${name}&id=${advertiserId}`)}
                      >
                        추가 생성
                      </AppButton>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          marginLeft: -10,
                          paddingLeft: 10,
                        }}
                      >
                        {adAccounts.map((item: any, index: number) => {
                          return (
                            <AppTypography.Link
                              key={index}
                              style={{ marginLeft: 10 }}
                              onClick={() => navigate(`/admin/account/ad-account/update?id=${item.id}`)}
                            >
                              {item.name}({item.id}){index < adAccounts.length - 1 ? ',' : ''}
                            </AppTypography.Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.type}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>식별 번호</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{advertiserId}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'name'}
                      defaultValue={fetchAdvertiserDetail.data?.name}
                      control={AD_AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            style={{ width: '450px', marginRight: '10px' }}
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
                      errors={AD_AU_errors}
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
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      생년월일
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'birthday'}
                      defaultValue={fetchAdvertiserDetail.data?.identity_number}
                      control={AD_AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            style={{ width: '450px', marginRight: '10px' }}
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
                          message: '생년월일은 숫자만 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AD_AU_errors}
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
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      주소
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'address'}
                      defaultValue={fetchAdvertiserDetail.data?.address}
                      control={AD_AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            style={{ width: '450px', marginRight: '10px' }}
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
                      errors={AD_AU_errors}
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
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>광고계정</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {myRole === 'ADMIN' && (
                        <AppButton
                          style={{ width: '100px', marginRight: '10px' }}
                          size={'md'}
                          onClick={() => navigate(`/admin/account/ad-account/create?name=${name}&id=${advertiserId}`)}
                        >
                          추가 생성
                        </AppButton>
                      )}
                      <div>
                        {adAccounts.map((item: any, index: number) => {
                          return (
                            <div style={{ marginRight: '10px', marginLeft: '10px' }}>
                              <div
                                key={index}
                                style={{ marginRight: '10px' }}
                                onClick={() => navigate(`/admin/account/ad-account/update?id=${item.id}`)}
                              >
                                <AppTypography.Link>
                                  {item.name}({item.id})
                                </AppTypography.Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <AppDiver />
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>정산 담당자 이름</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'invoice_manager'}
                  defaultValue={fetchAdvertiserDetail.data?.invoice_manager}
                  control={AD_AU_control}
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
                    pattern: {
                      value: REGEXP_EN_KR_SPACE,
                      message: '이름은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AD_AU_errors}
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
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>정산 담당자 이메일</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'invoice_email'}
                  defaultValue={fetchAdvertiserDetail.data?.invoice_email}
                  control={AD_AU_control}
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
                  errors={AD_AU_errors}
                  name={'invoice_email'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} className={'text'}>
                  영문(대소), 숫자, 언더바(_), ., - 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>정산 담당자 휴대폰 번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'invoice_tel'}
                  defaultValue={fetchAdvertiserDetail.data?.invoice_tel}
                  control={AD_AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        style={{ width: '450px', marginRight: '10px' }}
                        maxLength={11}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    minLength: {
                      value: 10,
                      message: '휴대폰 번호는 10~11자로 입력해 주세요.',
                    },
                    pattern: {
                      value: REGEXP_NUMBER,
                      message: '휴대폰 번호는 숫자만 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AD_AU_errors}
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
            <AppDiver />
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>가입 신청 일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.created_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>승인 일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.approve_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>검수자</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchAdvertiserDetail.data?.reviewer}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>메모</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'memo'}
                  defaultValue={fetchAdvertiserDetail.data?.memo}
                  control={AD_AU_control}
                  render={({ field }) => {
                    return (
                      <AppInputTextArea
                        as="textarea"
                        maxLength={1000}
                        height={100}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      />
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <FinalActionDivider />
          <AppPageFooter>
            <AppButton size={'lg'} style={{ width: 138 }} onClick={cancelSave}>
              취소
            </AppButton>
            <AppButton
              size={'lg'}
              theme={'red'}
              style={{ width: 138, marginLeft: 15 }}
              onClick={AD_AU_handleSubmit(onClickADAUSubmit)}
            >
              저장
            </AppButton>
          </AppPageFooter>
        </div>
      )}
    </>
  );
};

export default AdminAccountAdvertiserUpdate;
