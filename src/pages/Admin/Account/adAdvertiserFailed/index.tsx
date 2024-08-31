import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdvertiserDetail } from '@apis/account.api';
import AppTypography from '@components/AppTypography';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import { useNavigate, useParams } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';

interface AdminAccountAdvertiserFailedProps {}

const ENV = import.meta.env;
const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;

const AdminAccountAdvertiserFailed: React.FC<AdminAccountAdvertiserFailedProps> = () => {
  const [isFile, setIsFile] = useState<boolean>(false);
  const navigate = useNavigate();
  const { advertiserId: advertiserId } = useParams();
  const [advertiserDetail, setAdvertiserDetail] = useState<any>({});

  const fetchAdvertiserDetail = useQuery(
    ['fetchAdvertiserDetail', advertiserId],
    async () => {
      const { data } = await getAdvertiserDetail(advertiserId);
      if (data) {
        return {
          ...data,
          identity_number: data.identity_number || '-',
        };
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        if (data.business_license_file_name !== '' && data.business_license_file_name !== null) {
          setIsFile(true);
        } else {
          setIsFile(false);
        }
        setAdvertiserDetail(data);
      },
    }
  );
  return (
    <div>
      <AppPageHeader title={'광고주 조회/수정'} />
      <div className={'content__inner'}>
        {advertiserDetail.type === '사업자' ? (
          <>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.type}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>사용자등록번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.identity_number}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>사업자등록증</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                {isFile ? (
                  <a href={`${WISEBIRDS_API}/v1/advertisers/${advertiserId}/business-license`} className={'text'}>
                    {fetchAdvertiserDetail.data?.business_license_file_name}
                  </a>
                ) : (
                  <AppTypography.Text className={'text'}>업로드한 파일 없음</AppTypography.Text>
                )}
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.name}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>대표자명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.owner_name}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>사업자 주소</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.address}</AppTypography.Text>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.type}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>식별 번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserId}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.name}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>생년월일</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.identity_number}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label'}>
                <AppTypography.Label className={'text'}>주소</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{advertiserDetail.address}</AppTypography.Text>
              </div>
            </div>
          </>
        )}
        <AppDiver />
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>가입 신청 일시</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{advertiserDetail.created_at}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>반려 일시</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{advertiserDetail.updated_at}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>검수자</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{advertiserDetail.reviewer}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>반려 사유</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'} style={{ whiteSpace: 'pre' }}>
              {advertiserDetail.reject_reason}
            </AppTypography.Text>
          </div>
        </div>
      </div>

      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/admin/account/advertiser')}>
          목록
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default AdminAccountAdvertiserFailed;
