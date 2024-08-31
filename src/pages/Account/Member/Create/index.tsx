import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import { REGEXP_EN_KR_SPACE, REGEXP_EN_NUM, REGEXP_EN_NUM_SPECIAL_COMBINATION, REGEXP_NUMBER } from '@utils/regexp';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppInputCount from '@components/AppInput/AppInputCount';
import { Radio, RadioGroup } from 'rsuite';
import { FinalActionDivider } from '@components/AppDivider';
import { changeUserStatus, createUser } from '@apis/user.api';
import Select from 'react-select';
import { AppInput, AppInputGroup } from '@components/AppInput';
import { checkAdminId, checkSameEmail } from '@apis/admin.api';
import eye from '@assets/images/icons/eye/eye-big.svg';
import disabledEye from '@assets/images/icons/eye/eye-disabled.svg';
import _, { isEmpty } from 'lodash';
import { getAdAccountList } from '@apis/ad_account.api';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';
import { selectStyles } from '@utils/common';

interface AccountMemberCreateProps {}

const AccountMemberCreate: React.FC<AccountMemberCreateProps> = () => {
  const sessionRole = sessionStorage.getItem('role');
  const sessionAdvertiserId = sessionStorage.getItem('advertiser_id');

  const navigate = useNavigate();

  // 저장값
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [accountsList, setAccountsList] = useState<any>([]);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [signinId, setSigninId] = useState('');
  const [accountIds, setAccountIds] = useState<any>([]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleChange = () => {
    setVisible(!visible);
  };

  const handleChangeConfirm = () => {
    setVisibleConfirm(!visibleConfirm);
  };

  const {
    handleSubmit: UC_handleSubmit,
    control: UC_control,
    getValues: UC_getValues,
    formState: { errors: UC_errors },
    watch: UC_watch,
  } = useForm();

  const watchPw = UC_watch('pw');

  const fetchAccountsList = useQuery(
    ['fetchAccountsList'],
    async () => {
      const pageParams = {
        page: 1,
        size: 1000,
      };
      const sortParams = {
        sortType: 'createdAt',
        direction: 'desc',
      };
      const { data } = await getAdAccountList('', pageParams, sortParams);
      if (!isEmpty(data.content)) {
        if (data.content.length === 1) {
          return data.content.map((item: any) => {
            return {
              label: item.name + ' (' + item.id + ' )',
              value: item.id,
              isDisabled: true,
              isFixed: true,
            };
          });
        } else {
          return data.content.map((item: any) => {
            return {
              label: item.name + ' (' + item.id + ' )',
              value: item.id,
            };
          });
        }
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setAccountsList(data);
        setAccountIds(data.filter((item: any) => item.isFixed === true));
      },
    }
  );

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

  const URLParams = queryString.parse(location.search);

  const setEnabledToggle = (value: boolean) => {
    const params = {
      ids: URLParams.id,
      enabled: value,
    };
    changeUserStatus(params)
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

  const chkId = () => {
    checkAdminId(signinId).then((res) => {
      if (res.data.status === false) {
        setError('이미 사용중인 아이디입니다. 다른 아이디를 입력해 주세요.');
      } else {
        setError('');
      }
    });
  };

  const chkEmail = (email: any) => {
    const params = {
      email: UC_getValues('email'),
      advertiser_id: sessionStorage.getItem('advertiser_id'),
    };
    checkSameEmail(params)
      .then((res) => {
        if (res.data.status === false) {
          setEmailError(res.data.message);
        } else {
          setEmailError('');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          setEmailError('');
        }
      });
  };

  const onClickUCSubmit = async (data: any) => {
    if (error !== '') {
      return false;
    }
    const payload = _.omit(
      {
        ...data,
        ad_accounts: accountIds.map((item: any) => item.value),
      },
      ['tmpPw']
    );
    createUser(payload)
      .then((res: any) => {
        if (res) {
          navigate('/account/member');
        }
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  return (
    <div>
      <AppPageHeader title={'사용자 추가'} />

      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              아이디
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'signin_id'}
              control={UC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    onBlur={chkId}
                    style={{ width: '450px', marginRight: '10px' }}
                    maxLength={16}
                    onChange={(value) => {
                      field.onChange(value);
                      setSigninId(value);
                    }}
                    value={field.value}
                    placeholder={'영문 소문자/숫자 6~16자'}
                  />
                );
              }}
              rules={{
                required: '아이디를 입력해 주세요.',
                minLength: {
                  value: 6,
                  message: '아이디는 6~16자로 입력해 주세요',
                },
                pattern: {
                  value: REGEXP_EN_NUM,
                  message: '아이디는 영문 소문자, 숫자 사용 가능합니다.',
                },
              }}
            />
            <ErrorMessage
              errors={UC_errors}
              name={'signin_id'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
            <AppErrorMessage>{error}</AppErrorMessage>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              비밀번호
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'pw'}
              control={UC_control}
              render={({ field }) => {
                return (
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
                );
              }}
              rules={{
                required: '비밀번호를 입력해 주세요.',
                minLength: {
                  value: 8,
                  message: '비밀번호는 8~20자로 입력해 주세요',
                },
                pattern: {
                  value: REGEXP_EN_NUM_SPECIAL_COMBINATION,
                  message: '비밀번호는 영문, 숫자, 특수문자 조합으로 입력해 주세요.',
                },
              }}
            />
            <ErrorMessage
              errors={UC_errors}
              name={'pw'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              비밀번호 확인
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'tmpPw'}
              control={UC_control}
              render={({ field }) => {
                return (
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
                      {visibleConfirm ? <img src={eye} alt={'eye'} /> : <img src={disabledEye} alt={'eye'} />}
                    </AppInputGroup.Button>
                  </AppInputGroup>
                );
              }}
              rules={{
                required: '비밀번호와 일치하지 않습니다.',
                validate: (value) => value === watchPw || '비밀번호와 일치하지 않습니다.',
              }}
            />
            <ErrorMessage
              errors={UC_errors}
              name={'tmpPw'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              이름
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'name'}
              control={UC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    style={{ width: '450px', marginRight: '10px' }}
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
              errors={UC_errors}
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
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              이메일
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'email'}
              control={UC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    style={{ width: '450px', marginRight: '10px' }}
                    maxLength={80}
                    onBlur={chkEmail}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    placeholder={'example@onestore.com'}
                  />
                );
              }}
              rules={{
                required: '이메일 주소를 입력해 주세요.',
                // pattern: {
                //   value: REGEXP_EMAIL,
                //   message: '이메일 형식에 맞게 입력해 주세요.(영문(대소), 숫자, @, 언더바(_), ., -, 사용 가능)',
                // },
              }}
            />
            <ErrorMessage
              errors={UC_errors}
              name={'email'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
            <AppErrorMessage>{emailError}</AppErrorMessage>
          </div>
          <div className={'col col-extra'}>
            <AppTypography.Text type={'sub'} className={'text'}>
              영문(대소), 숫자, @, 언더바(_), ., -, 사용 가능
            </AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              휴대폰 번호
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'tel'}
              control={UC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    style={{ width: '450px', marginRight: '10px' }}
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
              errors={UC_errors}
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
              defaultValue={sessionRole !== 'AGENCY' ? 'ADVERTISER_EMPLOYEE' : 'AGENCY'}
              control={UC_control}
              render={({ field }) => {
                return (
                  <RadioGroup
                    inline
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <Radio value="ADVERTISER_EMPLOYEE" disabled={sessionRole === 'AGENCY'}>
                      광고주 User
                    </Radio>
                    <Radio value="AGENCY">대행사 User</Radio>
                    <Radio value="REPORT_VIEWER">성과 Viewer</Radio>
                  </RadioGroup>
                );
              }}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              광고계정
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'ad_accounts'}
              control={UC_control}
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
                  />
                );
              }}
              rules={{
                required: accountIds.length < 1 && '광고계정을 선택해 주세요.',
              }}
            />
            <ErrorMessage
              errors={UC_errors}
              name={'ad_accounts'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
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
          onClick={UC_handleSubmit(onClickUCSubmit)}
        >
          완료
        </AppButton>
      </AppPageFooter>

      <ConfirmModal
        size={'xs'}
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onOk={() => navigate('/account/member')}
        okText={'확인'}
        content={<AppTypography.Text>사용자 추가를 취소하시겠습니까?</AppTypography.Text>}
        title={'사용자 추가 취소'}
      />
    </div>
  );
};

export default AccountMemberCreate;
