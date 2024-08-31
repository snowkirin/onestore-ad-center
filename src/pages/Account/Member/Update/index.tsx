import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import AppTypography from '@components/AppTypography';
import AppToggle from '@components/AppToggle';
import { AppButton } from '@components/AppButton';
import { REGEXP_EMAIL, REGEXP_EN_KR_SPACE, REGEXP_EN_NUM_SPECIAL_COMBINATION, REGEXP_NUMBER } from '@utils/regexp';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppInputCount from '@components/AppInput/AppInputCount';
import { Radio, RadioGroup } from 'rsuite';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import {
  chkEmailChangeCode,
  getUserDetail,
  makeMolocoToken,
  myAccountPwdChange,
  sendEmailChangeCode,
  sendTempPwdEmail,
  updateUser,
} from '@apis/user.api';
import Select from 'react-select';
import { AppInput, AppInputGroup } from '@components/AppInput';
import _ from 'lodash';
import CountDown from '@components/Common/CountDown';
import { getRoleType } from '@utils/functions';
import eye from '@assets/images/icons/eye/eye-big.svg';
import disabledEye from '@assets/images/icons/eye/eye-disabled.svg';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';
import AlertModal from '@components/AppModal/AlretModal';
import { selectStyles } from '@utils/common';

interface AccountMemberUpdateProps {}

