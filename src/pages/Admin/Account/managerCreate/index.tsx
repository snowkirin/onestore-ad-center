import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import AppInputCount from '@components/AppInput/AppInputCount';
import { checkAdminId, createAdmin } from '@apis/admin.api';
import { AppInput, AppInputGroup } from '@components/AppInput';
import eye from '@assets/images/icons/eye/eye-big.svg';
import disabledEye from '@assets/images/icons/eye/eye-disabled.svg';
import { Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import warning from '@assets/images/icons/warning/warning-big.svg';
import {
  REGEXP_EMAIL,
  REGEXP_EN_KR_SPACE,
  REGEXP_EN_NUM,
  REGEXP_EN_NUM_SPECIAL_COMBINATION,
  REGEXP_NUMBER,
} from '@utils/regexp';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppPageFooter from '@components/AppPageFooter';
import AppPageHeader from '@components/AppPageHeader';
import AppRadioGroup, { AppRadio } from '@components/AppRadio';

interface AdminAccountManagerCreateProps {}

const AdminAccountManagerCreate: React.FC<AdminAccountManagerCreateProps> = () => {
  const navigate = useNavigate();

  // 저장값
  const [signinId, setSigninId] = useState('');
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [error, setError] = useState('');

  const {
    handleSubmit: AD_MC_handleSubmit,
    control: AD_MC_control,
    formState: { errors: AD_MC_errors },
    watch: AD_MC_watch,
  } = useForm();

  const watchPw = AD_MC_watch('pw');

  const handleChange = () => {
    setVisible(!visible);
  };

  const handleChangeConfirm = () => {
    setVisibleConfirm(!visibleConfirm);
  };

  const cancelSave = () => {
    if (!confirm('관리자 추가를 취소하시겠습니까?')) {
      return;
    }
    navigate('/admin/account/manager');
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

  const onClickADMCSubmit = async (data: any) => {
    const AD_MC_data = data;
    if (error === '') {
      createAdmin(AD_MC_data).then((res: any) => {
        if (res) {
          navigate('/admin/account/manager');
        }
      });
    }
  };

  return (
    <div>
      <AppPageHeader title={'관리자 추가'} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              아이디
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'signin_id'}
              control={AD_MC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    onBlur={chkId}
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
                  message: '아이디는 6~16자로 입력해 주세요.',
                },
                pattern: {
                  value: REGEXP_EN_NUM,
                  message: '아이디는 영문 소문자, 숫자 사용 가능합니다.',
                },
              }}
            />
            <ErrorMessage
              errors={AD_MC_errors}
              name={'signin_id'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
            <AppErrorMessage>{error}</AppErrorMessage>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              비밀번호
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'pw'}
              control={AD_MC_control}
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
                  message: '비밀번호는 8~20자로 입력해 주세요.',
                },
                pattern: {
                  value: REGEXP_EN_NUM_SPECIAL_COMBINATION,
                  message: '비밀번호는 영문, 숫자, 특수문자 조합으로 입력해 주세요.',
                },
              }}
            />
            <ErrorMessage
              errors={AD_MC_errors}
              name={'pw'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              비밀번호 확인
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'tmpPw'}
              control={AD_MC_control}
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
                required: '비밀번호가 일치하지 않습니다.',
                validate: (value) => value === watchPw || '비밀번호와 일치하지 않습니다.',
              }}
            />
            <ErrorMessage
              errors={AD_MC_errors}
              name={'tmpPw'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              이름
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'name'}
              control={AD_MC_control}
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
              errors={AD_MC_errors}
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
            <AppTypography.Label isRequired className={'text'}>
              이메일
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'email'}
              control={AD_MC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={80}
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
                pattern: {
                  value: REGEXP_EMAIL,
                  message: '이메일 형식에 맞게 입력해 주세요.(영문(대소), 숫자, @, 언더바(_), ., -, 사용 가능)',
                },
              }}
            />
            <ErrorMessage
              errors={AD_MC_errors}
              name={'email'}
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
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              휴대폰 번호
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'tel'}
              control={AD_MC_control}
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
              errors={AD_MC_errors}
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
              defaultValue={'ADMIN'}
              control={AD_MC_control}
              render={({ field }) => {
                return (
                  <AppRadioGroup
                    style={{ display: 'flex', alignItems: 'center' }}
                    inline
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <AppRadio value="ADMIN">운영자</AppRadio>
                    <AppRadio value="ADMIN_FINANCE">재무</AppRadio>
                    <Whisper
                      trigger="hover"
                      placement="bottomStart"
                      enterable
                      speaker={
                        <AppPopover theme={'white'}>대시보드, 정산, 조직/계정 메뉴에만 접근할 수 있습니다.</AppPopover>
                      }
                    >
                      <span style={{ marginLeft: '3px' }}>
                        <img src={warning} alt={'warning'} />
                      </span>
                    </Whisper>
                    <AppRadio value="ADMIN_CS">CS</AppRadio>
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
                      <span style={{ marginLeft: '3px' }}>
                        <img src={warning} alt={'warning'} />
                      </span>
                    </Whisper>
                  </AppRadioGroup>
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
          onClick={AD_MC_handleSubmit(onClickADMCSubmit)}
        >
          완료
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default AdminAccountManagerCreate;
