import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdvertiserDetail } from '@apis/account.api';
import { useQuery } from '@tanstack/react-query';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import AppDiver, { FinalActionDivider } from '@components/AppDivider';
import { getRoleType } from '@utils/functions';
import { WISEBIRDS_API } from '@apis/request';
import AppPageHeader from '@components/AppPageHeader';
import AppPageFooter from '@components/AppPageFooter';

interface AccountAdvertiserDetailProps {}

const AccountAdvertiserDetail: React.FC<AccountAdvertiserDetailProps> = () => {
  const role = sessionStorage.getItem('role');
  const navigate = useNavigate();
  const roleType = getRoleType(role);

  const { advertiserId: advertiserId } = useParams();
  const [advertiserDetail, setAdvertiserDetail] = useState<any>({});

  // 저장값
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [invoiceManager, setInvoiceManager] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceTel, setInvoiceTel] = useState('');

  const goUpdate = () => {
    navigate(`/account/advertiser/update/${advertiserId}`);
  };

  const fetchAdvertiserDetail = useQuery(
    ['fetchAdvertiserDetail', advertiserId],
    async () => {
      const { data } = await getAdvertiserDetail(advertiserId);
      if (data) {
        return {
          ...data,
          businessLicenseUrl: data.business_license_url,
          businessLicenseFileName: data.business_license_file_name,
          identity_number: data.identity_number || '-',
          birthday: data.birthday || '',
          invoice_manager: data.invoice_manager || '-',
          invoice_email: data.invoice_email || '-',
          invoice_tel: data.invoice_tel || '-',
        };
      } else {
        return [];
      }
    },
    {
      enabled: !!advertiserId,
      onSuccess: (data: any) => {
        setAdvertiserDetail(data);
        setName(data.name);
        setOwnerName(data.owner_name);
        setAddress(data.address);
        setBirthday(data.identity_number);
        setInvoiceManager(data.invoice_manager);
        setInvoiceEmail(data.invoice_email);
        setInvoiceTel(data.invoice_tel);
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
    <div>
      {fetchAdvertiserDetail.isSuccess && (
        <>
          <AppPageHeader title={'광고주 조회'} />
          <div className={'content__inner'}>
            {advertiserDetail.type === '사업자' ? (
              <>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{advertiserDetail.type}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>사용자등록번호</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{advertiserDetail.identity_number}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>사업자등록증</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    {advertiserDetail.businessLicenseFileName !== '' &&
                    advertiserDetail.businessLicenseFileName !== null ? (
                      <a href={`${WISEBIRDS_API}/v1/advertisers/${advertiserId}/business-license`}>
                        <AppTypography.Text className={'text'}>
                          {advertiserDetail.business_license_file_name}
                        </AppTypography.Text>
                      </a>
                    ) : (
                      <AppTypography.Text className={'text'}>업로드한 파일 없음</AppTypography.Text>
                    )}
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{name}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>대표자명</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{ownerName}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>사업자 주소</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{address}</AppTypography.Text>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{advertiserDetail.type}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{name}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>생년월일</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{birthday}</AppTypography.Text>
                  </div>
                </div>
                <div className={'row'}>
                  <div className={'col col-label--big'}>
                    <AppTypography.Label className={'text'}>주소</AppTypography.Label>
                  </div>
                  <div className={'col col-input'}>
                    <AppTypography.Text className={'text'}>{address}</AppTypography.Text>
                  </div>
                </div>
              </>
            )}
            <AppDiver />
            <div className={'row'}>
              <div className={'col col-label--big'}>
                <AppTypography.Label className={'text'}>정산 담당자 이름</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{invoiceManager}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label--big'}>
                <AppTypography.Label className={'text'}>정산 담당자 이메일</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{invoiceEmail}</AppTypography.Text>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col col-label--big'}>
                <AppTypography.Label className={'text'}>정산 담당자 휴대폰 번호</AppTypography.Label>
              </div>
              <div className={'col col-input'}>
                <AppTypography.Text className={'text'}>{invoiceTel}</AppTypography.Text>
              </div>
            </div>
          </div>

          <FinalActionDivider />
          <AppPageFooter>
            <AppButton
              disabled={roleType !== 'isAdmin' && roleType !== 'isMaster'}
              size={'lg'}
              style={{ width: 138 }}
              onClick={goUpdate}
            >
              수정
            </AppButton>
          </AppPageFooter>
        </>
      )}
    </div>
  );
};

export default AccountAdvertiserDetail;
