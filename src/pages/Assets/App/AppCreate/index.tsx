import React, { useMemo, useState } from 'react';
import AppTypography from '@components/AppTypography';
import { AppInput, AppInputCount, AppInputTextArea } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppPageFooter from '@components/AppPageFooter';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import AppModal from '@/components/AppModal';
import { createApp, getAppOwnership } from '@apis/apps.api';
import IconClose from '@assets/images/addIcons/multiplication-gray.svg';
import { FinalActionDivider } from '@components/AppDivider';
import MMP_JSON from '@utils/json/mmp.json';
import RTB_JSON from '@utils/json/rtb.json';
import RATING_JSON from '@utils/json/rating.json';
import {
  REGEXP_ADVERTISER_DOMAIN,
  REGEXP_ADVERTISER_DOMAIN_WWW,
  REGEXP_EMOJI,
  REGEXP_SPECIAL_CHAR,
} from '@utils/regexp';
import AppPageHeader from '@components/AppPageHeader';
import { Message, toaster } from 'rsuite';
import InfoTooltip from '@components/InfoTooltip';

interface CreateAppProps {}

const AppCreate: React.FC<CreateAppProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const navigate = useNavigate();
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

  // 앱 소유 인증 모달 띄우기
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAppOwnershipCheck, setIsAppOwnershipCheck] = useState(false);
  const [appID, setAppID] = useState('');

  // 앱 생성
  const onClickAPPCSubmit = (data: any) => {
    createApp({ ad_account_id: selectedAdAccount }, data)
      .then(() => {
        navigate('/assets/app');
      })
      .catch((err: any) => {
        alert(err.response.data.message);
      });
  };

  // 앱 추가후 나온 결과값 리셋버튼 눌렀을 경우
  const onClickResetApp = () => {
    APPV_reset({
      aid: '',
      license_key: '',
    });
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

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'앱 생성'} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>광고계정명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>OS</AppTypography.Label>
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
            <AppButton theme={'red'} size={'md'} onClick={() => setIsModalOpen(true)} disabled={isAppOwnershipCheck}>
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
            <AppTypography.Label isRequired className={'text'}>
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
                required: '앱 이름을 입력하세요.',
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
                  noSpecialChar: (value) => REGEXP_ADVERTISER_DOMAIN.test(value) || '잘못된 URL입니다.',
                  noHTTP: (value) =>
                    REGEXP_ADVERTISER_DOMAIN_WWW.test(value) || 'http://, https://, www. 를 제외하고 입력하세요.',
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
                  data={RTB_JSON}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  cleanable={false}
                />
              )}
              rules={{
                required: '카테고리를 선택하세요.',
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
                  data={RATING_JSON}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  cleanable={false}
                  searchable={false}
                />
              )}
              rules={{
                required: '콘텐츠 등급을 선택하세요',
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
              MMP
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
                <AppInputCount maxLength={128} value={field.value} onChange={(value) => field.onChange(value)} />
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
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/app')}>
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ color: 'white', width: 138, marginLeft: 15 }}
          onClick={APPC_handleSubmit(onClickAPPCSubmit)}
        >
          생성
        </AppButton>
      </AppPageFooter>

      {/* 앱 추가 모달 */}
      {/*display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 0*/}
      <AppModal open={isModalOpen} onClose={onClickAPPVCancel}>
        <AppModal.Header>
          <AppModal.Title>앱 소유 인증</AppModal.Title>
        </AppModal.Header>
        <AppModal.Body>
          <div style={{ marginBottom: '40px' }}>
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
          <div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  앱 ID
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'aid'}
                  control={APPV_control}
                  // TODO: 테스트용 코드, 삭제 필요
                  //defaultValue={'OA00742805'}
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
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  라이선스 키
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <Controller
                  name={'license_key'}
                  control={APPV_control}
                  // TODO: 테스트용 코드, 삭제 필요
                  // defaultValue={
                  //   'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFV8DD94b7m+o3TSGvytgUH4MOUTLqmHICVT6tVFh0ojHSZLl8Myc+KBohZkJ6zBdNMB7G93CcQh+nqsOiNNtgHjLDIapYJ5B4l0ubtFkyqGOb40wwXxTJ9heOCwKHeDTy4ehIcZWK1vrubQUx8ZRiJ+RlaEXlI/SzUM3X6xjn8QIDAQAB'
                  // }
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
          <AppButton size={'lg'} style={{ width: 138, marginLeft: 15 }} onClick={onClickAPPVCancel}>
            취소
          </AppButton>
          <AppButton
            size={'lg'}
            style={{ width: 138, marginLeft: 15 }}
            theme={'red'}
            onClick={APPV_handleSubmit(onClickAPPVSubmit)}
          >
            인증
          </AppButton>
        </AppModal.Footer>
      </AppModal>
    </div>
  );
};

export default AppCreate;
