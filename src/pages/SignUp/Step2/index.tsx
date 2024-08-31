import React from 'react';
import styled from 'styled-components';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import { useNavigate } from 'react-router-dom';

interface SignUpStep2Props {}

const StyledWrapper = styled.div`
  padding-top: 231px;
  text-align: center;
  .logo {
    margin-bottom: 80px;
  }
  .title {
    margin-bottom: 12px;
  }
  .desc {
    margin-bottom: 30px;
  }
`;

const SignUpStep2: React.FC<SignUpStep2Props> = () => {
  const navigate = useNavigate();
  return (
    <StyledWrapper>
      <div className={'logo'}>
        <AppTypography.Headline>
          <img src={OneStoreLogo} style={{ width: 130, marginRight: 5 }} alt={'ONE store'} />
          <span>광고센터</span>
        </AppTypography.Headline>
      </div>
      <div className="title">
        <AppTypography.Headline>회원가입 신청이 완료 되었습니다.</AppTypography.Headline>
      </div>
      <div className={'desc'}>
        <AppTypography.Text>관리자의 가입 승인 후에 이용 가능합니다.</AppTypography.Text>
        <AppTypography.Text>가입 승인은 회원가입 신청일로부터 2~3 영업일 소요되며,</AppTypography.Text>
        <AppTypography.Text>승인 결과는 이메일로 받아보실 수 있습니다.</AppTypography.Text>
      </div>
      <div className={'button'}>
        <AppButton theme={'red'} style={{ width: 300 }} size={'md'} onClick={() => navigate('/')}>
          메인으로
        </AppButton>
      </div>
    </StyledWrapper>
  );
};

export default SignUpStep2;
