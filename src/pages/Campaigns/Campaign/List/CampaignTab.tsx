import React from 'react';
import { AppButton } from '@components/AppButton';
import AppTable from '@/components/AppTable';
import { Controller, useForm } from 'react-hook-form';
import AppToggle from '@components/AppToggle';
import { CurrencyUnit } from '@utils/variables';
import dayjs from 'dayjs';
import AppTypography from '@/components/AppTypography';
import _ from 'lodash';
import { CAMPAIGN_PURPOSE, CAMPAIGN_STATUS, CAMPAIGN_TYPE } from '@pages/Campaigns/Campaign/variables';
import { numberWithCommas } from '@/utils';
import EllipsisPopup from '@components/EllipsisPopup';
import { Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import { useQuery } from '@tanstack/react-query';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import { CommaCell, CostCell, CtrCell, SpendCell } from '@components/Common/NumberCell';

interface CampaignTabProps {
  product: any;
  campaignData: {
    data: any;
    isLoading: boolean;
    error?: boolean;
  };
  currentTab: string;
  onCampaignCreateClick: () => void;
  onCampaignToggleChange: (rowData: any, checked: boolean, field: any) => void;
  onCampaignNameClick: (id: string) => void;
  onCampaignEditClick: (id: string) => void;
  onCampaignAdGroupAddClick: (id: string) => void;
  toggleLoadingId: string;
}

const CampaignTab: React.FC<CampaignTabProps> = ({
  product,
  campaignData,
  onCampaignCreateClick,
  onCampaignToggleChange,
  onCampaignNameClick,
  onCampaignEditClick,
  onCampaignAdGroupAddClick,
  toggleLoadingId,
}) => {
  const { control } = useForm();
  const adAccountId = localStorage.getItem('selectedAdAccount');
  const productId = product?.id;
  const fetchTrackingLinkList = useQuery(
    ['fetchTrackingLinkList', adAccountId, productId],
    async () => {
      if (!adAccountId || !productId) return;
      const { data } = await getTrackingLinkList({
        ad_account_id: adAccountId,
        product_id: productId,
      });
      if (data.tracking_links && data.tracking_links.length !== 0) {
        return data.tracking_links;
      } else {
        return [];
      }
    },
    {
      enabled: !!adAccountId && !!productId,
    }
  );

  return (
    <div>
      <div style={{ padding: '14px 30px' }}>
        {!product ||
        !fetchTrackingLinkList?.data ||
        (fetchTrackingLinkList?.data && fetchTrackingLinkList?.data.length === 0) ? (
          <Whisper
            trigger="hover"
            placement="bottomStart"
            enterable
            speaker={
              <AppPopover theme={'white'}>
                {!product
                  ? `자산 > 앱 메뉴에서 앱을 생성하세요.`
                  : `자산 > 트래킹 링크 메뉴에서 트래킹 링크를 생성하세요.`}
              </AppPopover>
            }
          >
            <span style={{ display: 'inline-block' }}>
              <AppButton theme={'create'} size="md" style={{ width: 80, pointerEvents: 'none' }} disabled>
                생성
              </AppButton>
            </span>
          </Whisper>
        ) : (
          <AppButton theme={'create'} size="md" onClick={onCampaignCreateClick} style={{ width: 80 }}>
            생성
          </AppButton>
        )}
      </div>
      <div>
        <AppTable data={campaignData.data} loading={campaignData.isLoading} autoHeight>
          <AppTable.Column align={'center'}>
            <AppTable.HeaderCell>온/오프</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => {
                return (
                  <Controller
                    name={`toggle-${rowData.id}`}
                    control={control}
                    defaultValue={rowData.enabling_state === 'ENABLED'}
                    render={({ field }) => {
                      return (
                        <AppToggle
                          checked={field.value}
                          loading={toggleLoadingId === rowData.id}
                          onChange={(checked: boolean) => {
                            onCampaignToggleChange(rowData, checked, field);
                          }}
                        />
                      );
                    }}
                  />
                );
              }}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={300} resizable>
            <AppTable.HeaderCell>캠페인 명</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'title'}>
              {(rowData) => (
                <EllipsisPopup
                  text={
                    <AppTypography.Link onClick={() => onCampaignNameClick(rowData.id)}>
                      {rowData.title}
                    </AppTypography.Link>
                  }
                />
              )}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column>
            <AppTable.HeaderCell>상태</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'state'}>
              {(rowData) =>
                CAMPAIGN_STATUS[rowData.state as 'SUBMITTED' | 'READY' | 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED']
              }
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={160}>
            <AppTable.HeaderCell>캠페인 타입</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'type'}>
              {(rowData) => CAMPAIGN_TYPE[rowData.type as 'APP_USER_ACQUISITION' | 'APP_REENGAGEMENT']}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={140}>
            <AppTable.HeaderCell>캠페인 목적</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) =>
                CAMPAIGN_PURPOSE[
                  _.get(rowData, 'goal.type') as
                    | 'OPTIMIZE_CPI_FOR_APP_UA'
                    | 'OPTIMIZE_CPA_FOR_APP_UA'
                    | 'OPTIMIZE_ROAS_FOR_APP_UA'
                    | 'OPTIMIZE_CPC_FOR_APP_RE'
                    | 'OPTIMIZE_REATTRIBUTION_FOR_APP'
                    | 'OPTIMIZE_CPA_FOR_APP_RE'
                    | 'OPTIMIZE_ROAS_FOR_APP_RE'
                ]
              }
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={200}>
            <AppTable.HeaderCell>기간</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => {
                return `${dayjs(_.get(rowData, 'schedule.start')).format('YYYY-MM-DD')} ~ ${
                  _.get(rowData, 'schedule.end')
                    ? dayjs(_.get(rowData, 'schedule.end')).format('YYYY-MM-DD')
                    : '종료일 없음'
                }`;
              }}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={200}>
            <AppTable.HeaderCell>예산타입/예산</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => {
                let budget = 0;
                let budgetType = '';
                let currency = '';
                if (_.has(rowData, 'budget_schedule.daily_schedule')) {
                  const targetKey = 'budget_schedule.daily_schedule.daily_budget';
                  budgetType = '일 예산';
                  currency = _.get(rowData, `${targetKey}.currency`);
                  budget = _.get(rowData, `${targetKey}.amount_micros`) / 1000000;
                } else if (_.has(rowData, 'budget_schedule.weekly_flexible_schedule')) {
                  const targetKey = 'budget_schedule.weekly_flexible_schedule.weekly_budget';
                  budgetType = '주 예산';
                  currency = _.get(rowData, `${targetKey}.currency`);
                  budget = _.get(rowData, `${targetKey}.amount_micros`) / 1000000;
                } else if (_.has(rowData, 'budget_schedule.weekly_schedule')) {
                  budgetType = '일 예산(맞춤)';
                  currency = _.get(rowData, `budget_schedule.weekly_schedule.monday_budget.currency`);
                  budget = Math.floor(
                    Object.keys(_.get(rowData, `budget_schedule.weekly_schedule`)).reduce((acc, key) => {
                      return acc + _.get(rowData, `budget_schedule.weekly_schedule.${key}.amount_micros`) / 1000000;
                    }, 0) / 7
                  );
                }

                return `${budgetType} / ${CurrencyUnit[currency]} ${numberWithCommas(budget)}`;
              }}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column align={'right'} flexGrow={1} minWidth={100}>
            <AppTable.HeaderCell>Spend</AppTable.HeaderCell>
            <SpendCell dataKey={'metric.spend'} currencyKey={'currency'} />
          </AppTable.Column>
          <AppTable.Column align={'right'} flexGrow={1} minWidth={100}>
            <AppTable.HeaderCell>Impression</AppTable.HeaderCell>
            <CommaCell dataKey={'metric.impressions'} />
          </AppTable.Column>
          <AppTable.Column align={'right'} flexGrow={1} minWidth={100}>
            <AppTable.HeaderCell>Click</AppTable.HeaderCell>
            <CommaCell dataKey={'metric.clicks'} />
          </AppTable.Column>
          <AppTable.Column align={'right'} flexGrow={1} minWidth={100}>
            <AppTable.HeaderCell>Install</AppTable.HeaderCell>
            <CommaCell dataKey={'metric.installs'} />
          </AppTable.Column>
          <AppTable.Column align={'right'} flexGrow={1} minWidth={100}>
            <AppTable.HeaderCell>CTR</AppTable.HeaderCell>
            <CtrCell firstKey={'metric.clicks'} secondKey={'metric.impressions'} />
          </AppTable.Column>
          <AppTable.Column align={'right'} flexGrow={1} minWidth={100}>
            <AppTable.HeaderCell>CPI</AppTable.HeaderCell>
            <CostCell currencyKey={'currency'} firstKey={'metric.spend'} secondKey={'metric.installs'} />
          </AppTable.Column>
          <AppTable.Column align={'center'} fixed={'right'} width={80}>
            <AppTable.HeaderCell>수정</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => (
                <AppTypography.Link
                  onClick={() => {
                    onCampaignEditClick(rowData['id']);
                  }}
                >
                  수정
                </AppTypography.Link>
              )}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column align={'center'} fixed={'right'} width={80}>
            <AppTable.HeaderCell>광고그룹</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => (
                <AppTypography.Link
                  onClick={() => {
                    onCampaignAdGroupAddClick(rowData['id']);
                  }}
                >
                  추가
                </AppTypography.Link>
              )}
            </AppTable.Cell>
          </AppTable.Column>
        </AppTable>
      </div>
    </div>
  );
};

export default CampaignTab;
