import React, { useState } from 'react';
import AppTypography from '@components/AppTypography';
import { Radio } from 'rsuite';
import { AppInput } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import { Controller, useForm } from 'react-hook-form';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import styled from 'styled-components';
import CountDown from '@components/Common/CountDown';
import { findIdByEmail, fullSigninId, verifyFindIdCode } from '@apis/auth.api';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { REGEXP_EMAIL } from '@utils/regexp';

interface FindIDProps {}

const StyledFindIDWrapper = styled.div`
  text-align: center;
  padding-top: 155px;

  .current-step0__wrapper {
    position: relative;
    width: 355px;
    margin: 0 auto;
    text-align: left;
    .form-wrapper {
      display: flex;
      align-items: center;
    }
  }
  .current-step1__wrapper {
    width: 320px;
    margin: 0 auto;
    text-align: left;
    .id-list__table {
      border-top: 1px solid #e2e2e2;
      border-bottom: 1px solid #e2e2e2;
      width: 320px;
      th,
      td {
        height: 40px;
        font-size: 11px;
        text-align: center;
      }
      thead {
        th {
          border-bottom: 1px solid #222;
          text-align: center;
        }
      }
      tbody {
        tr {
          &:not(:last-child) {
            td {
              border-bottom: 1px solid #e2e2e2;
            }
          }
        }
        td {
          &:first-child {
            text-align: left;
          }
        }
      }
    }
    .button-wrapper {
      margin-top: 30px;
    }
    .extra-wrapper {
      margin-top: 15px;
    }
  }
`;

