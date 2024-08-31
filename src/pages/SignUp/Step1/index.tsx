import React, { useEffect, useState } from 'react';
import AppTypography from '@components/AppTypography';
import { Controller, useForm } from 'react-hook-form';
import { AppInput, AppInputCount, AppInputGroup } from '@components/AppInput';
import styled from 'styled-components';
import AppDivider from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import _ from 'lodash';
import { signUp } from '@apis/signup_api';
import { useNavigate } from 'react-router-dom';
import eye from '@assets/images/icons/eye/eye-big.svg';
import disabledEye from '@assets/images/icons/eye/eye-disabled.svg';
import { ConfirmModal } from '@components/AppModal';
import { checkAdminId } from '@apis/admin.api';

interface SignUpStep1Props {
  formData: any;
  onStepChange: (step: number) => void;
}

const StyledEnterInfo = styled.div`
  width: 630px;
  padding-top: 80px;
  padding-bottom: 50px;
  margin: 0 auto;
  .row {
    display: flex;
    margin-top: 10px;
  }
  .col {
    flex: 0 0 auto;
  }
  .col-label {
    width: 120px;
    padding-left: 18px;
    .label-text {
      line-height: 32px;
    }
  }
  .col-form {
    width: 320px;
  }
  .col-extra {
    padding-left: 10px;
  }

  .advertiser-info {
    margin-top: 40px;
  }
  .footer {
    margin-bottom: 60px;
    .button {
      text-align: center;
      margin-top: 60px;
    }
  }
`;

