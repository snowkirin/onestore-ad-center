import React from 'react';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { useQuery } from '@tanstack/react-query';
import { getAdAccountDetail, updateAdAccount } from '@apis/ad_account.api';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { AppInputCount } from '@components/AppInput';
import AppInputTextArea from '../../../../components/AppInput/AppInputTextArea';
import { AppButton } from '@components/AppButton';
import AppDivider, { FinalActionDivider } from '@components/AppDivider';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import _ from 'lodash';
import { REGEXP_EN_KR_NUM_HYPHEN_UNDERBAR_SPACE } from '@utils/regexp';
import AppPageFooter from '@components/AppPageFooter';

interface AdminAccountAdAccountUpdateProps {}

const AdminAccountAdAccountUpdate: React.FC<AdminAccountAdAccountUpdateProps> = () => {
  const role = sessionStorage.getItem('role');
  const navigate = useNavigate();
  const URLParams = queryString.parse(location.search);

  const {
    handleSubmit: AD_AU_handleSubmit,
    control: AD_AU_control,
    formState: { errors: AD_AU_errors },
  } = useForm();

  const fetchManagerDetail = useQuery(
    ['fetchManagerDetail', URLParams.id],
    async () => {
      const { data } = await getAdAccountDetail(URLParams.id);
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
      enabled: !_.isEmpty(URLParams.id),
    }
  );

  const onClickADAUSubmit = (data: any) => {
    const AD_AU_data = data;
    AD_AU_data.id = URLParams.id;
    updateAdAccount(AD_AU_data)
      .then((res: any) => {
        if (res.status === 200) {
          navigate('/admin/account/ad-account');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          alert(err.response.data.message);
        }
      });
  };

  const chkConfirm = () => {
    if (confirm('광고계정 수정을 취소하시겠습니까? 수정한 내용은 저장되지 않습니다.')) {
      navigate('/admin/account/ad-account');
    }
  };

  return (
    <>
      {!fetchManagerDetail.isFetching && (
        <div>
          <AppPageHeader title={'광고계정 조회/수정'} />
          <div className={'content__inner'}>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.advertiser_name}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고계정 ID</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.id}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label isRequired className={'text'}>
                  광고계정명
                </AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {role === 'ADMIN' ? (
                  <>
                    <Controller
                      name={'name'}
                      defaultValue={fetchManagerDetail.data?.name}
                      control={AD_AU_control}
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
                          message: '광고계정명은  2~50자로 입력해 주세요.',
                        },
                        pattern: {
                          value: REGEXP_EN_KR_NUM_HYPHEN_UNDERBAR_SPACE,
                          message: '광고계정명은 영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능합니다.',
                        },
                      }}
                    />
                    <ErrorMessage
                      errors={AD_AU_errors}
                      name={'name'}
                      render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
                    />
                  </>
                ) : (
                  <AppTypography.Text className={'text'}>{fetchManagerDetail.data?.name}</AppTypography.Text>
                )}
              </div>
              {role === 'ADMIN' && (
                <div className={'col col-extra'}>
                  <AppTypography.Text type={'sub'} className={'text'}>
                    영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능
                  </AppTypography.Text>
                </div>
              )}
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>설명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {role === 'ADMIN' ? (
                  <Controller
                    name={'description'}
                    defaultValue={fetchManagerDetail.data?.description}
                    control={AD_AU_control}
                    render={({ field }) => {
                      return (
                        <AppInputTextArea
                          as="textarea"
                          maxLength={200}
                          height={100}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        />
                      );
                    }}
                  />
                ) : (
                  <AppTypography.Text className={'text'} style={{ whiteSpace: 'pre' }}>
                    {fetchManagerDetail.data?.description}
                  </AppTypography.Text>
                )}
              </div>
            </div>
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
          <AppPageFooter>
            {role === 'ADMIN' ? (
              <>
                <AppButton size={'lg'} style={{ width: 138 }} onClick={chkConfirm}>
                  취소
                </AppButton>
                <AppButton
                  size={'lg'}
                  style={{ color: 'white', width: 138, marginLeft: 15 }}
                  type={'submit'}
                  onClick={AD_AU_handleSubmit(onClickADAUSubmit)}
                >
                  저장
                </AppButton>
              </>
            ) : (
              <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/admin/account/ad-account')}>
                목록
              </AppButton>
            )}
          </AppPageFooter>
        </div>
      )}
    </>
  );
};

export default AdminAccountAdAccountUpdate;
