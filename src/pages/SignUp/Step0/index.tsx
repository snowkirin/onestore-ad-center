import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import styled from 'styled-components';
import clsx from 'clsx';
import IMG_BUSINESS from '@assets/images/img_business.svg';
import IMG_PERSONAL from '@assets/images/img_personal.svg';
import { AppInput, AppInputCount } from '@components/AppInput';
import { Controller, useForm } from 'react-hook-form';
import { AppButton } from '@components/AppButton';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import _ from 'lodash';
import { existsBusinessNumber, sendJoinEmail, verifyJoinEmail } from '@apis/signup_api';
import { Checkbox, CheckboxGroup } from 'rsuite';
import AppDivider from '@components/AppDivider';
import AlertModal from '@components/AppModal/AlretModal';
import { REGEXP_EMAIL } from '@utils/regexp';

interface SignUpStep0Props {
  formData: any;
  onTypeChange: (type: string) => void;
  onBusinessLicenseNumberChange: (businessLicenseNumber: string) => void;
  onEmailChange: (email: string) => void;
  onStepChange: (step: number) => void;
  onReceiveMarketingChange: (receiveMarketingEmail: boolean) => void;
}

const StyledWrapper = styled.div`
  padding-top: 130px;

  .terms {
    width: 489px;
    margin: 0 auto;

    .button__wrapper {
      text-align: center;
      margin-top: 60px;
    }
  }

  .select-type__wrapper {
    text-align: center;

    .type {
      display: flex;
      justify-content: center;
      margin-top: 19px;

      &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 140px;
        height: 140px;
        cursor: pointer;
        border: 3px solid #e3e3e3;
        border-radius: 8px;

        :hover {
          border: 3px solid var(--primary-color);
        }

        &:first-child {
          margin-right: 15px;
        }

        .text {
          font-size: 13px;
          line-height: 20px;
          font-weight: 700;
          margin-top: 19px;
        }
      }
    }
  }

  .business {
    text-align: left;
    // 22.10.29 input 박스 width값 변경해서 맨 앞 숫자를 610px로 변경
    width: calc(580px - 38px - 26px);
    margin: 0 auto;

    .title {
      text-align: center;
    }

    .inputs {
      display: flex;
      align-items: center;
      margin-top: 30px;

      .dash {
        margin-left: 6px;
        margin-right: 6px;
        font-size: 14px;
        font-weight: 700;
      }

      .button {
        margin-left: 10px;
      }
    }

    .link {
      margin-top: 15px;
    }
  }

  .email-auth {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
    }

    .inputs {
      margin-top: 30px;

      &__item {
        display: flex;
        margin-top: 10px;

        &:first-child {
          margin-top: 0;
        }

        > div {
          position: relative;

          &:first-child {
            width: 250px;
            margin-right: 10px;
          }
        }
      }
    }

    .link {
      margin-top: 15px;
      margin-left: -270px;
    }
  }
`;

