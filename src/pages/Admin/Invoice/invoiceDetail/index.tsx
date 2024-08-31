import React, { useState } from 'react';
import { FlexboxGrid, List } from 'rsuite';
import { useNavigate, useParams } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { FinalActionDivider } from '@components/AppDivider';
import { AppButton } from '@components/AppButton';
import numberWithCommas from '@utils/common';
import { useQuery } from '@tanstack/react-query';
import { getInvoiceDetail } from '@apis/invoice.api';
import _ from 'lodash';

interface adminInvoiceUpdateProps {}

const ENV = import.meta.env;
const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;

const AdminInvoiceUpdate: React.FC<adminInvoiceUpdateProps> = () => {
  const navigate = useNavigate();

  const [tmpInputItem, setTmpInputItem] = useState<any[]>([]);

  const [adAmount, setAdAmount] = useState(0);
  const [couponAmount, setCouponAmount] = useState(0);
  const [totalInputAmount, setTotalInputAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [totalImpressions, setTotalImpressions] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalInstall, setTotalInstall] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);

  const [totalFixes, setTotalFixes] = useState(0);

  const { id: invoiceId } = useParams();

  const fetchInvoiceDetail = useQuery(
    ['fetchInvoiceDetail', invoiceId],
    async () => {
      const { data } = await getInvoiceDetail(invoiceId);
      if (data) {
        return {
          ...data,
          advertiser: {
            id: data.advertiser.id || '-',
            type: data.advertiser.type || '-',
            advertiser_name: data.advertiser.advertiser_name || '-',
            owner_name: data.advertiser.owner_name || '-',
            business_license_file_name: data.advertiser.business_license_file_name || '-',
            business_license_number: data.advertiser.business_license_number || '-',
            address: data.advertiser.address || '-',
            birthday: data.advertiser.birthday || '-',
          },
          invoice: {
            payment_month: data.invoice.payment_month || '-',
            ad_account_id: data.invoice.ad_account_id || '-',
            ad_account_name: data.invoice.ad_account_name || '-',
            currency: data.invoice.currency || '-',
            total_spend: data.invoice.total_spend || '-',
            status: data.invoice.status || '-',
          },
          campaigns: data.campaigns.map((item: any) => {
            return {
              ...item,
              app_id: item.app_id || '-',
              app_name: item.app_name || '-',
              campaign_id: item.campaign_id || '-',
              campaign_name: item.campaign_name || '-',
              clicks: item.clicks || 0,
              impressions: item.impressions || 0,
              installs: item.installs || 0,
              invoice_id: item.invoice_id || '-',
              main: item.main || '-',
              main_campaign_id: item.main_campaign_id || '-',
              spend: item.spend || 0,
            };
          }),
          coupons: data.coupons.map((item: any) => {
            return {
              ...item,
              expire_month: item.expire_month || '-',
              id: item.id || '-',
              name: item.name || '-',
              total_value: item.total_value || 0,
              value: item.value || 0,
            };
          }),
          fixes: data.fixes.map((item: any) => {
            return {
              ...item,
              id: item.id || '-',
              reason: item.reason || '-',
              value: item.value || '-',
            };
          }),
        };
      }
    },
    {
      enabled: !_.isEmpty(invoiceId),
      onSuccess: (data) => {
        setAdAmount(data?.invoice.total_spend);
        // 쿠폰 오픈 전이라 주석 처리
        // setCouponAmount(data?.coupons.reduce((acc: number, cur: any) => acc + cur.value, 0));

        setTotalClicks(data?.campaigns.reduce((acc: number, cur: any) => acc + cur.clicks, 0));
        setTotalInstall(data?.campaigns.reduce((acc: number, cur: any) => acc + cur.installs, 0));
        setTotalSpend(data?.campaigns.reduce((acc: number, cur: any) => acc + cur.spend, 0));
        setTotalImpressions(data?.campaigns.reduce((acc: number, cur: any) => acc + cur.impressions, 0));

        setTotalFixes(data?.fixes.reduce((acc: number, cur: any) => acc + cur.value, 0));

        // 실제 정산 금액 계산
        // let tmpTotalAmount =
        //   data?.invoice.total_spend -
        //   data?.coupons.reduce((acc: number, cur: any) => acc + cur.value, 0) +
        //   data?.fixes.reduce((acc: number, cur: any) => acc + cur.value, 0);

        // 쿠폰 오픈 전 이라 쿠폰은 빼고 계산
        let tmpTotalAmount =
          data?.invoice.total_spend + data?.fixes.reduce((acc: number, cur: any) => acc + cur.value, 0);
        setTotalAmount(tmpTotalAmount);
      },
    }
  );

  const styleCenter = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60px',
  };

  return (
    <div>
      <AppPageHeader title={'정산 관리 > 상세'} />
      <div className={'content__inner'}>
        {/* 정산 대상 정보 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <AppTypography.Label style={{ fontSize: '14px' }}>정산 대상 정보</AppTypography.Label>
            <AppButton
              size={'lg'}
              style={{ width: 127, backgroundColor: 'green', border: 'none', color: 'white', cursor: 'auto' }}
            >
              정산 확정
            </AppButton>
          </div>

          {fetchInvoiceDetail.data?.advertiser?.type === '사업자' ? (
            <>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>정산월</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.invoice?.payment_month}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고계정명</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.invoice?.ad_account_name}(
                    {fetchInvoiceDetail.data?.invoice?.ad_account_id})
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.type}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>사업자등록번호</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.business_license_number}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>사업자등록증</AppTypography.Label>
                </div>
                <div>
                  {fetchInvoiceDetail.data?.advertiser?.business_license_file_name !== '-' ? (
                    <a
                      href={`${WISEBIRDS_API}/v1/advertisers/${fetchInvoiceDetail.data?.advertiser?.id}/business-license`}
                      className={'text'}
                    >
                      {fetchInvoiceDetail.data?.advertiser?.business_license_file_name}
                    </a>
                  ) : (
                    '업로드한 파일 없음'
                  )}
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.advertiser_name}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>대표자명</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.owner_name}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>사업자 주소</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.address}
                  </AppTypography.Text>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>정산월</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.invoice?.payment_month}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고계정명</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.invoice?.ad_account_name}(
                    {fetchInvoiceDetail.data?.invoice?.ad_account_id})
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.type}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.advertiser_name}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>식별 번호</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{fetchInvoiceDetail.data?.advertiser?.id}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>생년월일</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.birthday}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>주소</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchInvoiceDetail.data?.advertiser?.address}
                  </AppTypography.Text>
                </div>
              </div>
            </>
          )}
        </div>
        {/* 정산 항목 */}
        <div style={{ marginTop: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <AppTypography.SubTitle level={2}>정산 항목</AppTypography.SubTitle>
            <AppTypography.Text style={{ fontWeight: 700 }}>통화: KRW</AppTypography.Text>
          </div>
          <div>
            <List bordered>
              <List.Item style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f1f1f1' }}>
                <div>총 광고비</div>
                <div>{numberWithCommas(adAmount)}</div>
              </List.Item>
              <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: 150, fontWeight: 'bold' }}>앱</div>
                <div style={{ width: 150, fontWeight: 'bold' }}>캠페인</div>
                <div style={{ width: 150, textAlign: 'right', fontWeight: 'bold' }}>Impression</div>
                <div style={{ width: 150, textAlign: 'right', fontWeight: 'bold' }}>Click</div>
                <div style={{ width: 150, textAlign: 'right', fontWeight: 'bold' }}>Install</div>
                <div style={{ width: 150, textAlign: 'right', fontWeight: 'bold' }}>Spend</div>
              </List.Item>
              {fetchInvoiceDetail.data?.campaigns.map((item: any) => {
                return (
                  <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: 150 }}>{item.app_name}</div>
                    <div style={{ width: 150 }}>{item.campaign_name}</div>
                    <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(item.impressions)}</div>
                    <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(item.clicks)}</div>
                    <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(item.installs)}</div>
                    <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(item.spend)}</div>
                  </List.Item>
                );
              })}
              <List.Item style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f1f1f1' }}>
                <div style={{ width: 150 }}>총 합계</div>
                <div style={{ width: 150 }}></div>
                <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(totalImpressions)}</div>
                <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(totalClicks)}</div>
                <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(totalInstall)}</div>
                <div style={{ width: 150, textAlign: 'right' }}>{numberWithCommas(totalSpend)}</div>
              </List.Item>
              {/*<List.Item style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f1f1f1'}}>*/}
              {/*  <div>쿠폰 금액</div>*/}
              {/*  <div>*/}
              {/*    {couponAmount > 0 ? '-' : ''}*/}
              {/*    {numberWithCommas(couponAmount)}*/}
              {/*  </div>*/}
              {/*</List.Item>*/}
              {/*{fetchInvoiceDetail.data?.coupons.map((item: any) => {*/}
              {/*  return (*/}
              {/*    <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>*/}
              {/*      <div>ㄴ {item.name}</div>*/}
              {/*      <div>{numberWithCommas(item.value)}</div>*/}
              {/*    </List.Item>*/}
              {/*  );*/}
              {/*})}*/}
              <List.Item style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f1f1f1' }}>
                <div>기타 조정 금액</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>{numberWithCommas(totalFixes)}</div>
                </div>
              </List.Item>
              {fetchInvoiceDetail.data?.fixes.map((item: any) => {
                return (
                  <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>ㄴ {item.reason}</div>
                    <div>{numberWithCommas(item.value)}</div>
                  </List.Item>
                );
              })}
              <List.Item style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f5d8c7' }}>
                <div>실제 정산 금액(세금계산서 발행 금액)</div>
                <div>{numberWithCommas(totalAmount)}</div>
              </List.Item>
            </List>
          </div>
        </div>
      </div>
      <FinalActionDivider />
      <div className={'create-cancel-btn'}>
        <AppButton size={'lg'} style={{ width: 138, marginLeft: 15 }} onClick={() => navigate('/admin/invoice')}>
          목록
        </AppButton>
      </div>
    </div>
  );
};

export default AdminInvoiceUpdate;
