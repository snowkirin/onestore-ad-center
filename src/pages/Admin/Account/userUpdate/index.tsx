import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import AppTypography from '@components/AppTypography';
import AppToggle from '@components/AppToggle';
import { AppButton } from '@components/AppButton';
import { REGEXP_EN_KR_SPACE, REGEXP_NUMBER } from '@utils/regexp';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppInputCount from '@components/AppInput/AppInputCount';
import { Radio, RadioGroup, Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import warning from '@assets/images/icons/warning/warning-big.svg';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { getUserDetail, makeMolocoToken, sendTempPwdEmail, updateUser } from '@apis/user.api';
import SpinnerIcon from '@rsuite/icons/legacy/Spinner';
import Select from 'react-select';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';
import { selectStyles } from '@utils/common';

interface AdminAccountUserUpdateProps {}

const AdminAccountUserUpdate: React.FC<AdminAccountUserUpdateProps> = () => {
  const navigate = useNavigate();

  // 저장값
  const [enabled, setEnabled] = useState(false);
  const [isMolocoToken, setIsMolocoToken] = useState(false);
  const [isMolocoTokenResponse, setIsMolocoTokenResponse] = useState('');
  const [isMolocoTokenClick, setIsMolocoTokenClick] = useState(false);
  const [isMolocoTokenLoading, setIsMolocoTokenLoading] = useState(false);
  const [accountsList, setAccountsList] = useState<any>([]);
  const [accountIds, setAccountIds] = useState<any>([]);

  const {
    handleSubmit: AD_UU_handleSubmit,
    control: AD_UU_control,
    formState: { errors: AD_UU_errors },
  } = useForm();

  const { userId: userId } = useParams();

  const cancelSave = () => {
    if (!confirm('사용자 수정을 취소하시겠습니까? 수정한 내용은 저장되지 않습니다.')) {
      return;
    }
    navigate('/admin/account/user');
  };

  const fetchUserDetail = useQuery(
    ['UserDetail', userId],
    async () => {
      const result = await getUserDetail(userId);
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
        setEnabled(data.enabled);
      },
    }
  );

  const onClickADUUSubmit = async (data: any) => {
    const AD_UU_data = {
      ...data,
      enabled: enabled,
    };
    updateUser(userId, AD_UU_data).then((res: any) => {
      if (res.status === 200) {
        navigate('/admin/account/user');
      } else {
        alert(res.data.message);
      }
    });
  };

  const fetchSendTempPwdEmail = async () => {
    const result = await sendTempPwdEmail(userId);
    if (result.status === 200) {
      alert('임시 비밀번호를 발급하였습니다.');
    } else {
      alert(result.data.message);
    }
  };

  const fetchMakeMolocoToken = async () => {
    setIsMolocoTokenLoading(true);
    setIsMolocoTokenClick(true);
    const result = await makeMolocoToken(userId);
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

  return (
    <>
      {!fetchUserDetail.isFetching && (
        <div>
          <AppPageHeader title={'사용자 조회/수정'} />
          <div className={'content__inner'}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: 600 }}>
              <div style={{ marginRight: '10px' }}>{enabled ? '활성' : '비활성'}</div>
              <AppToggle checked={enabled} onChange={() => setEnabled(!enabled)} />
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>아이디</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.signin_id}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>비밀번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppButton onClick={fetchSendTempPwdEmail} size={'md'}>
                  임시 비밀번호 메일 발송
                </AppButton>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'} isRequired>
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
                <AppTypography.Text type={'sub'} className={'text'}>
                  영문(대소), 한글, 띄어쓰기 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>
                  광고센터 연락용 이메일
                  <Whisper
                    trigger="hover"
                    placement="bottomStart"
                    enterable
                    speaker={<AppPopover theme={'white'}>광고센터 회원이 설정한 이메일입니다.</AppPopover>}
                  >
                    <span style={{ marginLeft: '3px' }}>
                      <img src={warning} alt={'warning'} />
                    </span>
                  </Whisper>
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.email}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>
                  몰로코 계정 연결 이메일
                  <Whisper
                    trigger="hover"
                    placement="bottomStart"
                    enterable
                    speaker={
                      <AppPopover theme={'white'}>광고센터 회원과 연결된 몰로코 계정의 아이디입니다.</AppPopover>
                    }
                  >
                    <span style={{ marginLeft: '3px' }}>
                      <img src={warning} alt={'warning'} />
                    </span>
                  </Whisper>
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.moloco_id}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
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
                <AppTypography.Text type={'sub'} className={'text'}>
                  숫자만 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
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
                          <Radio value="ADVERTISER_MASTER">광고주 마스터</Radio>
                          <Radio
                            value="ADVERTISER_EMPLOYEE"
                            disabled={fetchUserDetail.data?.role === 'ADVERTISER_MASTER'}
                          >
                            광고주 User
                          </Radio>
                          <Radio value="AGENCY" disabled={fetchUserDetail.data?.role === 'ADVERTISER_MASTER'}>
                            대행사 User
                          </Radio>
                          <Radio value="REPORT_VIEWER" disabled={fetchUserDetail.data?.role === 'ADVERTISER_MASTER'}>
                            성과 Viewer
                          </Radio>
                        </RadioGroup>
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'} isRequired>
                  광고계정
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'ad_accounts'}
                  control={AD_UU_control}
                  render={({ field }) => {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '1200px', zIndex: 5 }}>
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
                          />
                        </div>
                      </div>
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
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>
                  몰로코 계정 토큰 생성
                  <Whisper
                    trigger="hover"
                    placement="bottomStart"
                    enterable
                    speaker={
                      <AppPopover theme={'white'}>
                        몰로코 API 사용을 위한 User 토큰을 다시 생성할 수 있습니다.
                      </AppPopover>
                    }
                  >
                    <span style={{ marginLeft: '3px' }}>
                      <img src={warning} alt={'warning'} />
                    </span>
                  </Whisper>
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {!isMolocoTokenClick ? (
                  <AppButton size={'md'} onClick={fetchMakeMolocoToken}>
                    생성
                  </AppButton>
                ) : isMolocoTokenLoading ? (
                  <SpinnerIcon pulse style={{ fontSize: '2em', marginTop: 4 }} />
                ) : isMolocoToken ? (
                  <div>
                    <div
                      className={'status-circle-green'}
                      style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <AppTypography.Text className={'text'} accepter={'span'}>
                      생성완료
                    </AppTypography.Text>
                  </div>
                ) : (
                  <div>
                    <div
                      className={'status-circle-red'}
                      style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}
                    />
                    <AppTypography.Text className={'text'} accepter={'span'}>
                      생성실패 {isMolocoTokenResponse}
                    </AppTypography.Text>
                  </div>
                )}
              </div>
            </div>
            <AppDiver />
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>생성일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.created_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>마지막 수정일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.updated_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-input'} style={{ width: 150 }}>
                <AppTypography.Label className={'text'}>마지막 접속일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.last_login}</AppTypography.Text>
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
              onClick={AD_UU_handleSubmit(onClickADUUSubmit)}
            >
              저장
            </AppButton>
          </AppPageFooter>
        </div>
      )}
    </>
  );
};

export default AdminAccountUserUpdate;
