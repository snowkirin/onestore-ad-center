import React, { useEffect, useState } from 'react';
import AppTypography from '@components/AppTypography';
import { Steps } from 'rsuite';
import SignUpStep0 from '@pages/SignUp/Step0';
import styled from 'styled-components';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import AppDivider from '@components/AppDivider';
import SignUpStep1 from '@pages/SignUp/Step1';
import SignUpStep2 from '@pages/SignUp/Step2';

interface SignUpProps {}

const StyledSignup = styled.div`
  padding-top: 50px;
  .header {
    width: 489px;
    margin: 0 auto;
  }
  .logo {
    text-align: center;
    margin-bottom: 48px;
  }
  .title {
  }
  .step {
    margin-top: 30px;
    .rs-steps-item-icon.rs-steps-item-icon-process,
    .rs-steps-item-icon-wrapper {
      font-weight: bold;
    }
  }
`;

const initFormValue = {
  signin_id: '',
  pw: '',
  name: '',
  email: '',
  tel: '',
  type: '',
  advertiser_name: '',
  address: '',
  birthday: '', // 개인
  owner_name: '', // 비지니스
  business_license_number: '', // 비지니스
  receive_marketing: false, // 마게팅 수신동의, 기본값 false 로 지정
};

const SignUp: React.FC<SignUpProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValue, setFormValue] = useState<any>(initFormValue);

  const handleTypeChange = (type: string) => {
    setFormValue((prevState: any) => ({
      ...prevState,
      type,
    }));
  };
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };
  const handleReceiveMarketingChange = (checked: boolean) => {
    setFormValue((prevState: any) => ({
      ...prevState,
      receive_marketing: checked,
    }));
  };
  const handleEmailChange = (email: string) => {
    setFormValue((prevState: any) => ({
      ...prevState,
      email,
    }));
  };
  const handleBusinessLicenseNumberChange = (businessLicenseNumber: string) => {
    setFormValue((prevState: any) => ({
      ...prevState,
      business_license_number: businessLicenseNumber,
    }));
  };
  const handleInitFormValue = () => {
    setFormValue({ ...initFormValue });
  };

  useEffect(() => {
    return () => {
      handleInitFormValue();
      setCurrentStep(0);
    };
  }, []);

  return (
    <>
      {(currentStep === 0 || currentStep === 1) && (
        <StyledSignup>
          <div className={'header'}>
            <div className={'logo'}>
              <AppTypography.Headline>
                <img src={OneStoreLogo} style={{ width: 130, marginRight: 5 }} alt={'ONE store'} />
                <span>광고센터</span>
              </AppTypography.Headline>
            </div>
            <div className={'title'}>
              <AppTypography.Headline>회원가입</AppTypography.Headline>
              <AppDivider style={{ margin: 0, marginTop: 10 }} />
            </div>
            <div className={'step'}>
              <Steps current={currentStep} classPrefix={'app-step'}>
                <Steps.Item title={'가입 여부 확인'} />
                <Steps.Item title={'정보 입력'} />
                <Steps.Item title={'가입 완료'} />
              </Steps>
            </div>
          </div>
          <div className={'body'}>
            {currentStep === 0 && (
              <SignUpStep0
                formData={formValue}
                onTypeChange={handleTypeChange}
                onEmailChange={handleEmailChange}
                onBusinessLicenseNumberChange={handleBusinessLicenseNumberChange}
                onStepChange={handleStepChange}
                onReceiveMarketingChange={handleReceiveMarketingChange}
              />
            )}
            {currentStep === 1 && <SignUpStep1 formData={formValue} onStepChange={handleStepChange} />}
          </div>
        </StyledSignup>
      )}
      {currentStep === 2 && <SignUpStep2 />}
    </>
  );
};

export default SignUp;