const FindID: React.FC<FindIDProps> = () => {
  const {
    handleSubmit: VE_handleSubmit,
    getValues: VE_getValues,
    control: VE_control,
    formState: { errors: VE_errors },
  } = useForm();
  const {
    handleSubmit: VN_handleSubmit,
    getValues: VN_getValues,
    control: VN_control,
    formState: { errors: VN_errors },
  } = useForm();

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [idList, setIdList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | undefined>('');

  const [isShowCountDown, setIsShowCountDown] = useState(false);
  const [isSendEmail, setIsSendEmail] = useState(false);
  // 메일 보냈을시 10분이내로 인증코드 입력하라고 표시하는 Flag
  const [isLimitText, setIsLimitText] = useState(false);
  // 존재하지 않은 이메일
  const [notExistEmail, setNotExistEmail] = useState(false);
  // 인증번호 틀림
  const [isNotMatchCode, setIsNotMatchCode] = useState(false);

  const onClickSendVerificationEmail = async (data: any) => {
    setIsShowCountDown(false);
    const result = await findIdByEmail(data);
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

  const onClickVerifyNumber = async (data: any) => {
    const payload = {
      ...VE_getValues(),
      ...data,
    };
    const result = await verifyFindIdCode(payload);
    if (result.data.status) {
      alert('인증이 완료되었습니다.');
      setCurrentStep(1);
      setIdList(result.data.data);
    } else {
      alert(result.data.message);
      //setIsNotMatchCode(true);
    }
  };

  const onClickFullSigninId = async () => {
    const payload = {
      ...VE_getValues(),
      ...VN_getValues(),
      account_id: selectedId,
    };
    const result = await fullSigninId(payload);

    if (result.data.status) {
      alert(result.data.message);
    } else {
      alert(result.data.message);
    }
  };

  return (
    <StyledFindIDWrapper>
      <AppTypography.Headline style={{ marginBottom: 60 }}>
        <img src={OneStoreLogo} style={{ width: 130, marginRight: 5 }} alt={'ONE store'} />
        <span>광고센터</span>
      </AppTypography.Headline>
      <AppTypography.Headline style={{ marginBottom: 15 }}>아이디 찾기</AppTypography.Headline>
      {/* Step 0 */}
      <div style={{ marginBottom: 30 }}>
        {currentStep === 0 && (
          <>
            <AppTypography.Text>회원 정보에 등록된 이메일 주소를 입력해 주세요.</AppTypography.Text>
            <AppTypography.Text>입력하신 이메일 주소로 인증번호를 보내드립니다.</AppTypography.Text>
          </>
        )}
        {currentStep === 1 && (
          <>
            <AppTypography.Text>
              개인정보 도용에 대한 피해방지를 위하여 아이디의 마지막 네자리는 *로 표시하였습니다.
            </AppTypography.Text>
            <AppTypography.Text>
              전체 아이디 확인을 원하시면 이메일 발송 버튼을 클릭하여 확인해 주세요.
            </AppTypography.Text>
          </>
        )}
      </div>
      {currentStep === 0 && (
        <div className={'current-step0__wrapper'}>
          <form onSubmit={VE_handleSubmit(onClickSendVerificationEmail)} style={{ marginBottom: 10 }}>
            <div className={'form-wrapper'}>
              <Controller
                name={'email'}
                control={VE_control}
                render={({ field }) => {
                  return (
                    <AppInput
                      placeholder={'example@onestore.com'}
                      style={{ width: 250, height: 32 }}
                      value={field.value}
                      onChange={(value) => {
                        setNotExistEmail(false);
                        setIsLimitText(false);
                        field.onChange(value);
                      }}
                    />
                  );
                }}
                rules={{
                  required: '이메일 주소를 입력해 주세요.',
                  pattern: {
                    // 이메일 정규식
                    value: REGEXP_EMAIL,
                    message: '이메일 형식에 맞게 입력해 주세요.',
                  },
                }}
              />

              <AppButton
                theme={'gray'}
                type={'button'}
                style={{ width: '100px', padding: 0, textAlign: 'center', marginLeft: 5 }}
                size={'md'}
                onClick={VE_handleSubmit(onClickSendVerificationEmail)}
              >
                {isSendEmail ? '인증 메일 재발송' : '인증 메일 발송'}
              </AppButton>
              {isShowCountDown && <CountDown style={{ position: 'absolute', left: 'calc(100% + 15px)' }} />}
            </div>
            {isLimitText && (
              <AppTypography.Text>인증 메일이 발송되었습니다. 10분 이내에 인증번호를 입력해 주세요.</AppTypography.Text>
            )}
            <ErrorMessage
              errors={VE_errors}
              name={'email'}
              render={({ message }) => <AppErrorMessage>{message} </AppErrorMessage>}
            />
            {notExistEmail && (
              <AppErrorMessage>입력하신 이메일로 회원 정보를 찾을 수 없습니다. 다시 확인해주세요.</AppErrorMessage>
            )}
          </form>
          <form style={{ marginBottom: 15 }} onSubmit={VN_handleSubmit(onClickVerifyNumber)}>
            <div className={'form-wrapper'}>
              <Controller
                name={'code'}
                control={VN_control}
                render={({ field }) => {
                  return (
                    <AppInput
                      style={{ width: 250, height: 32 }}
                      placeholder={'인증번호 입력'}
                      disabled={!isSendEmail}
                      value={field.value}
                      onChange={(value) => {
                        setIsNotMatchCode(false);
                        field.onChange(value);
                      }}
                    />
                  );
                }}
                rules={{
                  required: '인증번호를 입력해 주세요.',
                }}
              />
              <AppButton
                theme={'red'}
                size={'md'}
                style={{ marginLeft: 5, width: 100 }}
                onClick={VN_handleSubmit(onClickVerifyNumber)}
              >
                확인
              </AppButton>
            </div>
            <ErrorMessage
              errors={VN_errors}
              name={'code'}
              render={({ message }) => <AppErrorMessage>{message} </AppErrorMessage>}
            />
            {isNotMatchCode && <AppErrorMessage>인증번호를 정확히 입력해 주세요.</AppErrorMessage>}
          </form>
        </div>
      )}
      {currentStep === 1 && (
        <div className={'current-step1__wrapper'}>
          <table className={'id-list__table'}>
            <thead>
              <tr>
                <th>아이디</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {idList.map((item, idx) => {
                return (
                  <tr key={idx}>
                    <td>
                      <Radio
                        value={item.id}
                        name={'id_list'}
                        checked={selectedId === item.id}
                        onChange={(value) => setSelectedId(value)}
                      >
                        {item.signin_id}
                      </Radio>
                    </td>
                    <td>{item.created_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={'button-wrapper'}>
            <AppButton
              theme={'gray'}
              type={'button'}
              size={'md'}
              style={{ width: 150 }}
              onClick={onClickFullSigninId}
              disabled={selectedId === ''}
            >
              이메일 발송
            </AppButton>
            <AppButton
              theme={'red'}
              size={'md'}
              style={{ marginLeft: 5, width: 150 }}
              onClick={() => {
                navigate('/');
              }}
            >
              로그인
            </AppButton>
          </div>
          <div className={'extra-wrapper'}>
            <AppTypography.Text accepter={'span'}>비밀번호를 잊으셨나요?</AppTypography.Text>
            <AppTypography.Link
              style={{ fontSize: 12, marginLeft: 5 }}
              onClick={() => {
                navigate('/find/pw');
              }}
            >
              비밀번호 찾기
            </AppTypography.Link>
          </div>
        </div>
      )}
    </StyledFindIDWrapper>
  );
};

export default FindID;