const SignUpStep0: React.FC<SignUpStep0Props> = ({
  formData,
  onTypeChange,
  onBusinessLicenseNumberChange,
  onEmailChange,
  onStepChange,
  onReceiveMarketingChange,
}) => {
  const navigate = useNavigate();

  // 동의 관련 폼
  const {
    control: CHK_control,
    setValue: CHK_setValue,
    clearErrors: CHK_clearErrors,
    getValues: CHK_getValues,
    watch: CHK_watch,
  } = useForm();
  const watchChecked = CHK_watch('checked', []);

  // 사업자등록번호 (Business License Number) 폼
  const {
    handleSubmit: BLN_handleSubmit,
    control: BLN_control,
    reset: BLN_reset,
    formState: { errors: BLN_errors },
  } = useForm();

  // 이메일 인증 (Email Authentication) 폼
  const {
    handleSubmit: EA_handleSubmit,
    control: EA_control,
    getValues: EA_getValues,
    reset: EA_reset,
    formState: { errors: EA_errors },
  } = useForm();

  // 인증번호 (Authentication Number) 폼
  const {
    handleSubmit: AN_handleSubmit,
    control: AN_control,
    reset: AN_reset,
    formState: { errors: AN_errors },
  } = useForm();

  // 가입여부확인 스텝
  // 1 - 사업자/개인 선택
  // 2 - 사업자등록번호 입력
  // 3 - 이메일 인증
  const [confirmMemberStep, setConfirmMemberStep] = useState(0);
  const [isExistBusinessNumber, setIsExistBusinessNumber] = useState(false);
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState({
    title: '',
    content: '',
  });

  const getErrorMessage = (errors: any) => {
    const BLN = errors['business_license_number'];
    const BLN_keys = _.keys(BLN);
    return BLN[BLN_keys[0]].message;
  };

  const handleAlertModalOk = () => {
    setAlertModalMessage({
      title: '',
      content: '',
    });
    setIsAlertModalOpen(false);
  };

  const handleAllAgreeCheck = (checked: boolean) => {
    if (!checked) {
      CHK_setValue('checked', []);
    } else {
      CHK_setValue('checked', ['A', 'B', 'C', 'D', 'E']);
      CHK_clearErrors('checked');
    }
  };
  const handleCHKSubmit = () => {
    const agreeValues = CHK_getValues();
    const agreeRequired = ['A', 'B', 'C', 'D'].every((item) => agreeValues.checked.includes(item));
    if (!agreeValues.check_age) {
      setAlertModalMessage({
        title: '만 14세 이상 가입 가능',
        content: '회원가입은 만 14세 이상만 가능함을 확인해 주세요.',
      });
      setIsAlertModalOpen(true);
      return;
    }
    if (!agreeRequired) {
      setAlertModalMessage({
        title: '필수 약관 동의',
        content: '약관에 동의해 주세요.',
      });
      setIsAlertModalOpen(true);
      return;
    } else {
      if (agreeValues.checked.includes('E')) {
        onReceiveMarketingChange(true);
      }
      setConfirmMemberStep(1);
    }
  };

  // 이전 페이지로 이동
  const handlePrevPageLinkClick = () => {
    if (formData.type === 'BUSINESS') {
      // 기업
      if (confirmMemberStep === 2) {
        // 사업자 등록번호 입력부분
        BLN_reset();
        onTypeChange('');
        onBusinessLicenseNumberChange('');
        setConfirmMemberStep(1);
      }
      if (confirmMemberStep === 3) {
        // 이메일 인증 부분
        EA_reset();
        AN_reset();
        setIsSendEmail(false);
        onEmailChange('');
        setConfirmMemberStep(2);
      }
    } else {
      // 개인 - 이메일 인증 부분
      EA_reset();
      AN_reset();
      onTypeChange('');
      onEmailChange('');
      setIsSendEmail(false);
      setConfirmMemberStep(1);
    }
  };
  const handleBLNSubmit = (data: any) => {
    const businessLicenseNumberData = data['business_license_number'];
    const businessLicenseNumber = `${businessLicenseNumberData.first}-${businessLicenseNumberData.second}-${businessLicenseNumberData.third}`;

    existsBusinessNumber({ queryParams: { business_license_number: businessLicenseNumber } }).then(({ data }) => {
      if (!data.status) {
        // 중복되지 않은 사업자등록번호
        alert('가입 가능한 사업자등록번호입니다.');
        onBusinessLicenseNumberChange(businessLicenseNumber);
        setConfirmMemberStep(3);
      } else {
        // 중복된 사업자등록번호
        alert('이미 가입된 사업자등록번호입니다.');
        setIsExistBusinessNumber(true);
      }
    });
  };
  // 인증메일발송 버튼 클릭시
  const handleEASubmit = (data: any) => {
    sendJoinEmail({
      bodyParams: {
        email: data.email_auth,
      },
    }).then(({ data }) => {
      if (data.status) {
        setIsSendEmail(true);
      } else {
        alert(data.message);
      }
    });
  };
  // 인증번호 확인 버튼 클릭시
  const handleANSubmit = (data: any) => {
    const email = EA_getValues('email_auth');
    const bodyParams = {
      email,
      code: data.auth_number,
    };
    verifyJoinEmail({
      bodyParams,
    }).then(({ data }) => {
      if (data.status) {
        // 인증 성공
        alert('인증이 완료되었습니다.');
        onEmailChange(email);
        onStepChange(1);
      } else {
        // 인증 실패
        alert(data.message);
      }
    });
  };
  useEffect(() => {
    return () => {
      BLN_reset();
      EA_reset();
      AN_reset();
      setConfirmMemberStep(0);
      setIsExistBusinessNumber(false);
      setIsSendEmail(false);
    };
  }, []);

  return (
    <StyledWrapper>
      {confirmMemberStep === 0 && (
        <div className={'terms'}>
          <div className={'terms-checkbox'}>
            <div>
              <Controller
                name={'check_age'}
                control={CHK_control}
                defaultValue={false}
                rules={{ required: '회원가입은 만 14세 이상만 가능함을 확인해 주세요.' }}
                render={({ field }) => (
                  <Checkbox onChange={(value, checked) => field.onChange(checked)}>
                    원스토어 광고센터 회원가입은 만 14세 이상만 가능합니다.
                  </Checkbox>
                )}
              />
            </div>
            <div>
              <Checkbox
                checked={watchChecked.length === 5}
                onChange={(value, checked) => {
                  handleAllAgreeCheck(checked);
                }}
              >
                아래 약관에 모두 동의합니다.
              </Checkbox>
            </div>
          </div>
          <AppDivider style={{ margin: '15px 0 20px' }} />
          <div className={'terms-checkbox'}>
            <Controller
              name={'checked'}
              control={CHK_control}
              defaultValue={[]}
              render={({ field }) => {
                return (
                  <CheckboxGroup value={field.value} onChange={(value) => field.onChange(value)}>
                    <Checkbox value={'A'}>
                      [필수]{' '}
                      <AppTypography.Link
                        style={{ fontSize: 12 }}
                        onClick={() => window.open('/terms/service', '_blank')}
                      >
                        원스토어 광고센터 이용약관
                      </AppTypography.Link>{' '}
                      동의
                    </Checkbox>
                    <Checkbox value={'B'} style={{ marginTop: 5 }}>
                      [필수]{' '}
                      <AppTypography.Link
                        style={{ fontSize: 12 }}
                        onClick={() => window.open('/terms/privacy', '_blank')}
                      >
                        원스토어 광고센터 개인정보처리방침
                      </AppTypography.Link>{' '}
                      동의
                    </Checkbox>
                    <Checkbox value={'C'} style={{ marginTop: 5 }}>
                      [필수]{' '}
                      <AppTypography.Link
                        style={{ fontSize: 12 }}
                        onClick={() => window.open('/terms/privacy#thirdParty', '_blank')}
                      >
                        개인정보 제 3자 제공
                      </AppTypography.Link>{' '}
                      동의
                    </Checkbox>
                    <Checkbox value={'D'} style={{ marginTop: 5 }}>
                      [필수]{' '}
                      <AppTypography.Link
                        style={{ fontSize: 12 }}
                        onClick={() => window.open('/terms/collection', '_blank')}
                      >
                        개인정보 수집 및 이용
                      </AppTypography.Link>{' '}
                      동의
                    </Checkbox>
                    <Checkbox value={'E'} style={{ marginTop: 5 }}>
                      [선택] 광고성 정보 이메일 수신 동의
                    </Checkbox>
                  </CheckboxGroup>
                );
              }}
              rules={{
                validate: (value) => {
                  return ['A', 'B', 'C', 'D'].every((item) => value.includes(item)) || '약관에 동의해 주세요.';
                },
              }}
            />
          </div>
          <div className={'button__wrapper'}>
            <AppButton size={'lg'} style={{ width: 100 }} onClick={() => navigate('/')}>
              취소
            </AppButton>
            <AppButton theme={'red'} size={'lg'} style={{ width: 100, marginLeft: 15 }} onClick={handleCHKSubmit}>
              다음
            </AppButton>
          </div>
        </div>
      )}
      {confirmMemberStep === 1 && (
        <div className={'select-type__wrapper'}>
          <div>
            <AppTypography.SubTitle level={2}>원스토어 광고센터 가입 여부 확인을 진행합니다.</AppTypography.SubTitle>
            <AppTypography.SubTitle level={2}>사업자/개인을 선택해 주세요.</AppTypography.SubTitle>
          </div>
          <div className={'type'}>
            <div
              className={clsx('type__item')}
              onClick={() => {
                setConfirmMemberStep(2);
                onTypeChange('BUSINESS');
              }}
            >
              <div className={'img'}>
                <img src={IMG_BUSINESS} alt={'사업자'} />
              </div>
              <AppTypography.Text className={'text'}>사업자</AppTypography.Text>
            </div>
            <div
              className={clsx('type__item')}
              onClick={() => {
                setConfirmMemberStep(3);
                onTypeChange('PERSONAL');
              }}
            >
              <div className={'img'}>
                <img src={IMG_PERSONAL} alt={'개인'} />
              </div>
              <AppTypography.Text className={'text'}>개인</AppTypography.Text>
            </div>
          </div>
        </div>
      )}
      {/* 비지니스 인증 */}
      {confirmMemberStep === 2 && (
        <div className={'business'}>
          {/* 사업자 등록번호 입력 */}
          <div className={'title'}>
            <AppTypography.SubTitle level={2}>사업자등록번호를 입력해 주세요.</AppTypography.SubTitle>
          </div>
          <div className={'inputs'}>
            <div>
              <Controller
                name={'business_license_number.first'}
                control={BLN_control}
                defaultValue={''}
                render={({ field }) => {
                  return (
                    <AppInputCount
                      maxLength={3}
                      className={clsx({ 'input-error': isExistBusinessNumber })}
                      style={{ width: 110 }}
                      value={field.value}
                      onChange={(value) => {
                        setIsExistBusinessNumber(false);
                        field.onChange(value);
                      }}
                    />
                  );
                }}
                rules={{
                  required: '사업자등록번호를 입력해 주세요',
                  minLength: {
                    value: 3,
                    message: '사업자등록번호 형식에 맞게 입력해 주세요.',
                  },
                  pattern: {
                    value: /^[0-9]*$/,
                    message: '사업자등록번호 형식에 맞게 입력해 주세요.',
                  },
                }}
              />
            </div>
            <div className={'dash'}>-</div>
            <div>
              <Controller
                name={'business_license_number.second'}
                control={BLN_control}
                render={({ field }) => (
                  <AppInputCount
                    maxLength={2}
                    className={clsx({ 'input-error': isExistBusinessNumber })}
                    style={{ width: 95 }}
                    value={field.value}
                    onChange={(value) => {
                      setIsExistBusinessNumber(false);
                      field.onChange(value);
                    }}
                  />
                )}
                rules={{
                  required: '사업자등록번호를 입력해 주세요',
                  minLength: {
                    value: 2,
                    message: '사업자등록번호 형식에 맞게 입력해 주세요.',
                  },
                  pattern: {
                    value: /^[0-9]*$/,
                    message: '사업자등록번호 형식에 맞게 입력해 주세요.',
                  },
                }}
              />
            </div>
            <div className={'dash'}>-</div>
            <div>
              <Controller
                name={'business_license_number.third'}
                control={BLN_control}
                render={({ field }) => (
                  <AppInputCount
                    maxLength={5}
                    className={clsx({ 'input-error': isExistBusinessNumber })}
                    style={{ width: 190 }}
                    value={field.value}
                    onChange={(value) => {
                      setIsExistBusinessNumber(false);
                      field.onChange(value);
                    }}
                  />
                )}
                rules={{
                  required: '사업자등록번호를 입력해 주세요',
                  minLength: {
                    value: 5,
                    message: '사업자등록번호 형식에 맞게 입력해 주세요.',
                  },
                  pattern: {
                    value: /^[0-9]*$/,
                    message: '사업자등록번호 형식에 맞게 입력해 주세요.',
                  },
                }}
              />
            </div>
            <div className={'button'}>
              <AppButton
                style={{ width: 70, padding: 0 }}
                theme={'red'}
                size={'md'}
                onClick={BLN_handleSubmit(handleBLNSubmit)}
              >
                확인
              </AppButton>
            </div>
          </div>
          <div className={'error-message'}>
            <AppErrorMessage>
              {!_.isEmpty(BLN_errors) && !_.isEmpty(BLN_errors['business_license_number']) && (
                <>{getErrorMessage(BLN_errors)}</>
              )}
            </AppErrorMessage>
          </div>
          <div className={'link'}>
            <AppTypography.Link onClick={handlePrevPageLinkClick}>&lt; 이전 단계로 이동 </AppTypography.Link>
          </div>
        </div>
      )}
      {/* 이메일 인증 */}
      {confirmMemberStep === 3 && (
        <div className={'email-auth'}>
          <div className={'title'}>
            <AppTypography.SubTitle level={2}>
              원스토어 광고센터에서 사용할 이메일 주소를 입력하고 인증을 진행해 주세요.
            </AppTypography.SubTitle>
          </div>
          <div className="inputs">
            <div className={'inputs__item'}>
              <div>
                <Controller
                  name={'email_auth'}
                  control={EA_control}
                  render={({ field }) => (
                    <AppInput
                      placeholder={'example@onestore.com'}
                      value={field.value}
                      style={{ width: 250, height: 32 }}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: '이메일 주소를 입력해 주세요.',
                    pattern: {
                      value: REGEXP_EMAIL,
                      message: '이메일 형식에 맞게 입력해 주세요.(영문(대소), 숫자, @, 언더바(_), ., - 사용 가능)',
                    },
                  }}
                />
                <ErrorMessage
                  errors={EA_errors}
                  name={'email_auth'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div>
                <AppButton
                  theme={'gray'}
                  size={'md'}
                  style={{ width: 100, padding: 0 }}
                  onClick={EA_handleSubmit(handleEASubmit)}
                >
                  {isSendEmail ? '인증 메일 재발송' : '인증 메일 발송'}
                </AppButton>
              </div>
            </div>
            {isSendEmail && (
              <AppTypography.Text>
                인증 메일을 발송하였습니다. 1시간 이내에 인증번호를 입력해 주세요.
              </AppTypography.Text>
            )}
            <div className={'inputs__item'}>
              <div>
                <Controller
                  name={'auth_number'}
                  control={AN_control}
                  render={({ field }) => (
                    <AppInput
                      placeholder={'인증번호 입력'}
                      value={field.value}
                      style={{ width: 250, height: 32 }}
                      disabled={!isSendEmail}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: '인증번호를 입력해 주세요',
                    pattern: {
                      value: /^[0-9]*$/,
                      message: '인증번호 형식에 맞게 입력해 주세요.',
                    },
                  }}
                />
                <ErrorMessage
                  errors={AN_errors}
                  name={'auth_number'}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div>
                <AppButton
                  theme={'red'}
                  size={'md'}
                  style={{ width: 100 }}
                  onClick={AN_handleSubmit(handleANSubmit)}
                  disabled={!isSendEmail}
                >
                  확인
                </AppButton>
              </div>
            </div>
          </div>
          <div className={'link'}>
            <AppTypography.Link onClick={handlePrevPageLinkClick}>&lt; 이전 단계로 이동</AppTypography.Link>
          </div>
        </div>
      )}

      <AlertModal
        open={isAlertModalOpen}
        onOk={handleAlertModalOk}
        content={<AppTypography.Text>{alertModalMessage.content}</AppTypography.Text>}
        title={alertModalMessage.title}
      />
    </StyledWrapper>
  );
};

export default SignUpStep0;