const AccountMemberUpdate: React.FC<AccountMemberUpdateProps> = () => {
  const navigate = useNavigate();
  const { accountId: accountId } = useParams();

  const [accountsList, setAccountsList] = useState<any>([]);
  const [accountIds, setAccountIds] = useState<any>([]);

  const sessionRole = sessionStorage.getItem('role');
  const myId = sessionStorage.getItem('id');
  const roleType = getRoleType(sessionRole);

  // 저장값
  const [enabled, setEnabled] = useState(false);
  const [isMolocoToken, setIsMolocoToken] = useState(false);
  const [isMolocoTokenResponse, setIsMolocoTokenResponse] = useState('');
  const [isMolocoTokenClick, setIsMolocoTokenClick] = useState(false);
  const [isMolocoTokenLoading, setIsMolocoTokenLoading] = useState(false);
  const [isEmailChange, setIsEmailChange] = useState(false);
  const [role, setRole] = useState('');
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [sendEmailMessage, setSendEmailMessage] = useState('');
  const [chkEmailMessage, setChkEmailMessage] = useState('');
  const [isShowCountDown, setIsShowCountDown] = useState(false);
  const [email, setEmail] = useState('');

  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [isPwdChange, setIsPwdChange] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState<{ title: string; content: React.ReactNode | string }>({
    title: '',
    content: '',
  });

  const [confirmEmail, setConfirmEmail] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleSubmit: AD_UU_handleSubmit,
    control: AD_UU_control,
    getValues: AD_UU_getValues,
    formState: { errors: AD_UU_errors },
    watch: AD_UU_watch,
  } = useForm();

  const watchPw = AD_UU_watch('pw');

  const fetchSendEmailChangeCode = () => {
    const params = {
      accountId: accountId,
      email: AD_UU_getValues('email'),
    };
    sendEmailChangeCode(params)
      .then((res) => {
        if (res.status) {
          setIsShowCountDown(true);
          setIsSendEmail(true);
          setSendEmailMessage('');
          setSendEmailMessage('인증 메일이 발송되었습니다. 10분 이내에 인증번호를 입력해 주세요.');
        } else {
          setIsSendEmail(false);
          setSendEmailMessage('입력하신 이메일로 회원 정보를 찾을 수 없습니다. 다시 확인해주세요.');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 500) {
          setSendEmailMessage('이메일을 입력해주세요.');
        } else if (err.response.status === 400) {
          setSendEmailMessage('이메일 형식에 맞게 입력해 주세요.(영문(대소), 숫자, @, 언더바(_), ., - 사용 가능)');
        }
      });
  };

  const fetchChkEmailChangeCode = () => {
    const params = {
      accountId: accountId,
      email: AD_UU_getValues('email'),
      code: AD_UU_getValues('code'),
    };
    if (_.isEmpty(AD_UU_getValues('code'))) {
      setChkEmailMessage('인증번호를 입력해 주세요.');
      return;
    }
    chkEmailChangeCode(params)
      .then((res) => {
        if (res.data.status) {
          setConfirmEmail(true);
          alert('인증이 완료되었습니다.');
          setEmail(AD_UU_getValues('email'));
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

  const fetchUserDetail = useQuery(
    ['UserDetail', accountId],
    async () => {
      const result = await getUserDetail(accountId);
      if (result.status === 200) {
        return {
          ...result.data,
          signin_id: result.data.signin_id || '-',
          name: result.data?.name || '',
          email: result.data?.email || '-',
          moloco_id: result.data?.moloco_id || '-',
          tel: result.data?.tel || '',
          role: result.data?.role || '',
          created_at: result.data?.created_at || '-',
          updated_at: result.data?.updated_at || '-',
          last_login: result.data?.last_login || '-',
          ad_accounts: result.data.ad_accounts.map((item: any) => {
            return {
              value: item.id,
              label: item.name,
              isFixed: item.checked,
              //isDisabled: !item.checked,
            };
          }),
        };
      } else {
        return [];
      }
    },
    {
      onSuccess: (data) => {
        setAccountsList(data.ad_accounts);
        setAccountIds(data.ad_accounts.filter((item: any) => item.isFixed));

        setRole(data.role);
        setEnabled(data.enabled);
        setEmail(data.email);
      },
      onError: (error: any) => {
        if (error.response.status === 406) {
          navigate(`/confirm-password?referrer=${encodeURIComponent(location.pathname + location.search)}`);
        } else {
          alert(error.response.data.message);
        }
      },
    }
  );

  const onClickADUUSubmit = async (data: any) => {
    // adAccountId = 계정 id
    const AD_UU_data = data;
    AD_UU_data.enabled = enabled;

    if (isEmailChange && !confirmEmail) {
      alert('이메일 변경을 완료해 주세요.');
      return;
    }

    const updateUserData = await updateUser(accountId, AD_UU_data);

    if (updateUserData.status === 200) {
      if (myId === accountId && AD_UU_data.pw) {
        const pwdChangeResult = await myAccountPwdChange(myId, {
          current_pw: AD_UU_data.current_pw,
          pw: AD_UU_data.pw,
        });
        if (pwdChangeResult.status === 200) {
          if (pwdChangeResult.data.status === false) {
            setErrorMessage('현재 비밀번호가 일치하지 않습니다.');
            return;
          }
        }
        if (pwdChangeResult.status === 400) {
          alert(pwdChangeResult.data.message);
          return;
        }
      }
      // 일반 케이스
      if (accountId === myId && updateUserData.data.role !== role) {
        sessionStorage.setItem('role', updateUserData.data.role);
      }
      if (updateUserData.data.role === 'ADVERTISER_MASTER' && role !== 'ADVERTISER_MASTER') {
        // 내가 마스터이고 다른 회원을 마스터로 변경한 경우
        alert('해당 회원을 광고주 마스터 권한으로 변경하였습니다. 페이지를 새로고침합니다.');
        sessionStorage.setItem('role', 'ADVERTISER_EMPLOYEE');
        // 디폴트 페이지로 이동 -> 캠페인?
        navigate('/campaigns/campaign');
      } else {
        navigate('/account/member');
      }
    }

    if (updateUserData.status === 400) {
      alert(updateUserData.data.message);
    }
  };

  const fetchSendTempPwdEmail = async () => {
    const result = await sendTempPwdEmail(accountId);
    if (result.status === 200) {
      setAlertModalMessage({
        title: '임시 비밀번호 발송',
        content: <AppTypography.Text>임시 비밀번호가 이메일로 발송되었습니다.</AppTypography.Text>,
      });
      setIsAlertModalOpen(true);
    } else {
      setAlertModalMessage({
        title: '임시 비밀번호 발송 에러',
        content: <AppTypography.Text>{result.data.message}</AppTypography.Text>,
      });
      setIsAlertModalOpen(true);
    }
  };

  const fetchMakeMolocoToken = async () => {
    setIsMolocoTokenLoading(true);
    setIsMolocoTokenClick(true);
    const result = await makeMolocoToken(accountId);
    if (result) {
      setIsMolocoTokenLoading(false);
      if (result.status === 200) {
        setIsMolocoToken(true);
      } else if (result.status === 400) {
        setIsMolocoToken(false);
        setIsMolocoTokenResponse(result.data.message);
      }
    }
  };

  const getAdAccountIds = (e: any, option: any) => {
    switch (option.action) {
      case 'select-option':
        if (option.option && option.option?.value === 'all') {
          setAccountIds(accountsList);
        } else {
          setAccountIds(e);
        }
        return;
      case 'clear':
        setAccountIds(accountsList.filter((item: any) => item.isFixed === true));
        return;
      case 'pop-value':
        if (option && option.removedValue!.isFixed) return;
    }
    if (option && option.isFixed) return;
    setAccountIds(e);
  };

  const handleChange = () => {
    setVisible(!visible);
  };

  const handleChangeConfirm = () => {
    setVisibleConfirm(!visibleConfirm);
  };
  const handleAlertModalOk = () => {
    setIsAlertModalOpen(false);
    setAlertModalMessage({
      title: '',
      content: '',
    });
  };

  return (
    <>
      {fetchUserDetail.isSuccess && (
        <div>
          {roleType === 'isViewer' ? (
            <AppPageHeader title={'사용자 수정'} />
          ) : (
            <AppPageHeader title={'사용자 조회/수정'} />
          )}
          <div className={'content__inner'}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: 570 }}>
              <div style={{ marginRight: '10px' }}>{enabled ? '활성' : '비활성'}</div>
              <AppToggle disabled={myId == accountId} checked={enabled} onChange={() => setEnabled(!enabled)} />
            </div>

            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>아이디</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.signin_id}</AppTypography.Text>
              </div>
            </div>

            {myId === accountId ? (
              !isPwdChange ? (
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>비밀번호</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppButton size={'md'} onClick={() => setIsPwdChange(true)}>
                      비밀번호 변경
                    </AppButton>
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
                        control={AD_UU_control}
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
                        errors={AD_UU_errors}
                        name={'current_pw'}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                      <AppErrorMessage>{_.isEmpty(AD_UU_getValues('current_pw')) ? '' : errorMessage}</AppErrorMessage>
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
                        control={AD_UU_control}
                        render={({ field }) => {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <AppInputGroup>
                                <AppInput
                                  type={visible ? 'text' : 'password'}
                                  style={{ width: '250px', marginRight: '10px' }}
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
                            </div>
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
                        errors={AD_UU_errors}
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
                        control={AD_UU_control}
                        render={({ field }) => {
                          return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <AppInputGroup>
                                <AppInput
                                  type={visibleConfirm ? 'text' : 'password'}
                                  style={{ width: '250px', marginRight: '10px' }}
                                  onChange={(value) => {
                                    field.onChange(value);
                                  }}
                                  value={field.value}
                                />
                                <AppInputGroup.Button onClick={handleChangeConfirm} style={{ border: 'none' }}>
                                  {visibleConfirm ? (
                                    <img src={eye} alt={'eye'} />
                                  ) : (
                                    <img src={disabledEye} alt={'eye'} />
                                  )}
                                </AppInputGroup.Button>
                              </AppInputGroup>
                            </div>
                          );
                        }}
                        rules={{
                          required: isPwdChange && '새 비밀번호가 일치하지 않습니다.',
                          validate: (value) => (isPwdChange && value === watchPw) || '새 비밀번호가 일치하지 않습니다.',
                        }}
                      />
                      <ErrorMessage
                        errors={AD_UU_errors}
                        name={'tmpPw'}
                        render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                      />
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>비밀번호</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppButton size={'md'} onClick={fetchSendTempPwdEmail}>
                    임시 비밀번호 메일 발송
                  </AppButton>
                </div>
              </div>
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
                  defaultValue={fetchUserDetail.data?.name}
                  control={AD_UU_control}
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
                      message: '이름은 2~16자로 입력해 주세요',
                    },
                    pattern: {
                      value: REGEXP_EN_KR_SPACE,
                      message: '이름은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AD_UU_errors}
                  name={'name'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text className={'text'} type={'sub'}>
                  영문(대소), 한글, 띄어쓰기 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            {!isEmailChange ? (
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label isRequired className={'text'}>
                    이메일
                  </AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'} style={{ display: 'inline-block' }}>
                    {email}
                  </AppTypography.Text>
                  {myId == accountId && (
                    <AppButton size={'md'} style={{ marginLeft: 10 }} onClick={() => setIsEmailChange(true)}>
                      이메일 변경
                    </AppButton>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      이메일
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'} style={{ display: 'inline-block' }}>
                      {fetchUserDetail.data?.email}
                    </AppTypography.Text>
                    <AppButton
                      size={'md'}
                      style={{ marginLeft: 10 }}
                      onClick={() => {
                        setIsEmailChange(false);
                        setIsSendEmail(false);
                        setIsShowCountDown(false);
                        setSendEmailMessage('');
                      }}
                    >
                      이메일 변경 취소
                    </AppButton>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}></div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'email'}
                      control={AD_UU_control}
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
                      errors={AD_UU_errors}
                      name={'email'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                    <AppErrorMessage>{sendEmailMessage}</AppErrorMessage>
                  </div>
                  <div className={'col col-extra'} style={{ position: 'relative', flex: '0 1 auto' }}>
                    <AppButton size={'md'} onClick={fetchSendEmailChangeCode}>
                      {isSendEmail ? '인증 메일 재발송' : '인증 메일 발송'}
                    </AppButton>
                    {isShowCountDown && (
                      <CountDown style={{ position: 'absolute', left: 'calc(100% + 10px)', top: 8 }} />
                    )}
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}></div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'code'}
                      control={AD_UU_control}
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
                      errors={AD_UU_errors}
                      name={'code'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppButton size={'md'} onClick={fetchChkEmailChangeCode}>
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
                  defaultValue={fetchUserDetail.data?.tel}
                  control={AD_UU_control}
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
                  errors={AD_UU_errors}
                  name={'tel'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text className={'text'} type={'sub'}>
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
                  defaultValue={fetchUserDetail.data?.role}
                  control={AD_UU_control}
                  render={({ field }) => {
                    return (
                      <RadioGroup
                        inline
                        onChange={(value) => {
                          if (value === 'ADVERTISER_MASTER') {
                            if (
                              !confirm(
                                '해당 회원의 권한을 광고주 마스터로 변경하시겠습니까? 변경 시 기존 광고주 마스터 회원은 광고주 User 권한으로 자동 강등됩니다.'
                              )
                            )
                              return false;
                          }
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <Radio
                          value="ADVERTISER_MASTER"
                          disabled={roleType === 'isEmployee' || roleType === 'isAgency' || roleType === 'isViewer'}
                        >
                          광고주 마스터
                        </Radio>
                        <Radio
                          value="ADVERTISER_EMPLOYEE"
                          disabled={
                            fetchUserDetail.data?.role === 'ADVERTISER_MASTER' ||
                            roleType === 'isAgency' ||
                            roleType === 'isViewer'
                          }
                        >
                          광고주 User
                        </Radio>
                        <Radio
                          value="AGENCY"
                          disabled={fetchUserDetail.data?.role === 'ADVERTISER_MASTER' || roleType === 'isViewer'}
                        >
                          대행사 User
                        </Radio>
                        <Radio value="REPORT_VIEWER" disabled={fetchUserDetail.data?.role === 'ADVERTISER_MASTER'}>
                          성과 Viewer
                        </Radio>
                      </RadioGroup>
                    );
                  }}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  광고계정
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'ad_accounts'}
                  control={AD_UU_control}
                  render={({ field }) => {
                    return (
                      <Select
                        options={[{ label: '전체 선택', value: 'all' }, ...accountsList]}
                        isMulti
                        isClearable={true}
                        closeMenuOnSelect={false}
                        value={accountIds}
                        styles={selectStyles}
                        onChange={getAdAccountIds}
                        onInputChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder={'선택'}
                        isDisabled={roleType === 'isViewer'}
                      />
                    );
                  }}
                  rules={{
                    required: accountIds.length < 1 && '광고계정을 선택해 주세요.',
                  }}
                />
                <ErrorMessage
                  errors={AD_UU_errors}
                  name={'ad_accounts'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>

            <AppDiver />
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>생성일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.created_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 수정일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchUserDetail.data?.updated_at ? fetchUserDetail.data?.updated_at : '-'}
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 접속일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchUserDetail.data?.last_login ? fetchUserDetail.data?.last_login : '-'}
                </AppTypography.Text>
              </div>
            </div>
          </div>

          <FinalActionDivider />
          <AppPageFooter>
            <AppButton size={'lg'} style={{ width: 138 }} onClick={() => setIsConfirmModalOpen(true)}>
              취소
            </AppButton>
            <AppButton
              size={'lg'}
              theme={'red'}
              style={{ width: 138, marginLeft: 15 }}
              onClick={AD_UU_handleSubmit(onClickADUUSubmit)}
            >
              저장
            </AppButton>
          </AppPageFooter>

          <ConfirmModal
            size={'xs'}
            open={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onOk={() => navigate('/account/member')}
            okText={'확인'}
            content={
              <AppTypography.Text>
                사용자 수정을 취소하시겠습니까? <br />
                수정한 내용은 저장되지 않습니다.
              </AppTypography.Text>
            }
            title={'사용자 수정 취소'}
          />

          <AlertModal
            open={isAlertModalOpen}
            onOk={() => handleAlertModalOk()}
            content={alertModalMessage.content}
            title={alertModalMessage.title}
          />
        </div>
      )}
    </>
  );
};

export default AccountMemberUpdate;
