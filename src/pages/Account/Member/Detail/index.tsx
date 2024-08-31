import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppTypography from '@components/AppTypography';
import AppToggle from '@components/AppToggle';
import { AppButton } from '@components/AppButton';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { getUserDetail } from '@apis/user.api';
import { getRoleType } from '@utils/functions';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';

interface AccountMemberDetailProps {}

const AccountMemberDetail: React.FC<AccountMemberDetailProps> = () => {
  const sessionRole = sessionStorage.getItem('role');
  const memberId = sessionStorage.getItem('id');
  const roleType = getRoleType(sessionRole);

  const navigate = useNavigate();

  // 저장값
  const [enabled, setEnabled] = useState(false);
  const [role, setRole] = useState('');

  const roleArray = [
    { label: '광고주 마스터', value: 'ADVERTISER_MASTER' },
    { label: '광고주 User', value: 'ADVERTISER_EMPLOYEE' },
    { label: '대행사 User', value: 'AGENCY' },
    { label: '성과 Viewer', value: 'REPORT_VIEWER' },
  ];

  const { accountId: accountId } = useParams();

  const fetchUserDetail = useQuery(
    ['UserDetail', accountId],
    async () => {
      const result = await getUserDetail(accountId);
      if (result.status === 200) {
        return {
          ...result.data,
        };
      } else {
        return [];
      }
    },
    {
      onSuccess: (data) => {
        setRole(data.role);
        setEnabled(data.enabled);
      },
      onError: (error: any) => {
        if (error.response.status === 406) {
          navigate(`/confirm-password?referrer=${encodeURIComponent(location.pathname + location.search)}`);
        } else {
          alert(error.response.data.message);
        }
      },
    }
  );

  return (
    <>
      {fetchUserDetail.isSuccess && (
        <div>
          {roleType === 'isViewer' ? (
            <AppPageHeader title={'사용자 조회'} />
          ) : (
            <AppPageHeader title={'사용자 조회/수정'} />
          )}
          <div className={'content__inner'}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: 570 }}>
              <AppTypography.Text style={{ marginRight: 10 }}>{enabled ? '활성' : '비활성'}</AppTypography.Text>
              <AppToggle checked={enabled} disabled={true} />
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>아이디</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.signin_id}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>이름</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.name}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>이메일</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.email}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>휴대폰 번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.tel}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>권한</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {roleArray.filter((item) => item.value === fetchUserDetail.data?.role)[0]?.label}
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고계정</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {fetchUserDetail.data?.ad_accounts?.map((item: any, index: number) => {
                  return (
                    <AppTypography.Text key={index} className={'text'}>
                      {item.name}
                      {index < fetchUserDetail.data?.ad_accounts?.length - 1 ? ',' : ''}
                    </AppTypography.Text>
                  );
                })}
              </div>
            </div>
            <AppDiver />

            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>생성일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{fetchUserDetail.data?.created_at}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 수정일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchUserDetail.data?.updated_at ? fetchUserDetail.data?.updated_at : '-'}
                </AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>마지막 접속일시</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>
                  {fetchUserDetail.data?.last_login ? fetchUserDetail.data?.last_login : '-'}
                </AppTypography.Text>
              </div>
            </div>
          </div>
          <FinalActionDivider />
          <AppPageFooter>
            {roleType === 'isViewer' ? (
              <AppButton
                size={'lg'}
                theme={'red'}
                style={{ width: 138 }}
                onClick={() => navigate(`/account/member/update/${memberId}`)}
              >
                수정
              </AppButton>
            ) : (
              <AppButton size={'lg'} theme={'red'} style={{ width: 138 }} onClick={() => navigate('/account/member')}>
                목록
              </AppButton>
            )}
          </AppPageFooter>
        </div>
      )}
    </>
  );
};

export default AccountMemberDetail;
