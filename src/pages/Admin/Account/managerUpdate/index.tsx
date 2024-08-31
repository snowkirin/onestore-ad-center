import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import AppInputCount from '@components/AppInput/AppInputCount';
import { getAdminDetail, updateAdmin } from '@apis/admin.api';
import { AppInput, AppInputGroup } from '@components/AppInput';
import eye from '@assets/images/icons/eye/eye-big.svg';
import disabledEye from '@assets/images/icons/eye/eye-disabled.svg';
import { Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import warning from '@assets/images/icons/warning/warning-big.svg';
import AppToggle from '@components/AppToggle';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';
import { REGEXP_EMAIL, REGEXP_EN_KR_SPACE, REGEXP_EN_NUM_SPECIAL_COMBINATION, REGEXP_NUMBER } from '@utils/regexp';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import CountDown from '@components/Common/CountDown';
import { chkEmailChangeCode, sendEmailChangeCode, sendTempPwdEmail } from '@apis/user.api';
import _ from 'lodash';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';
import AppRadioGroup, { AppRadio } from '@components/AppRadio';

interface AdminAccountManagerCreateProps {}

const AdminAccountManagerUpdate: React.FC<AdminAccountManagerCreateProps> = () => {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');

  const memberId = sessionStorage.getItem('id');

  // 저장값
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [isPwdChange, setIsPwdChange] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [isEmailChange, setIsEmailChange] = useState(false);
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [sendEmailMessage, setSendEmailMessage] = useState('');
  const [chkEmailMessage, setChkEmailMessage] = useState('');
  const [isShowCountDown, setIsShowCountDown] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleSubmit: AD_MU_handleSubmit,
    control: AD_MU_control,
    getValues: AD_MU_getValues,
    formState: { errors: AD_MU_errors },
    watch: AD_MU_watch,
  } = useForm();

  const watchPw = AD_MU_watch('pw');

  const URLParams = queryString.parse(location.search);

  const { id: managerId } = useParams();

  const fetchSendTempPwdEmail = async () => {
    const result = await sendTempPwdEmail(managerId);
    if (result.status === 200) {
      alert('임시 비밀번호를 발급하였습니다.');
    } else {
      alert(result.data.message);
    }
  };

  const fetchSendEmailChangeCode = () => {
    const params = {
      accountId: managerId,
      email: AD_MU_getValues('email'),
    };
    if (_.isEmpty(AD_MU_getValues('email'))) {
      setSendEmailMessage('이메일을 입력해주세요.');
      return;
    }
    sendEmailChangeCode(params)
      .then((res) => {
        if (res.status) {
          setIsShowCountDown(true);
          setIsSendEmail(true);
          setSendEmailMessage('인증 메일이 발송되었습니다. 10분 이내에 인증번호를 입력해 주세요.');
        } else {
          setIsSendEmail(false);
          setSendEmailMessage('입력하신 이메일로 회원 정보를 찾을 수 없습니다. 다시 확인해주세요.');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          setSendEmailMessage('이메일 형식에 맞게 입력해 주세요.(영문(대소), 숫자, @, 언더바(_), ., - 사용 가능');
        }
      });
  };

  const fetchChkEmailChangeCode = () => {
    const params = {
      accountId: managerId,
      email: AD_MU_getValues('email'),
      code: AD_MU_getValues('code'),
    };
    if (_.isEmpty(AD_MU_getValues('code'))) {
      setChkEmailMessage('인증번호를 입력해 주세요.');
      return;
    }
    chkEmailChangeCode(params)
      .then((res) => {
        if (res.data.status) {
          setConfirmEmail(true);
          alert('인증이 완료되었습니다.');
          setEmail(AD_MU_getValues('email'));
          setIsEmailChange(false);
          setSendEmailMessage('');
          setChkEmailMessage('');
          setIsEmailChange(false);
        } else {
          setChkEmailMessage(res.data.message);
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          alert(err.response.data.message);
        }
      });
  };

  const handleChange = () => {
    setVisible(!visible);
  };

  const handleChangeConfirm = () => {
    setVisibleConfirm(!visibleConfirm);
  };

  const cancelSave = () => {
    if (!confirm('관리자 수정을 취소하시겠습니까? 수정한 내용은 저장되지 않습니다.')) {
      return;
    }
    navigate('/admin/account/manager');
  };

  const fetchManagerDetail = useQuery(
    ['managerDetail', managerId],
    async () => {
      const result = await getAdminDetail(managerId);
      if (result.status === 200) {
        return result.data;
      } else {
        return [];
      }
    },
    {
      onSuccess: (data) => {
        setEmail(data.email);
        setEnabled(data.enabled);
      },
    }
  );

  const onClickADMUSubmit = async (data: any) => {
    const AD_MU_data = data;
    AD_MU_data.adminId = managerId;
    AD_MU_data.enabled = enabled;

    if (isEmailChange && !confirmEmail) {
      alert('이메일 변경을 완료해 주세요.');
      return;
    }
    updateAdmin(AD_MU_data)
      .then((res: any) => {
        if (res) {
          navigate('/admin/account/manager');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 406) {
          setErrorMessage('현재 비밀번호가 일치하지 않습니다.');
        }
      });
  };

  return (
    <div>
      {!fetchManagerDetail.isFetching && (
        <>
          <AppPageHeader title={'관리자 조회/수정'} />
          <div className={'content__inner'}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '570px' }}>
              <div style={{ marginRight: '10px' }}>{enabled ? '활성' : '비활성'}</div>
              <AppToggle disabled={memberId == managerId} checked={enabled} onChange={() => setEnabled(!enabled)} />
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>아이디</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.signin_id}</AppTypography.Text>
              </div>
            </div>
            {!isPwdChange ? (
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>비밀번호</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  {sessionStorage.getItem('id') === managerId && (
                    <AppButton size={'md'} onClick={() => setIsPwdChange(true)}>
                      비밀번호 변경
                    </AppButton>
                  )}
                  {sessionStorage.getItem('id') !== managerId && role === 'ADMIN' && (
                    <AppButton onClick={fetchSendTempPwdEmail} size={'md'}>
                      임시 비밀번호 메일 발송
                    </AppButton>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      현재 비밀번호
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'current_pw'}
                      control={AD_MU_control}
                      render={({ field }) => {
                        return (
                          <AppInputGroup>
                            <AppInput
                              type={visible ? 'text' : 'password'}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                            />
                            <AppInputGroup.Button onClick={handleChange} style={{ border: 'none' }}>
                              {visible ? <img src={eye} alt={'eye'} /> : <img src={disabledEye} alt={'eye'} />}
                            </AppInputGroup.Button>
                          </AppInputGroup>
                        );
                      }}
                      rules={{
                        required: isPwdChange && '현재 비밀번호를 입력해 주세요.',
                      }}
                    />
                    <ErrorMessage
                      errors={AD_MU_errors}
                      name={'current_pw'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                    <AppErrorMessage>{_.isEmpty(AD_MU_getValues('current_pw')) ? '' : errorMessage}</AppErrorMessage>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      새 비밀번호
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'pw'}
                      control={AD_MU_control}
                      render={({ field }) => {
                        return (
                          <AppInputGroup>
                            <AppInput
                              type={visible ? 'text' : 'password'}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                              placeholder={'영문, 숫자, 특수문자 조합 8-20자'}
                            />
                            <AppInputGroup.Button onClick={handleChange} style={{ border: 'none' }}>
                              {visible ? <img src={eye} alt={'eye'} /> : <img src={disabledEye} alt={'eye'} />}
                            </AppInputGroup.Button>
                          </AppInputGroup>
                        );
                      }}
                      rules={{
                        required: isPwdChange && '새 비밀번호를 입력해 주세요.',
                        minLength: {
                          value: 8,
                          message: '새 비밀번호는 8~20자로 입력해 주세요.',
                        },
                        pattern: {
                          value: REGEXP_EN_NUM_SPECIAL_COMBINATION,
                          message: '새 비밀번호는 영문, 숫자, 특수문자 조합으로 입력해 주세요.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AD_MU_errors}
                      name={'pw'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      새 비밀번호 확인
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'tmpPw'}
                      control={AD_MU_control}
                      render={({ field }) => {
                        return (
                          <AppInputGroup>
                            <AppInput
                              type={visibleConfirm ? 'text' : 'password'}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                            />
                            <AppInputGroup.Button onClick={handleChangeConfirm} style={{ border: 'none' }}>
                              {visibleConfirm ? <img src={eye} alt={'eye'} /> : <img src={disabledEye} alt={'eye'} />}
                            </AppInputGroup.Button>
                          </AppInputGroup>
                        );
                      }}
                      rules={{
                        required: isPwdChange && '새 비밀번호가 일치하지 않습니다.',
                        validate: (value) => (isPwdChange && value === watchPw) || '새 비밀번호가 일치하지 않습니다.',
                      }}
                    />
                    <ErrorMessage
                      errors={AD_MU_errors}
                      name={'tmpPw'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                </div>
              </>
            )}
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  이름
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'name'}
                  defaultValue={fetchManagerDetail.data?.name}
                  control={AD_MU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={16}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                        placeholder={'2~16자'}
                      />
                    );
                  }}
                  rules={{
                    required: '이름을 입력해 주세요.',
                    minLength: {
                      value: 2,
                      message: '이름은 2~16자로 입력해 주세요.',
                    },
                    pattern: {
                      value: REGEXP_EN_KR_SPACE,
                      message: '이름은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AD_MU_errors}
                  name={'name'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} className={'text'}>
                  영문(대소), 한글, 띄어쓰기 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            {!isEmailChange ? (
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'} isRequired>
                    이메일
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AppTypography.Text className={'text'}>{email || '-'}</AppTypography.Text>
                    {memberId == managerId && (
                      <AppButton size={'md'} style={{ marginLeft: 10 }} onClick={() => setIsEmailChange(true)}>
                        이메일 변경
                      </AppButton>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'} isRequired>
                      이메일
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.email}</AppTypography.Text>
                      <AppButton size={'md'} style={{ marginLeft: 10 }} onClick={() => setIsEmailChange(false)}>
                        이메일 변경 취소
                      </AppButton>
                    </div>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'} />
                  <div className={'col col-input'}>
                    <Controller
                      name={'email'}
                      control={AD_MU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={80}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                            placeholder={'변경하려는 이메일 주소를 입력해 주세요.'}
                          />
                        );
                      }}
                    />
                    <ErrorMessage
                      errors={AD_MU_errors}
                      name={'email'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                    <div>
                      <AppErrorMessage>{sendEmailMessage}</AppErrorMessage>
                    </div>
                  </div>
                  <div className={'col col-extra'}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <AppButton size={'md'} style={{ width: 100 }} onClick={fetchSendEmailChangeCode}>
                        {isSendEmail ? '인증 메일 재발송' : '인증 메일 발송'}
                      </AppButton>
                      <div>{isShowCountDown && <CountDown style={{ marginLeft: '10px', marginTop: '5px' }} />}</div>
                    </div>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'} />
                  <div className={'col col-input'}>
                    <Controller
                      name={'code'}
                      control={AD_MU_control}
                      render={({ field }) => {
                        return (
                          <AppInput
                            disabled={!isSendEmail}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            placeholder={'인증번호 입력'}
                            value={field.value}
                          />
                        );
                      }}
                    />
                    <AppErrorMessage>{chkEmailMessage}</AppErrorMessage>
                    <ErrorMessage
                      errors={AD_MU_errors}
                      name={'code'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppButton size={'md'} style={{ width: 100 }} onClick={fetchChkEmailChangeCode}>
                      확인
                    </AppButton>
                  </div>
                </div>
              </>
            )}
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  휴대폰 번호
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'tel'}
                  defaultValue={fetchManagerDetail.data?.tel}
                  control={AD_MU_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={11}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                        placeholder={'10~11자'}
                      />
                    );
                  }}
                  rules={{
                    required: '휴대폰 번호를 입력해 주세요.',
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
                  errors={AD_MU_errors}
                  name={'tel'}
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
                  권한
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'role'}
                  defaultValue={fetchManagerDetail.data?.role}
                  control={AD_MU_control}
                  render={({ field }) => {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <AppRadioGroup
                          style={{ display: 'flex', alignItems: 'center' }}
                          inline
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <AppRadio value="ADMIN" disabled={role !== 'ADMIN'}>
                            운영자
                          </AppRadio>
                          <AppRadio value="ADMIN_FINANCE" disabled={role === 'ADMIN_CS'}>
                            재무
                          </AppRadio>
                          <Whisper
                            trigger="hover"
                            placement="bottomStart"
                            enterable
                            speaker={
                              <AppPopover theme={'white'}>
                                대시보드, 정산, 조직/계정 메뉴에만 접근할 수 있습니다.
                              </AppPopover>
                            }
                          >
                            <span style={{ marginLeft: '3px', marginBottom: '3px' }}>
                              <img src={warning} alt={'warning'} />
                            </span>
                          </Whisper>
                          <AppRadio value="ADMIN_CS" disabled={role === 'ADMIN_FINANCE'}>
                            CS
                          </AppRadio>
                          <Whisper
                            trigger="hover"
                            placement="bottomStart"
                            enterable
                            speaker={
                              <AppPopover theme={'white'}>
                                대시보드, 조직/계정, 고객센터 메뉴에만 접근할 수 있습니다.
                              </AppPopover>
                            }
                          >
                            <span style={{ marginLeft: '3px', marginBottom: '3px' }}>
                              <img src={warning} alt={'warning'} />
                            </span>
                          </Whisper>
                        </AppRadioGroup>
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <AppDiver />
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>생성일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.created_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 수정일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchManagerDetail.data?.updated_at ? fetchManagerDetail.data?.updated_at : '-'}
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 접속일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchManagerDetail.data?.last_login ? fetchManagerDetail.data?.last_login : '-'}
                </AppTypography.Text>
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
              onClick={AD_MU_handleSubmit(onClickADMUSubmit)}
            >
              완료
            </AppButton>
          </AppPageFooter>
        </>
      )}
    </div>
  );
};

export default AdminAccountManagerUpdate;
