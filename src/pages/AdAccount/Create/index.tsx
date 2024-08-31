import React, { useState } from 'react';
import AppTypography from '@components/AppTypography';
import { AppInput, AppInputCount, AppInputTextArea } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import { isNil as _isNil, omitBy as _omitBy } from 'lodash';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { Message, Steps, useToaster } from 'rsuite';
import AppPageFooter from '@components/AppPageFooter';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppModal from '@/components/AppModal';
import { createApp, getAppOwnership } from '@apis/apps.api';
import IconClose from '@assets/images/addIcons/multiplication-gray.svg';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import { createAdAccount } from '@apis/ad_account.api';
import MMP_JSON from '@utils/json/mmp.json';
import RTB_JSON from '@utils/json/rtb.json';
import RATING_JSON from '@utils/json/rating.json';
import {
  REGEXP_ADVERTISER_DOMAIN,
  REGEXP_ADVERTISER_DOMAIN_WWW,
  REGEXP_EMOJI,
  REGEXP_SPECIAL_CHAR,
  REGEXP_TITLE,
} from '@utils/regexp';
import InfoTooltip from '@components/InfoTooltip';

interface AdAccountCreateProps {}

const AdAccountCreate: React.FC<AdAccountCreateProps> = () => {
  const navigate = useNavigate();
  const toaster = useToaster();

  // 광고계정
  const {
    handleSubmit: ADC_handleSubmit,
    control: ADC_control,
    getValues: ADC_getValues,
    formState: { errors: ADC_errors },
  } = useForm();
  // 앱 생성
  const {
    handleSubmit: APPC_handleSubmit,
    control: APPC_control,
    reset: APPC_reset,
    formState: { errors: APPC_errors },
  } = useForm();
  // 앱 소유 인증
  const {
    handleSubmit: APPV_handleSubmit,
    control: APPV_control,
    reset: APPV_reset,
    formState: { errors: APPV_errors },
  } = useForm();

  const [currentStep, setCurrentStep] = useState(0);
  // 앱 소유 인증 모달 띄우기
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAppOwnershipCheck, setIsAppOwnershipCheck] = useState(false);
  const [appID, setAppID] = useState('');

  // 광고계정 생성
  const onClickADSubmit = () => {
    // 이때는 광고계정을 생성하는것이 아니라 validation 체크만 한다.
    setCurrentStep(1);
  };

  // 앱 생성
  const onClickAPPCSubmit = (data: any) => {
    /* 광고계정 생성 - 결과값 받음 - 해당 값중 ID를 포함해서 앱 생성*/

    const advertiserId = sessionStorage.getItem('advertiser_id')
      ? parseInt(sessionStorage.getItem('advertiser_id') as string)
      : 0;
    const accountIds = [sessionStorage.getItem('id') ? parseInt(sessionStorage.getItem('id') as string) : 0];
    // 광고계정 생성
    const APPC_data = data;
    const adAccountBodyParams = {
      ..._omitBy(ADC_getValues(), _isNil),
      advertiser_id: advertiserId,
      account_ids: accountIds,
    };

    createAdAccount(adAccountBodyParams)
      .then(({ data }) => {
        const { result } = data;
        createApp({ ad_account_id: result }, APPC_data)
          .then(() => {
            alert('광고계정 및 앱 생성을 완료하였습니다.');
            navigate('/campaigns/campaign');
            location.reload();
          })
          .catch((err) => {
            alert(err.response.data.message);
          });
      })
      .catch((err) => {
        alert(err.response.data.message);
        setCurrentStep(0);
      });
  };

  // 앱 추가후 나온 결과값 리셋버튼 눌렀을 경우
  const onClickResetApp = () => {
    APPC_reset({
      title: '',
      developer_name: '',
      description: '',
      advertiser_domain: '',
      app: {
        bundle_id: '',
        app_store_url: '',
      },
    });
    APPV_reset();
    setAppID('');
    setIsAppOwnershipCheck(false);
  };

  // 앱 소유 인증 확인 눌렀을경우.
  const onClickAPPVSubmit = (data: any) => {
    getAppOwnership(data).then(({ data }) => {
      if (data.result_code === '00000') {
        // 타이틀에서 특수문자 제거 할것
        APPC_reset({
          title: data.data.title,
          description: data.data.summary,
          advertiser_domain: data.data.mob_web_url,
          developer_name: data.data.seller_name,
          app: {
            category: '',
            content_rating: '',
            bundle_id: data.data.aid,
            app_store_url: `https://m.onestore.co.kr/mobilepoc/apps/appsDetail.omp?prodId=${data.data.aid}`,
            postback_integration: {
              mmp: '',
              bundle_id: '',
            },
          },
        });
        setAppID(data.data.aid);
        setIsAppOwnershipCheck(true);
        setIsModalOpen(false);
      } else {
        // 토스트 띄우기
        toaster.push(<Message showIcon type={'error'} header="앱 ID 와 라이선스 키가 일치하지 않습니다." />);
        setIsAppOwnershipCheck(false);
      }
    });
  };
  // 앱 소유 인증 취소 눌렀을경우.
  const onClickAPPVCancel = () => {
    APPV_reset();
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ width: 500, margin: '0 auto' }}>
        <Steps current={currentStep} classPrefix={'app-step'}>
          <Steps.Item title={'광고계정 생성'} />
          <Steps.Item title={'앱 생성'} />
        </Steps>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          {currentStep === 0 && (
            <>
              <AppTypography.SubTitle level={2}>원스토어 광고센터에 오신 것을 환영합니다!</AppTypography.SubTitle>
              <AppTypography.SubTitle level={2}>
                광고센터를 이용하려면 먼저 광고계정을 생성해 주세요.
              </AppTypography.SubTitle>
            </>
          )}
          {currentStep === 1 && (
            <AppTypography.SubTitle level={2}>광고를 집행할 앱을 생성해 주세요.</AppTypography.SubTitle>
          )}
        </div>
      </div>
      <AppDivider />
      {/* Step 0 : 광고계정 생성 */}

      {currentStep === 0 && (
        <>
          <div className={'content__inner'} style={{ width: 900, margin: '0 auto' }}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'} isRequired>
                  광고계정명
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'title'}
                  control={ADC_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={50}
                        placeholder={'2~50자'}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    );
                  }}
                  rules={{
                    required: '광고계정명을 입력해 주세요.',
                    minLength: {
                      value: 2,
                      message: '광고계정명은 2~50자로 입력해 주세요.',
                    },
                    pattern: {
                      value: REGEXP_TITLE,
                      message: '광고계정명은 영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  name={'title'}
                  errors={ADC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
              <div className={'col col-extra'}>
                <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a', lineHeight: '32px' }}>
                  영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>설명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'description'}
                  control={ADC_control}
                  render={({ field }) => {
                    return (
                      <AppInputTextArea
                        maxLength={200}
                        as={'textarea'}
                        placeholder={'최대 200자'}
                        style={{
                          resize: 'none',
                        }}
                        height={100}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    );
                  }}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>시간대</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>(UTC +9:00) 서울</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>통화</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>KRW</AppTypography.Text>
              </div>
            </div>
          </div>
          <FinalActionDivider />
          <AppPageFooter>
            <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/ad-account')}>
              취소
            </AppButton>
            <AppButton
              size={'lg'}
              theme={'red'}
              style={{ width: 138, marginLeft: 15 }}
              onClick={ADC_handleSubmit(onClickADSubmit)}
            >
              다음
            </AppButton>
          </AppPageFooter>
        </>
      )}

      {/* Step 1 : 앱 생성*/}
      {currentStep === 1 && (
        <>
          <div className={'content__inner'} style={{ width: 900, margin: '0 auto' }}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'} isRequired>
                  OS
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>ANDROID</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>앱 추가</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppButton
                  disabled={isAppOwnershipCheck}
                  theme={'red'}
                  size={'md'}
                  onClick={() => setIsModalOpen(true)}
                >
                  앱 추가
                </AppButton>
                {isAppOwnershipCheck && (
                  <AppTypography.Text className={'text'} style={{ display: 'inline-block', marginLeft: 5 }}>
                    <span>{appID}</span>
                    <img
                      src={IconClose}
                      alt={'Reset'}
                      style={{ marginLeft: 5, cursor: 'pointer' }}
                      onClick={onClickResetApp}
                    />
                  </AppTypography.Text>
                )}
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'} isRequired>
                  앱 이름
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'title'}
                  control={APPC_control}
                  render={({ field }) => {
                    return (
                      <AppInputCount
                        maxLength={50}
                        disabled={!isAppOwnershipCheck}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    );
                  }}
                  rules={{
                    required: '앱 이름을 입력해 주세요.',
                    validate: {
                      noSpecialChar: (value) => !REGEXP_SPECIAL_CHAR.test(value) || '특수문자는 입력 불가합니다.',
                      noEmoji: (value) => !REGEXP_EMOJI.test(value) || '특수문자는 입력 불가합니다.',
                    },
                  }}
                />
                <ErrorMessage
                  name={'title'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>앱 설명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'description'}
                  control={APPC_control}
                  render={({ field }) => {
                    return (
                      <AppInputTextArea
                        maxLength={200}
                        height={100}
                        disabled={!isAppOwnershipCheck}
                        as={'textarea'}
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                      />
                    );
                  }}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  <span style={{ marginRight: 5 }}>도메인</span>
                  <InfoTooltip inner={'http://, https://, www. 를 제외하고 입력하세요.'} />
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'advertiser_domain'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppInputCount
                      maxLength={2083}
                      disabled={!isAppOwnershipCheck}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: '도메인을 입력해 주세요.',
                    validate: {
                      noSpecialChar: (value) =>
                        REGEXP_ADVERTISER_DOMAIN.test(value) || 'URL 형식에 맞게 입력해 주세요.',
                      noHTTP: (value) =>
                        REGEXP_ADVERTISER_DOMAIN_WWW.test(value) ||
                        'http://, https://, www. 를 제외하고 입력해 주세요.',
                    },
                  }}
                />
                <ErrorMessage
                  name={'advertiser_domain'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 마켓 URL
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.app_store_url'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppInput disabled value={field.value} onChange={(value) => field.onChange(value)} />
                  )}
                  rules={{
                    required: '앱 마켓 URL을 입력해 주세요..',
                  }}
                />
                <ErrorMessage
                  name={'app.app_store_url'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 마켓 번들 ID
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.bundle_id'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppInput disabled value={field.value} onChange={(value) => field.onChange(value)} />
                  )}
                  rules={{
                    required: '앱 마켓 번들 ID를 입력해 주세요.',
                  }}
                />

                <ErrorMessage
                  name={'app.bundle_id'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  개발자명
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'developer_name'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppInput disabled value={field.value} onChange={(value) => field.onChange(value)} />
                  )}
                  rules={{
                    required: '개발자명을 입력해 주세요.',
                  }}
                />
                <ErrorMessage
                  name={'developer_name'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  카테고리
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.category'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppSelectPicker
                      block
                      placeholder={'앱 카테고리 선택'}
                      data={RTB_JSON}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      cleanable={false}
                    />
                  )}
                  rules={{
                    required: '카테고리를 선택해 주세요.',
                  }}
                />
                <ErrorMessage
                  name={'app.category'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  콘텐츠 등급
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.content_rating'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppSelectPicker
                      block
                      placeholder={'콘텐츠 등급 선택'}
                      data={RATING_JSON}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      cleanable={false}
                      searchable={false}
                    />
                  )}
                  rules={{
                    required: '콘텐츠 등급을 선택해 주세요.',
                  }}
                />
                <ErrorMessage
                  name={'app.content_rating'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  <span>MMP</span>
                  <InfoTooltip
                    inner={
                      <>
                        MMP 포스트백을 통해 앱 설치 이벤트가 몰로코로 전송되어야 캠페인 진행이 가능합니다.
                        <br />
                        MMP 사이트 내에서 포스트백을 몰로코로 설정해주세요.
                      </>
                    }
                  />
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.postback_integration.mmp'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppSelectPicker
                      block
                      placeholder={'MMP 선택'}
                      data={MMP_JSON}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      cleanable={false}
                      searchable={false}
                    />
                  )}
                  rules={{
                    required: 'MMP를 선택해 주세요.',
                  }}
                />
                <ErrorMessage
                  name={'app.postback_integration.mmp'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  MMP 번들 ID
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'app.postback_integration.bundle_id'}
                  control={APPC_control}
                  render={({ field }) => (
                    <AppInputCount
                      style={{ width: '100%' }}
                      maxLength={128}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                  rules={{
                    required: 'MMP 번들 ID를 입력해 주세요.',
                  }}
                />
                <ErrorMessage
                  name={'app.postback_integration.bundle_id'}
                  errors={APPC_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
          </div>

          <FinalActionDivider />
          <AppPageFooter>
            <AppButton size={'lg'} style={{ width: 138 }} onClick={() => setCurrentStep(0)}>
              취소
            </AppButton>
            <AppButton
              size={'lg'}
              theme={'red'}
              style={{ width: 138, marginLeft: 10 }}
              onClick={APPC_handleSubmit(onClickAPPCSubmit)}
            >
              완료
            </AppButton>
          </AppPageFooter>
        </>
      )}

      {/* 앱 추가 모달 */}
      <AppModal open={isModalOpen} onClose={onClickAPPVCancel}>
        <AppModal.Header>
          <AppModal.Title>앱 소유 인증</AppModal.Title>
        </AppModal.Header>
        <AppModal.Body>
          <div>
            <AppTypography.Text>앱을 추가하려면 앱 소유 인증이 필요합니다.</AppTypography.Text>
            <AppTypography.Text>앱에 해당하는 앱 ID와 라이선스 키를 입력하세요.</AppTypography.Text>
            <AppTypography.Text>
              앱 ID 확인 경로:{' '}
              <a href={'https://dev.onestore.co.kr/devpoc/index.omp'} target={'_blank'}>
                원스토어 개발자센터
              </a>{' '}
              &gt; APPS &gt; 상품현황 상단 앱 정보 내 확인 가능
            </AppTypography.Text>
            <AppTypography.Text>
              라이선스 키 확인 경로:{' '}
              <a href={'https://dev.onestore.co.kr/devpoc/index.omp'} target={'_blank'}>
                원스토어 개발자센터
              </a>{' '}
              &gt; APPS &gt; 상품현황 &gt; 상품선택 &gt; 라이선스 관리 &gt; 라이선스 키 복사
            </AppTypography.Text>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '120px' }}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 ID
                </AppTypography.Label>
              </div>
              <div style={{ flex: '1 0 auto' }}>
                <Controller
                  name={'aid'}
                  control={APPV_control}
                  // TODO: 테스트용 코드, 삭제 필요
                  render={({ field }) => {
                    return (
                      <AppInput
                        placeholder={'e.g: OA00701732'}
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                      />
                    );
                  }}
                  rules={{
                    required: '필수값입니다.',
                  }}
                />
                <ErrorMessage
                  name={'aid'}
                  errors={APPV_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <div style={{ width: '120px' }}>
                <AppTypography.Label isRequired className={'text'}>
                  라이선스 키
                </AppTypography.Label>
              </div>
              <div style={{ flex: '1 0 auto' }}>
                <Controller
                  name={'license_key'}
                  control={APPV_control}
                  render={({ field }) => {
                    return (
                      <AppInputTextArea
                        as={'textarea'}
                        maxLength={300}
                        style={{ resize: 'none' }}
                        rows={4}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    );
                  }}
                  rules={{
                    required: '필수값입니다.',
                  }}
                />
                <ErrorMessage
                  name={'license_key'}
                  errors={APPV_errors}
                  render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                />
              </div>
            </div>
          </div>
        </AppModal.Body>
        <AppModal.Footer>
          <AppButton size={'md'} style={{ width: 100 }} onClick={onClickAPPVCancel}>
            취소
          </AppButton>
          <AppButton size={'md'} style={{ width: 100 }} theme={'red'} onClick={APPV_handleSubmit(onClickAPPVSubmit)}>
            인증
          </AppButton>
        </AppModal.Footer>
      </AppModal>
    </div>
  );
};

export default AdAccountCreate;
