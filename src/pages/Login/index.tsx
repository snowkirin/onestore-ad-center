import React, { useRef, useState } from 'react';
import { Form, Schema } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { getMyInfo, signIn } from '@apis/auth.api';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import AppTypography from '@components/AppTypography';
import styled from 'styled-components';
import { AppInput } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import AppErrorMessage from '@components/AppErrorMessage';

interface LoginProps {}

const initFormValue = {
  signin_id: '',
  pw: '',
};

const model = Schema.Model({
  signin_id: Schema.Types.StringType().isRequired('아이디를 입력해 주세요.'),
  pw: Schema.Types.StringType().isRequired('비밀번호를 입력해 주세요.'),
});
const StyledLoginWrapper = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding-top: 263px;

  .inner {
    width: 300px;
    margin: 0 auto;
    text-align: center;
  }

  .logo {
    margin-bottom: 30px;
  }

  .form-wrapper {
  }

  .extra-actions {
    display: flex;
    justify-content: space-between;

    .find-action {
    }
  }

  .extra-text {
    margin-top: 50px;
    text-align: center;
  }
`;

const Login: React.FC<LoginProps> = () => {
  const navigate = useNavigate();

  const formRef = useRef<any>(null);

  /* State */
  const [formValue, setFormValue] = useState<any>(initFormValue);
  const [formError, setFormError] = useState<any>({});
  const [isNotMatch, setIsNotMatch] = useState<boolean>(false);
  const signInMutation = useMutation(signIn, {
    onSuccess: async (res: any) => {
      /* 프로세스
       * 로그인 시도를 한다 ->
       * 내 정보가져오는 API를 호출하고 해당 값을 세션에 저장한다 ->
       * 광고계정 리스트를 가져온다 ->
       * 광고계정 리스트를 스토어에 저장한다.
       * */
      const { data: loginData } = res;

      if (loginData.status) {
        // 로그인 유저 정보 가져오기
        const { data: myInfoData } = await getMyInfo();
        // adAccount 유/무 결과.

        // 유저 정보를 세션에 저장.
        Object.keys(myInfoData).forEach((key) => {
          sessionStorage.setItem(key, myInfoData[key]);
        });

        if (myInfoData['role'].indexOf('ADMIN') > -1) {
          navigate('/admin/dashboard');
        } else {
          navigate('/campaigns/campaign');
        }
      } else {
        if (loginData.message.indexOf('아이디 혹은 비밀번호가 일치하지 않습니다.') !== -1) {
          setIsNotMatch(true);
        } else {
          alert(loginData.message);
        }
      }
    },
    onError: (error: any) => {
      alert(error.response.data.message);
    },
  });
  const handleSubmit = () => {
    if (!formRef.current.check()) {
      return;
    }
    signInMutation.mutate(formValue);
  };
  const handleSignupLinkClick = () => {
    navigate(`/signup`);
  };
  const handleFindLinkClick = (type: 'id' | 'pw') => {
    navigate(`/find/${type}`);
  };
  return (
    <StyledLoginWrapper>
      <div className={'inner'}>
        {/* 로고 */}
        <div className={'logo'}>
          <AppTypography.Headline>
            <img src={OneStoreLogo} style={{ width: 130, marginRight: 5 }} alt={'ONE store'} />
            {/* 테스트는 변경될수 있음.*/}
            <span>{import.meta.env.VITE_MODE === 'CLIENT' ? '광고센터' : '관리자 어드민'}</span>
          </AppTypography.Headline>
        </div>

        {/* 인풋 박스 */}
        <Form
          formValue={formValue}
          onChange={(formValue: any) => {
            setIsNotMatch(false);
            setFormValue(formValue);
          }}
          model={model}
          ref={formRef}
          onCheck={setFormError}
          style={{ marginBottom: 10 }}
          className={'form-wrapper'}
        >
          <Form.Group
            controlId={'signin_id'}
            style={{ marginBottom: 10 }}
            className={formError.signin_id ? 'has-error' : ''}
          >
            <Form.Control
              name={'signin_id'}
              style={{ height: 32 }}
              size={'md'}
              accepter={AppInput}
              placeholder={'아이디'}
            />
          </Form.Group>
          <Form.Group controlId={'pw'} style={{ marginBottom: 10 }} className={formError.pw ? 'has-error' : ''}>
            <Form.Control
              name={'pw'}
              style={{ height: 32 }}
              accepter={AppInput}
              placeholder={'비밀번호'}
              type={'password'}
            />
          </Form.Group>
          {isNotMatch && (
            <AppErrorMessage style={{ textAlign: 'left', letterSpacing: '-0.3px', marginTop: -4, marginLeft: 4 }}>
              아이디 혹은 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.
            </AppErrorMessage>
          )}

          <Form.Group>
            <AppButton
              type={'submit'}
              size={'md'}
              theme={'red'}
              style={{
                width: '100%',
              }}
              onClick={handleSubmit}
            >
              로그인
            </AppButton>
          </Form.Group>
        </Form>

        {/* 아이디/ 비번 / 회원가입 */}
        {import.meta.env.VITE_MODE === 'CLIENT' && (
          <div className={'extra-actions'}>
            <div className={'find-action'}>
              <AppTypography.Text
                accepter={'span'}
                onClick={() => handleFindLinkClick('id')}
                style={{ cursor: 'pointer' }}
              >
                아이디찾기
              </AppTypography.Text>
              <AppTypography.Text
                accepter={'span'}
                onClick={() => handleFindLinkClick('pw')}
                style={{ cursor: 'pointer', marginLeft: 26 }}
              >
                비밀번호찾기
              </AppTypography.Text>
            </div>
            <div className={'join-action'}>
              <AppTypography.Text
                accepter={'span'}
                onClick={() => window.open('/terms/service', '_blank')}
                style={{ cursor: 'pointer', marginRight: 26 }}
              >
                약관 안내
              </AppTypography.Text>
              <AppTypography.Text accepter={'span'} style={{ cursor: 'pointer' }} onClick={handleSignupLinkClick}>
                회원가입
              </AppTypography.Text>
            </div>
          </div>
        )}
      </div>
      <div className="extra-text">
        <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a' }}>
          {import.meta.env.VITE_MODE === 'CLIENT' ? '원스토어 광고센터' : '본 사이트'}는 데스크탑 Chrome, Safari,
          Microsoft Edge 브라우저에 최적화 되어 있습니다.
          <br />
          안정적인 서비스 이용을 위해 Chrome 브라우저 사용을 권장합니다.
        </AppTypography.Text>
      </div>
    </StyledLoginWrapper>
  );
};

export default Login;
