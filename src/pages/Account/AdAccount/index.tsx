import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdAccountDetail, updateAdAccount } from '@apis/ad_account.api';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { AppInputCount } from '@components/AppInput';
import AppInputTextArea from '../../../components/AppInput/AppInputTextArea';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { getRoleType } from '@utils/functions';
import AppPageFooter from '@components/AppPageFooter';
import AlertModal from '@components/AppModal/AlretModal';

interface AccountAdAccountProps {}

const AccountAdAccount: React.FC<AccountAdAccountProps> = () => {
  const navigate = useNavigate();
  const { adAccountId: adAccountId } = useParams();
  const role = sessionStorage.getItem('role');
  const roleType = getRoleType(role);

  const [isOpenSubmitAlertModal, setIsOpenSubmitAlertModal] = React.useState(false);
  const [isOpenErrorAlertModal, setIsOpenErrorAlertModal] = React.useState(false);
  const [errorAlertModalMessage, setErrorAlertModalMessage] = React.useState('');

  const {
    handleSubmit: AU_handleSubmit,
    control: AU_control,
    formState: { errors: AU_errors },
  } = useForm();

  const fetchManagerDetail = useQuery(
    ['fetchManagerDetail', adAccountId],
    async () => {
      const { data } = await getAdAccountDetail(adAccountId);
      if (data) {
        return {
          ...data,
          advertiser_name: data.advertiser_name || '-',
          id: data.id || '',
          name: data.name || '',
          description: data.description || '',
          time_zone_detail: data.time_zone_detail || '',
          currency: data.currency || '',
          accounts: data.accounts || [],
          created_at: data.created_at || '-',
          updated_at: data.updated_at || '-',
        };
      } else {
        return [];
      }
    },
    {
      enabled: !!adAccountId,
      onError: (error: any) => {
        if (error.response.status === 406) {
          navigate(`/confirm-password?referrer=${encodeURIComponent(location.pathname + location.search)}`);
        } else {
          alert(error.response.data.message);
        }
      },
    }
  );

  const onClickAUSubmit = (data: any) => {
    const AD_AU_data = data;
    AD_AU_data.id = adAccountId;

    updateAdAccount(AD_AU_data)
      .then((res: any) => {
        if (res.status === 200) {
          setIsOpenSubmitAlertModal(true);
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          setErrorAlertModalMessage(err.response.data.message);
          setIsOpenErrorAlertModal(true);
        }
      });
  };

  return (
    <div>
      {fetchManagerDetail.isSuccess && (
        <>
          <AppPageHeader title={'광고계정'} />
          <div className={'content__inner'}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고계정 ID</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.id}</AppTypography.Text>
              </div>
            </div>
            {roleType === 'isAdmin' || roleType === 'isMaster' || roleType === 'isEmployee' ? (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      광고계정명
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <Controller
                      name={'name'}
                      defaultValue={fetchManagerDetail.data?.name}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputCount
                            maxLength={50}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
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
                          value: /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\-\_\s]+$/,
                          message: '광고계정명은 영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AU_errors}
                      name={'name'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </div>
                  <div className={'col col-extra'}>
                    <AppTypography.Text type={'sub'} className={'text'}>
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
                      defaultValue={fetchManagerDetail.data?.description}
                      control={AU_control}
                      render={({ field }) => {
                        return (
                          <AppInputTextArea
                            as="textarea"
                            maxLength={200}
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          />
                        );
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label isRequired className={'text'}>
                      광고계정명
                    </AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.name}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>설명</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.description}</AppTypography.Text>
                  </div>
                </div>
              </>
            )}
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>시간대</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.time_zone_detail}</AppTypography.Text>
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
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>담당자</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {/* 광고주 마스터 */}
                <div>
                  <AppTypography.Text
                    accepter={'span'}
                    className={'text'}
                    style={{ display: 'inline-block', width: '68px' }}
                  >
                    광고주 마스터
                  </AppTypography.Text>
                  <AppDivider vertical={true} />
                  {fetchManagerDetail.data?.accounts?.ADVERTISER_MASTER?.map((item: any, index: number) => {
                    return (
                      <AppTypography.Text
                        accepter={'span'}
                        className={'text'}
                        style={{ marginRight: '10px' }}
                        key={index}
                      >
                        {item} {index < fetchManagerDetail.data?.accounts?.ADVERTISER_MASTER?.length - 1 ? ', ' : ''}
                      </AppTypography.Text>
                    );
                  })}
                  {fetchManagerDetail.data?.accounts?.ADVERTISER_MASTER?.length === 0 && (
                    <AppTypography.Text accepter={'span'} className={'text'}>
                      -
                    </AppTypography.Text>
                  )}
                </div>
                {/* 광고주 USER */}
                <div>
                  <AppTypography.Text
                    accepter={'span'}
                    className={'text'}
                    style={{ display: 'inline-block', width: '68px' }}
                  >
                    광고주 USER
                  </AppTypography.Text>
                  <AppDivider vertical={true} />
                  {fetchManagerDetail.data?.accounts?.ADVERTISER_EMPLOYEE?.map((item: any, index: number) => {
                    return (
                      <AppTypography.Text
                        accepter={'span'}
                        className={'text'}
                        style={{ marginRight: '10px' }}
                        key={index}
                      >
                        {item} {index < fetchManagerDetail.data?.accounts?.ADVERTISER_EMPLOYEE?.length - 1 ? ', ' : ''}
                      </AppTypography.Text>
                    );
                  })}
                  {fetchManagerDetail.data?.accounts?.ADVERTISER_EMPLOYEE?.length === 0 && (
                    <AppTypography.Text accepter={'span'} className={'text'}>
                      -
                    </AppTypography.Text>
                  )}
                </div>
                {/* 대행사 USER */}
                <div>
                  <AppTypography.Text
                    accepter={'span'}
                    className={'text'}
                    style={{ display: 'inline-block', width: '68px' }}
                  >
                    대행사 USER
                  </AppTypography.Text>
                  <AppDivider vertical={true} />
                  {fetchManagerDetail.data?.accounts?.AGENCY?.map((item: any, index: number) => {
                    return (
                      <AppTypography.Text
                        accepter={'span'}
                        className={'text'}
                        style={{ marginRight: '10px' }}
                        key={index}
                      >
                        {item} {index < fetchManagerDetail.data?.accounts?.AGENCY?.length - 1 ? ', ' : ''}
                      </AppTypography.Text>
                    );
                  })}
                  {fetchManagerDetail.data?.accounts?.AGENCY?.length === 0 && (
                    <AppTypography.Text accepter={'span'} className={'text'}>
                      -
                    </AppTypography.Text>
                  )}
                </div>
                {/* 성과 VIEWER */}
                <div>
                  <AppTypography.Text
                    accepter={'span'}
                    className={'text'}
                    style={{ display: 'inline-block', width: '68px' }}
                  >
                    성과 Viewer
                  </AppTypography.Text>
                  <AppDivider vertical={true} />
                  {fetchManagerDetail.data?.accounts?.REPORT_VIEWER?.map((item: any, index: number) => {
                    return (
                      <AppTypography.Text
                        accepter={'span'}
                        className={'text'}
                        style={{ marginRight: '10px' }}
                        key={index}
                      >
                        {item} {index < fetchManagerDetail.data?.accounts?.REPORT_VIEWER?.length - 1 ? ', ' : ''}
                      </AppTypography.Text>
                    );
                  })}
                  {fetchManagerDetail.data?.accounts?.REPORT_VIEWER?.length === 0 && (
                    <AppTypography.Text accepter={'span'} className={'text'}>
                      -
                    </AppTypography.Text>
                  )}
                </div>
              </div>
            </div>
            <AppDivider />
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>생성일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.created_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 수정일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.updated_at}</AppTypography.Text>
              </div>
            </div>
          </div>
          <FinalActionDivider />
          {(roleType === 'isMaster' || roleType === 'isAdmin' || roleType === 'isEmployee') && (
            <AppPageFooter>
              <AppButton
                size={'lg'}
                style={{ color: 'white', width: 138 }}
                type={'submit'}
                onClick={AU_handleSubmit(onClickAUSubmit)}
              >
                저장
              </AppButton>
            </AppPageFooter>
          )}
        </>
      )}
      <AlertModal
        open={isOpenSubmitAlertModal}
        onOk={() => {
          setIsOpenSubmitAlertModal(false);
          navigate(0);
        }}
        content={<AppTypography.Text>입력한 정보가 저장 되었습니다.</AppTypography.Text>}
        title={'광고계정 수정'}
      />
      <AlertModal
        open={isOpenErrorAlertModal}
        onOk={() => setIsOpenErrorAlertModal(false)}
        content={<AppTypography.Text>{errorAlertModalMessage}</AppTypography.Text>}
        title={'API 에러'}
      />
    </div>
  );
};

export default AccountAdAccount;