const SignUpStep1: React.FC<SignUpStep1Props> = ({ formData, onStepChange }) => {
  const {
    handleSubmit,
    control,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const watchPassword = watch('pw', '');
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [isCheckID, setIsCheckID] = useState<'EXIST' | 'NOT_EXIST' | ''>('');
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

  const handleChange = () => {
    setVisible(!visible);
  };

  const handleChangeConfirm = () => {
    setVisibleConfirm(!visibleConfirm);
  };

  const handleConfirmModalClose = () => {
    setIsOpenConfirmModal(false);
  };

  const handleConfirmModalOk = () => {
    navigate('/');
  };

  const onSubmit = (data: any) => {
    const uselessData = _.omit(data, ['confirm_pw']);
    const bodyParams = Object.entries({
      ...formData,
      ...uselessData,
    }).reduce((acc, [k, v]) => (v ? { ...acc, [k]: v } : acc), {});
    signUp({ bodyParams })
      .then(() => {
        onStepChange(2);
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };

  const handleSigninBlur = (value: string) => {
    if (/^[a-z0-9]+$/.test(value) && value.length >= 6) {
      checkAdminId(getValues('signin_id')).then((res) => {
        if (res.data.status === false) {
          setIsCheckID('EXIST');
        } else {
          setIsCheckID('NOT_EXIST');
        }
      });
    }
  };
  const handleSigninFocus = () => {
    setIsCheckID('');
  };

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return (
    <StyledEnterInfo>
      <div className={'user-info'}>
        <div className={'text'}>
          <AppTypography.SubTitle level={2}>사용자 정보</AppTypography.SubTitle>
        </div>
        <AppDivider style={{ margin: '5px 0' }} />
        <div className={'form'}>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                아이디
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'signin_id'}
                control={control}
                render={({ field }) => (
                  <AppInputCount
                    onBlur={() => handleSigninBlur(field.value)}
                    onFocus={handleSigninFocus}
                    maxLength={16}
                    placeholder={'영문 소문자/숫자 6~16자'}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
                rules={{
                  required: '아이디를 입력해 주세요.',
                  minLength: {
                    value: 6,
                    message: '아이디는 6~16자로 입력해 주세요.',
                  },
                  pattern: {
                    value: /^[a-z0-9]+$/,
                    message: '아이디는 영문 소문자, 숫자 사용 가능합니다.',
                  },
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'signin_id'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
              {!_.has(errors, 'signin_id') && isCheckID !== '' && (
                <AppErrorMessage>
                  {isCheckID === 'EXIST' && '이미 사용중인 아이디입니다. 다른 아이디를 입력해 주세요.'}
                  {isCheckID === 'NOT_EXIST' && '사용 가능한 아이디입니다.'}
                </AppErrorMessage>
              )}
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                비밀번호
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'pw'}
                control={control}
                render={({ field }) => (
                  <AppInputGroup>
                    <AppInput
                      maxLength={20}
                      placeholder={'영문, 숫자, 특수문자 조합 8~20자'}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      type={visible ? 'text' : 'password'}
                    />
                    <AppInputGroup.Button onClick={handleChange} style={{ border: 'none' }}>
                      {visible ? <img src={eye} alt={'eye'} /> : <img src={disabledEye} alt={'eye'} />}
                    </AppInputGroup.Button>
                  </AppInputGroup>
                )}
                rules={{
                  required: '비밀번호를 입력해 주세요.',
                  minLength: {
                    value: 8,
                    message: '비밀번호는 8~20자로 입력해 주세요.',
                  },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/,
                    message: '비밀번호는 영문, 숫자, 특수문자 조합으로 입력해 주세요.',
                  },
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'pw'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                비밀번호 확인
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'confirm_pw'}
                control={control}
                render={({ field }) => (
                  <AppInputGroup>
                    <AppInput
                      maxLength={20}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      type={visibleConfirm ? 'text' : 'password'}
                    />
                    <AppInputGroup.Button onClick={handleChangeConfirm}>
                      {visibleConfirm ? <img src={eye} alt={'eye'} /> : <img src={disabledEye} alt={'eye'} />}
                    </AppInputGroup.Button>
                  </AppInputGroup>
                )}
                rules={{
                  required: '비밀번호와 일치하지 않습니다.',
                  validate: (value) => value === watchPassword || '비밀번호와 일치하지 않습니다.',
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'confirm_pw'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                이름
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'name'}
                control={control}
                render={({ field }) => (
                  <AppInputCount
                    maxLength={16}
                    placeholder={'2~16자'}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
                rules={{
                  required: '이름을 입력해 주세요.',
                  minLength: {
                    value: 2,
                    message: '이름은 2~16자로 입력해 주세요.',
                  },
                  pattern: {
                    // 영문(대소), 한글, 띄어쓰기 사용가능
                    value: /^[a-zA-Z가-힣\s]+$/,
                    message: '이름은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                  },
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'name'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
            <div className={'col col-extra'}>
              <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                영문(대소), 한글, 띄어쓰기 사용 가능
              </AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                이메일
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <AppTypography.Text style={{ lineHeight: '32px' }}>{formData.email}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                휴대폰 번호
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'tel'}
                control={control}
                render={({ field }) => (
                  <AppInputCount
                    placeholder={'10~11자'}
                    maxLength={11}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
                rules={{
                  required: '휴대폰 번호를 입력해 주세요.',
                  minLength: {
                    value: 10,
                    message: '휴대폰 번호는 10~11자로 입력해 주세요.',
                  },
                  pattern: {
                    // 숫자만 입력가능
                    value: /^[0-9]*$/,
                    message: '휴대폰 번호는 숫자만 사용 가능합니다.',
                  },
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'tel'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
            <div className={'col col-extra'}>
              <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                숫자만 사용 가능
              </AppTypography.Text>
            </div>
          </div>
        </div>
      </div>
      <div className={'advertiser-info'}>
        <div className={'text'}>
          <AppTypography.SubTitle level={2}>광고주 정보</AppTypography.SubTitle>
        </div>
        <AppDivider style={{ margin: '5px 0' }} />

        <div className={'form'}>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'}>광고주 유형</AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <AppTypography.Text style={{ lineHeight: '32px' }}>
                {formData.type === 'PERSONAL' ? '개인' : '사업자'}
              </AppTypography.Text>
            </div>
          </div>
          {/* 사업자 등록번호 */}
          {formData.type === 'BUSINESS' && (
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'label-text'}>사업자등록번호</AppTypography.Label>
              </div>
              <div className={'col col-form'}>
                <AppTypography.Text style={{ lineHeight: '32px' }}>
                  {formData.business_license_number}
                </AppTypography.Text>
              </div>
            </div>
          )}
          {/* 광고주명 */}
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                광고주명
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'advertiser_name'}
                control={control}
                render={({ field }) => (
                  <AppInputCount
                    placeholder={'2~16자'}
                    maxLength={16}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
                rules={{
                  required: '광고주명을 입력해 주세요.',
                  minLength: {
                    value: 2,
                    message: '광고주명은 2~16자로 입력해 주세요.',
                  },
                  pattern: {
                    // 영문(대소), 한글, 숫자, 띄어쓰기 가능
                    value: /^[a-zA-Z가-힣0-9\s]+$/,
                    message: '광고주명은 영문(대소), 한글, 숫자, 띄어쓰기 사용 가능합니다.',
                  },
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'advertiser_name'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
            <div className={'col col-extra'}>
              <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                영문(대소), 한글, 숫자, 띄어쓰기 사용 가능
              </AppTypography.Text>
            </div>
          </div>
          {/* 대표자명 */}
          {formData.type === 'BUSINESS' && (
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'label-text'} isRequired>
                  대표자명
                </AppTypography.Label>
              </div>
              <div className={'col col-form'}>
                <Controller
                  name={'owner_name'}
                  control={control}
                  render={({ field }) => (
                    <AppInputCount
                      placeholder={'2~16자'}
                      maxLength={16}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: '대표자명을 입력해 주세요.',
                    minLength: {
                      value: 2,
                      message: '대표자명은 2~16자로 입력해 주세요.',
                    },
                    pattern: {
                      // 영문(대소), 한글, 띄어쓰기 가능
                      value: /^[a-zA-Z가-힣\s]+$/,
                      message: '대표자명은 영문(대소), 한글, 띄어쓰기 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={errors}
                  name={'owner_name'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                  영문(대소), 한글, 띄어쓰기 사용 가능
                </AppTypography.Text>
              </div>
            </div>
          )}
          {formData.type === 'PERSONAL' && (
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'label-text'} isRequired>
                  생년월일
                </AppTypography.Label>
              </div>
              <div className={'col col-form'}>
                <Controller
                  name={'birthday'}
                  control={control}
                  render={({ field }) => (
                    <AppInputCount
                      placeholder={'8자리'}
                      maxLength={8}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: '생년월일을 입력해 주세요.',
                    minLength: {
                      value: 8,
                      message: '생년월일은 형식에 맞게 입력해 주세요.',
                    },
                    pattern: {
                      // 숫자만 가능
                      value: /^[0-9]+$/,
                      message: '생년월일은 숫자만 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={errors}
                  name={'birthday'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                  숫자만 사용 가능
                </AppTypography.Text>
              </div>
            </div>
          )}
          {/* 사업자 주소 || 주소 */}
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'label-text'} isRequired>
                {formData.type === 'BUSINESS' ? '사업자 주소' : '주소'}
              </AppTypography.Label>
            </div>
            <div className={'col col-form'}>
              <Controller
                name={'address'}
                control={control}
                render={({ field }) => (
                  <AppInputCount maxLength={128} value={field.value} onChange={(value) => field.onChange(value)} />
                )}
                rules={{
                  required: formData.type === 'BUSINESS' ? '사업자 주소를 입력해 주세요.' : '주소를 입력해 주세요.',
                  pattern: {
                    // 영문(대소), 한글, 숫자, -, 띄어쓰기 사용가능
                    value: /^[a-zA-Z가-힣0-9\s-]+$/,
                    message:
                      formData.type === 'BUSINESS'
                        ? '사업자 주소는 영문(대소), 한글, 숫자, -, 띄어쓰기 사용 가능합니다.'
                        : '주소는 영문(대소), 한글, 숫자, -, 띄어쓰기 사용 가능합니다.',
                  },
                }}
              />
              <ErrorMessage
                errors={errors}
                name={'address'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </div>
            <div className={'col col-extra'}>
              <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                영문(대소), 한글, 숫자, -, 띄어쓰기 가능
              </AppTypography.Text>
            </div>
          </div>
        </div>
      </div>
      <AppDivider style={{ margin: '15px 0 20px' }} />
      <div className={'footer'}>
        <div className={'button'}>
          <AppButton theme={'white'} size={'lg'} style={{ width: 100 }} onClick={() => setIsOpenConfirmModal(true)}>
            취소
          </AppButton>
          <AppButton theme={'red'} size={'lg'} style={{ marginLeft: 15, width: 100 }} onClick={handleSubmit(onSubmit)}>
            완료
          </AppButton>
        </div>
      </div>
      <ConfirmModal
        open={isOpenConfirmModal}
        onClose={handleConfirmModalClose}
        title={'회원가입 신청 취소'}
        onOk={handleConfirmModalOk}
        okText={'확인'}
        size={'xs'}
        content={<AppTypography.Text>회원가입 신청을 취소하시겠습니까?</AppTypography.Text>}
      />
    </StyledEnterInfo>
  );
};

export default SignUpStep1;
