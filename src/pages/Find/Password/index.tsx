import React, { useState } from 'react';
import AppTypography from '@components/AppTypography';
import { Controller, useForm } from 'react-hook-form';
import { AppInput } from '@components/AppInput';
import Row from '@components/AppGrid/Row';
import Col from '@components/AppGrid/Col';
import { AppButton } from '@components/AppButton';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import { findPasswordByEmail, resetPassword } from '@apis/auth.api';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import CountDown from '@components/Common/CountDown';
import { useNavigate } from 'react-router-dom';

interface FindPWProps {}

const FindPW: React.FC<FindPWProps> = () => {
  const navigate = useNavigate();
  /* 인증 메일 발송 */
  const {
    control: PWV_control,
    handleSubmit: PWV_handleSubmit,
    getValues: PWV_getValues,
    formState: { errors: PWV_errors },
  } = useForm();

  /* 인증 번호 확인 */
  const {
    control: CODE_control,
    handleSubmit: CODE_handleSubmit,
    formState: { errors: CODE_errors },
  } = useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [isShowCountDown, setIsShowCountDown] = useState(false);
  const [isSendEmail, setIsSendEmail] = useState(false);
  const [isLimitText, setIsLimitText] = useState(false);
  // 존재하지 않은 이메일
  const [notExistEmail, setNotExistEmail] = useState(false);
  // 인증번호 틀림
  const [isNotMatchCode, setIsNotMatchCode] = useState(false);

  const onSubmitPWV = async (data: any) => {
    setIsShowCountDown(false);
    const result = await findPasswordByEmail(data);
    if (result.data.status) {
      setIsShowCountDown(true);
      setIsLimitText(true);
      setIsSendEmail(true);
    } else {
      setNotExistEmail(true);
      setIsShowCountDown(false);
      setIsSendEmail(false);
    }
  };
  const onSubmitCODE = async (data: any) => {
    const payload = {
      signin_id: PWV_getValues('signin_id'),
      email: PWV_getValues('email'),
      ...data,
    };
    const result = await resetPassword(payload);
    if (result.data.status) {
      alert('인증이 완료되었습니다.');
      setCurrentStep(1);
    } else {
      alert(result.data.message);
      //setIsNotMatchCode(true);
    }
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: 155 }}>
      <AppTypography.Headline style={{ marginBottom: 60 }}>
        <img src={OneStoreLogo} style={{ width: 130, marginRight: 5 }} alt={'ONE store'} />
        <span>광고센터</span>
      </AppTypography.Headline>
      <AppTypography.Headline style={{ marginBottom: 15 }}>비밀번호 찾기</AppTypography.Headline>
      <div style={{ marginBottom: 30 }}>
        {currentStep === 0 && (
          <>
            <AppTypography.Text>비밀번호를 잊으셨나요?</AppTypography.Text>
            <AppTypography.Text>가입하신 아이디와 회원 정보에 등록된 이메일을 입력해 주세요.</AppTypography.Text>
          </>
        )}
        {currentStep === 1 && (
          <>
            <AppTypography.Text>입력하신 이메일로 임시 비밀번호를 발송하였습니다.</AppTypography.Text>
            <AppTypography.Text>로그인 후 새로운 비밀번호로 변경해 주세요.</AppTypography.Text>
          </>
        )}
      </div>
      {currentStep === 0 && (
        <div style={{ display: 'inline-block', textAlign: 'left' }}>
          <Row>
            <Col style={{ flex: '0 0 250px' }}>
              <Controller
                name={'signin_id'}
                control={PWV_control}
                render={({ field }) => (
                  <AppInput
                    value={field.value}
                    style={{ height: 32 }}
                    onChange={(value) => {
                      setNotExistEmail(false);
                      setIsLimitText(false);
                      field.onChange(value);
                    }}
                    placeholder={'아이디 입력'}
                  />
                )}
                rules={{
                  required: '아이디를 입력해 주세요.',
                }}
              />
              <ErrorMessage
                errors={PWV_errors}
                name={'signin_id'}
                render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
              />
            </Col>
          </Row>

          <form onSubmit={PWV_handleSubmit(onSubmitPWV)}>
            <Row style={{ marginTop: 10 }}>
              <Col style={{ flex: '0 0 auto', width: 250, marginRight: 5 }}>
                <Controller
                  name={'email'}
                  control={PWV_control}
                  render={({ field }) => (
                    <AppInput
                      value={field.value}
                      style={{ height: 32 }}
                      onChange={(value) => {
                        setNotExistEmail(false);
                        setIsLimitText(false);
                        field.onChange(value);
                      }}
                      placeholder={'example@onestore.com'}
                    />
                  )}
                  rules={{
                    required: '이메일을 입력해 주세요.',
                  }}
                />
              </Col>
              <Col style={{ flex: '0 0 auto', position: 'relative' }}>
                <AppButton
                  onClick={PWV_handleSubmit(onSubmitPWV)}
                  theme={'gray'}
                  size={'md'}
                  type={'button'}
                  style={{ width: 100, padding: 0 }}
                >
                  {isSendEmail ? '인증 메일 재발송' : '인증 메일 발송'}
                </AppButton>
                {isShowCountDown && <CountDown style={{ position: 'absolute', top: 6, left: 'calc(100% + 15px)' }} />}
              </Col>
            </Row>
            {isLimitText && (
              <AppTypography.Text>인증 메일이 발송되었습니다. 10분 이내에 인증번호를 입력해 주세요.</AppTypography.Text>
            )}
            {notExistEmail && (
              <AppErrorMessage>입력하신 이메일로 회원 정보를 찾을 수 없습니다. 다시 확인해주세요.</AppErrorMessage>
            )}
            <ErrorMessage
              name={'email'}
              errors={PWV_errors}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </form>
          <form onSubmit={CODE_handleSubmit(onSubmitCODE)}>
            <Row style={{ marginTop: 10 }}>
              <Col style={{ flex: '0 0 auto', width: 250, marginRight: 5 }}>
                <Controller
                  name={'code'}
                  control={CODE_control}
                  render={({ field }) => (
                    <AppInput
                      value={field.value}
                      style={{ height: 32 }}
                      onChange={(value) => {
                        setIsNotMatchCode(false);
                        field.onChange(value);
                      }}
                      disabled={!isSendEmail}
                      placeholder={'인증번호 입력'}
                    />
                  )}
                  rules={{
                    required: '인증번호를 입력해 주세요.',
                  }}
                />
              </Col>
              <Col style={{ flex: '0 0 auto' }}>
                <AppButton onClick={CODE_handleSubmit(onSubmitCODE)} theme={'red'} size={'md'} style={{ width: 100 }}>
                  확인
                </AppButton>
              </Col>
            </Row>
            <ErrorMessage
              name={'code'}
              errors={CODE_errors}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
            {isNotMatchCode && <AppErrorMessage>인증번호를 정확히 입력해 주세요.</AppErrorMessage>}
          </form>
        </div>
      )}
      {currentStep === 1 && (
        <div style={{ display: 'inline-block' }}>
          {/*<AppButton theme={'red'} onClick={() => navigate('/')} style={{ marginLeft: 5 }}>*/}
          {/*  로그인*/}
          {/*</AppButton>*/}
          <AppButton
            theme={'red'}
            type={'button'}
            style={{ width: 300, height: 32, padding: 0, textAlign: 'center', marginLeft: 5 }}
            size={'md'}
            onClick={() => navigate('/')}
          >
            로그인
          </AppButton>
        </div>
      )}
    </div>
  );
};

export default FindPW;
