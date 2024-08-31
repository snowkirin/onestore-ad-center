import React from 'react';
import AppTypography from '@components/AppTypography';
import { AppInput } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import { confirmPassword } from '@apis/auth.api';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import AppErrorMessage from '@components/AppErrorMessage';
import { ErrorMessage } from '@hookform/error-message';
import queryString from 'query-string';

interface FindPWProps {}

const StyledLoginWrapper = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding-top: 155px;

  .inner {
    width: 500px;
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

const ConfirmPassword: React.FC<FindPWProps> = () => {
  const navigate = useNavigate();
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
    handleSubmit,
  } = useForm();
  const signin_id = sessionStorage.getItem('signin_id');

  const confirmPasswordMutation = useMutation(confirmPassword, {
    onSuccess: async (res: any) => {
      /* 프로세스
       * 로그인 시도를 한다 ->
       * 내 정보가져오는 API를 호출하고 해당 값을 세션에 저장한다 ->
       * 광고계정 리스트를 가져온다 ->
       * 광고계정 리스트를 스토어에 저장한다.
       * */
      const { data } = res;

      if (data.status) {
        const destination = queryString.parse(location.search).referrer || '/campaigns/campaign';
        // @ts-ignore
        navigate(destination);
      } else {
        setError('pw', {
          type: 'custom',
          message: '비밀번호가 일치하지 않습니다. 다시 확인해주세요.',
        });
      }
    },
    onError: (error: any) => {
      setError('pw', {
        type: 'custom',
        message: '비밀번호가 일치하지 않습니다. 다시 확인해주세요.',
      });
    },
  });
  const onSubmit = (data: any) => {
    confirmPasswordMutation.mutate(data);
  };
  return (
    <StyledLoginWrapper>
      <div className={'inner'}>
        {/* 로고 */}
        <div className={'logo'}>
          <AppTypography.Headline style={{ marginBottom: 15 }}>비밀번호 재확인</AppTypography.Headline>
          <AppTypography.Text style={{ marginBottom: 30, fontWeight: 700 }}>
            {signin_id}님과 다른 사용자의 정보를 안전하게 보호하기 위해 <br />
            비밀번호를 다시 한번 입력해 주세요.
          </AppTypography.Text>
        </div>

        {/* 인풋 박스 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name={'pw'}
              defaultValue={''}
              control={control}
              render={({ field }) => (
                <AppInput
                  type={'password'}
                  value={field.value}
                  style={{ width: '305px', height: '32px' }}
                  onChange={(value) => {
                    clearErrors('password');
                    field.onChange(value);
                  }}
                />
              )}
              rules={{
                required: '비밀번호를 입력해 주세요.',
              }}
            />

            <ErrorMessage
              errors={errors}
              name={'pw'}
              render={({ message }) => <AppErrorMessage style={{ textAlign: 'left' }}>{message}</AppErrorMessage>}
            />

            <AppButton
              type={'submit'}
              theme={'red'}
              style={{
                width: '305px',
                height: '32px',
                marginTop: '20px',
              }}
              onClick={handleSubmit}
            >
              확인
            </AppButton>
          </form>
        </div>
      </div>
    </StyledLoginWrapper>
  );
};

export default ConfirmPassword;
