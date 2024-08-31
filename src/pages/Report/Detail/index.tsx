import React, { useState } from 'react';
import { Loader, Table } from 'rsuite';
import { getGraphData, getMetaData, getReportResult } from '@apis/report.api';
import { AppButton } from '@components/AppButton';
import Download from '@assets/images/icons/download/download-big.svg';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppGraph from '@components/AppGraph';
import { useQuery } from '@tanstack/react-query';
import { get as _get, isEmpty, mapValues as _mapValues } from 'lodash';
import warning from '@assets/images/icons/warning/warning-big.svg';
import AppTable from '@components/AppTable/Table';
import numberWithCommas from '@utils/common';
import styled from 'styled-components';
import AppDivider from '@components/AppDivider';
import EllipsisPopup from '@components/EllipsisPopup';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import AppTypography from '@components/AppTypography';

interface ReportListProps {}

interface optionData {
  selectedCriteria: string;
  selectedFilterId: string[];
  selectedMetric?: string;
}

const initData = {
  selectedCriteria: '',
  selectedFilterId: [''],
  selectedMetric: 'impressions',
};

/* Styled Component */
const TableNoticeBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 30px;
`;

const TitleBox = styled.div`
  display: flex;
  align-items: center;
  margin-right: 32px;
  font-size: 14px;
  font-weight: bold;
`;

const { Column, HeaderCell, Cell } = Table;

const ENV = import.meta.env;
const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;

const ReportDetail: React.FC<ReportListProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { reportId: reportId } = useParams();
  const { dateRange: dateRange } = useParams();
  const { notOnlyDate: notOnlyDate } = useParams();

  /* 리스트 */
  const [criteriaList, setCriteriaList] = useState<any[]>([]);

  /* 선택된 값 */
  const [tempSelectedCriteria, setTempSelectedCriteria] = useState<string>('');
  const [tempSelectedFilterId, setTempSelectedFilterId] = useState<string[]>([]);
  const [tempSelectedMetric, setTempSelectedMetric] = useState<string>('impressions');

  /* 실제 보낼 데이터 */
  const [reportOptions, setReportOptions] = useState<optionData>(initData);

  /* 엑셀 다운로드 주소 */
  const [dataDownloadUrl, setDataDownloadUrl] = useState<string>('');

  /* 데이터 보여지는지 여부 판단 */
  const [isOverLimit, setIsOverLimit] = useState<boolean>(false);

  /* 데이터가 없는지 여부 판단 */
  const [isVisibleApp, setIsVisibleApp] = useState<boolean>(false);
  const [isVisibleCampaign, setIsVisibleCampaign] = useState<boolean>(false);
  const [isVisibleAdGroup, setIsVisibleAdGroup] = useState<boolean>(false);
  const [isVisibleCreativeGroup, setIsVisibleCreativeGroup] = useState<boolean>(false);
  const [isVisibleCreative, setIsVisibleCreative] = useState<boolean>(false);
  const [isVisibleExchangeId, setIsVisibleExchangeId] = useState<boolean>(false);
  const [isVisibleSubPulisherId, setIsVisibleSubPulisherId] = useState<boolean>(false);

  /* API 호출 */
  // Meta 데이터 api 호출
  const fetchMetaData = useQuery(
    ['fetchMetaData', reportId, isOverLimit],
    async () => {
      const { data } = await getMetaData(reportId);
      if (!isEmpty(data)) {
        const criteriaList = Object.keys(data).map((key) => {
          return {
            label: key,
            value: key,
          };
        });
        setCriteriaList(criteriaList);
        setTempSelectedCriteria(criteriaList[0].value);
        setReportOptions((prevState) => ({
          ...prevState,
          selectedCriteria: criteriaList[0].value,
        }));
        return _mapValues(data, (value) => {
          return value.map((ele: any) => {
            return {
              label: ele.title,
              value: ele.id,
            };
          });
        });
      } else {
        return [];
      }
    },
    {
      enabled: !isEmpty(reportId) && isOverLimit === false,
    }
  );
  // Report 데이터 api 호출
  const fetchReportData = useQuery(
    ['fetchReportData', reportId],
    async () => {
      const { data } = await getReportResult(reportId);
      setDataDownloadUrl(data.download_url);
      setIsOverLimit(data.over_limit);
      if (data.rows && data.rows.length !== 0) {
        return data.rows.map((item: any) => {
          return {
            ...item,
            date: item.date || '-',
            app: item.app?.title || '-',
            appId: item.app?.id || '-',
            appOS: item.app?.os || 'Android',
            campaign: item.campaign?.title || '-',
            campaignId: item.campaign?.id || '-',
            campaignCountry: item.campaign?.country || '-',
            adGroup: item.ad_group?.title || '-',
            adGroupId: item.ad_group?.id || '-',
            creativeGroup: item.creative_group?.title || '-',
            creativeGroupId: item.creative_group?.id || '-',
            creative: item.creative?.title || '-',
            creativeId: item.creative?.id || '-',
            creativeType: item.creative?.type || '-',
            exchangeId: item.exchange?.id || '-',
            subPublisher: item.sub_publisher?.title || '-',
            subPublisherId: item.sub_publisher?.id || '-',
            impression: numberWithCommas(item.metric?.impressions) || '-',
            click: numberWithCommas(item.metric?.clicks) || '-',
            install: numberWithCommas(item.metric?.installs) || '-',
            action: numberWithCommas(item.metric?.actions) || '-',
            spend: numberWithCommas(item.metric?.spend) || '-',
            ctr: item.metric?.ctr ? numberWithCommas(item.metric?.ctr) : '-',
            ipm: item.metric?.ipm ? numberWithCommas(item.metric?.ipm) : '-',
            cpc: item.metric?.cpc ? numberWithCommas(item.metric?.cpc) : '-',
            cpi: item.metric?.cpi ? numberWithCommas(item.metric?.cpi) : '-',
            cpa: numberWithCommas(item.metric?.cpa) || '-',
            currency: numberWithCommas(item.ad_account?.currency) || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        if (data.length) {
          if (data[0].app !== '-') {
            setIsVisibleApp(true);
          }
          if (data[0].campaign !== '-') {
            setIsVisibleCampaign(true);
          }
          if (data[0].adGroup !== '-') {
            setIsVisibleAdGroup(true);
          }
          if (data[0].creativeGroup !== '-') {
            setIsVisibleCreativeGroup(true);
          }
          if (data[0].creative !== '-') {
            setIsVisibleCreative(true);
          }
          if (data[0].exchangeId !== '-') {
            setIsVisibleExchangeId(true);
          }
          if (data[0].subPublisherId !== '-') {
            setIsVisibleSubPulisherId(true);
          }
        }
      },
      enabled: !isEmpty(reportId),
      onError: (error) => {
        setIsOverLimit(true);
      },
    }
  );
  // 옵션 선택 적용
  const setSelectedData = () => {
    setReportOptions({
      selectedCriteria: tempSelectedCriteria,
      selectedFilterId: tempSelectedFilterId,
      selectedMetric: tempSelectedMetric,
    });
  };
  // Graph 데이터 api 호출
  const fetchGraphData = useQuery(
    ['fetchGraphData', reportId, reportOptions, isOverLimit],
    async () => {
      return await getGraphData(reportId, {
        criteria: reportOptions.selectedCriteria,
        filterId: reportOptions.selectedFilterId.join(','),
        metric: reportOptions.selectedMetric,
      });
    },
    {
      enabled: !isEmpty(reportId) && isOverLimit === false,
    }
  );

  const ViewEllipsis: React.FC<any> = ({ rowData, dataKey, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <EllipsisPopup text={rowData[dataKey]} />
      </AppTable.Cell>
    );
  };

  return (
    <>
      <div>
        <div style={{ padding: '0 30px', marginBottom: 20, display: 'flex', alignItems: 'center' }}>
          <AppButton
            type={'button'}
            size={'md'}
            theme={'white_gray'}
            style={{ width: 70 }}
            onClick={() => {
              navigate('/report');
            }}
          >
            돌아가기
          </AppButton>
          <AppTypography.Headline style={{ lineHeight: '32px' }}>
            <span style={{ marginLeft: 15 }}>광고 리포트 조회 | {reportId}</span>
          </AppTypography.Headline>
        </div>
        <AppDivider style={{ marginTop: 9, marginBottom: 15 }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginLeft: 30,
            marginRight: 30,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TitleBox>
              <div>종합 차트</div>
              {isOverLimit && (
                <div style={{ marginLeft: 6 }}>
                  <img src={warning} alt={'warning'} />
                </div>
              )}
            </TitleBox>
            {!isOverLimit && (
              <>
                {notOnlyDate === 'true' && (
                  <>
                    <div>
                      <AppSelectPicker
                        size={'md'}
                        placeholder="선택 없음"
                        cleanable={false}
                        searchable={false}
                        style={{ width: '150px', marginRight: '10px' }}
                        data={criteriaList}
                        value={tempSelectedCriteria}
                        onChange={(value) => {
                          setTempSelectedFilterId([]);
                          setTempSelectedCriteria(value);
                        }}
                      />
                    </div>
                    <div>
                      <AppCheckPicker
                        size={'md'}
                        placeholder="선택 없음"
                        cleanable={false}
                        searchable={false}
                        style={{ width: '265px', marginRight: '10px' }}
                        value={tempSelectedFilterId}
                        onChange={(value: any) => {
                          if (value.length > 10) {
                            return;
                          }
                          setTempSelectedFilterId(value);
                        }}
                        data={fetchMetaData ? _get(fetchMetaData.data, tempSelectedCriteria) : []}
                      />
                    </div>
                  </>
                )}
                <div>
                  <AppSelectPicker
                    size={'md'}
                    placeholder="선택 없음"
                    cleanable={false}
                    searchable={false}
                    style={{ width: '150px', marginRight: '10px' }}
                    defaultValue={tempSelectedMetric}
                    data={[
                      { label: 'Impression', value: 'impressions' },
                      { label: 'Click', value: 'clicks' },
                      { label: 'Install', value: 'installs' },
                      { label: 'Spend', value: 'spend' },
                    ]}
                    onChange={(value: any) => setTempSelectedMetric(value)}
                  />
                </div>
                <div>
                  <AppButton size={'md'} onClick={setSelectedData} style={{ padding: '0 12px' }}>
                    적용
                  </AppButton>
                </div>
              </>
            )}
          </div>
          <div>{dateRange}</div>
        </div>

        <AppDivider style={{ margin: '14px 0' }} />
        {!isOverLimit ? (
          <>
            {fetchGraphData.isFetching && (
              <div
                style={{
                  width: '100%',
                  height: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Loader />
              </div>
            )}
            {!fetchGraphData.isFetching && (
              <>
                {fetchGraphData.data?.data?.legends.length ? (
                  <AppGraph data={fetchGraphData.data.data} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '350px' }}>
                    데이터가 없습니다.
                  </div>
                )}
              </>
            )}
            {fetchGraphData.isError && (
              <div
                style={{
                  display: 'flex',
                  height: '350px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 10,
                }}
              >
                데이터 용량 초과로 차트를 조회할 수 없습니다.
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              height: '350px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            데이터 용량 초과로 차트를 조회할 수 없습니다.
          </div>
        )}
        <AppDivider style={{ margin: '14px 0' }} />

        <TableNoticeBox>
          <div style={{ display: 'flex' }}>
            <TitleBox>조회 결과</TitleBox>
            {isOverLimit && (
              <div style={{ color: '#ff7c2d' }}>
                데이터 용량 초과로 일부분만 조회됩니다. 전체 데이터는 엑셀 다운로드로 확인하세요.
              </div>
            )}
          </div>
          <div>
            <a href={`${WISEBIRDS_API}/v1/reports/${reportId}/download`}>
              <AppButton
                type={'button'}
                size={'md'}
                theme={'white_gray'}
                style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}
              >
                <div style={{ marginRight: '8px' }}>
                  <img src={Download} alt="download" style={{ width: 12, height: 12 }} />
                </div>
                <div>다운로드</div>
              </AppButton>
            </a>
          </div>
        </TableNoticeBox>
        <AppTable
          style={{ marginTop: -2 }}
          data={fetchReportData?.data}
          className={'asset-table'}
          height={270}
          loading={fetchReportData.isLoading}
        >
          <Column width={85}>
            <HeaderCell>Date</HeaderCell>
            <ViewEllipsis dataKey={'date'} />
          </Column>
          {isVisibleApp && (
            <>
              <Column resizable width={130}>
                <HeaderCell>App</HeaderCell>
                <ViewEllipsis dataKey={'app'} />
              </Column>
              <Column resizable width={130}>
                <HeaderCell>App ID</HeaderCell>
                <ViewEllipsis dataKey={'appId'} />
              </Column>
              <Column resizable width={80}>
                <HeaderCell>OS</HeaderCell>
                <ViewEllipsis dataKey={'appOS'} />
              </Column>
            </>
          )}
          {isVisibleCampaign && (
            <>
              <Column resizable width={130}>
                <HeaderCell>Campaign</HeaderCell>
                <ViewEllipsis dataKey={'campaign'} />
              </Column>
              <Column resizable width={130}>
                <HeaderCell>Campaign ID</HeaderCell>
                <ViewEllipsis dataKey={'campaignId'} />
              </Column>
              <Column resizable width={80}>
                <HeaderCell>Country</HeaderCell>
                <ViewEllipsis dataKey={'campaignCountry'} />
              </Column>
            </>
          )}
          {isVisibleAdGroup && (
            <>
              <Column resizable width={130}>
                <HeaderCell>AdGroup</HeaderCell>
                <ViewEllipsis dataKey={'adGroup'} />
              </Column>
              <Column resizable width={130}>
                <HeaderCell>AdGroup ID</HeaderCell>
                <ViewEllipsis dataKey={'adGroupId'} />
              </Column>
            </>
          )}
          {isVisibleCreativeGroup && (
            <>
              <Column resizable width={130}>
                <HeaderCell>CreativeGroup</HeaderCell>
                <ViewEllipsis dataKey={'creativeGroup'} />
              </Column>
              <Column resizable width={130}>
                <HeaderCell>CreativeGroup ID</HeaderCell>
                <ViewEllipsis dataKey={'creativeGroupId'} />
              </Column>
            </>
          )}
          {isVisibleCreative && (
            <>
              <Column resizable width={130}>
                <HeaderCell>Creative</HeaderCell>
                <ViewEllipsis dataKey={'creative'} />
              </Column>
              <Column resizable width={130}>
                <HeaderCell>Creative ID</HeaderCell>
                <ViewEllipsis dataKey={'creativeId'} />
              </Column>
              <Column resizable width={100}>
                <HeaderCell>Creative Type</HeaderCell>
                <ViewEllipsis dataKey={'creativeType'} />
              </Column>
            </>
          )}
          {isVisibleExchangeId && (
            <>
              <Column resizable width={100}>
                <HeaderCell>Exchange</HeaderCell>
                <ViewEllipsis dataKey={'exchangeId'} />
              </Column>
            </>
          )}
          {isVisibleSubPulisherId && (
            <>
              <Column resizable width={130}>
                <HeaderCell>Sub_Publisher</HeaderCell>
                <ViewEllipsis dataKey={'subPublisher'} />
              </Column>
              <Column resizable width={130}>
                <HeaderCell>Sub_Publisher ID</HeaderCell>
                <ViewEllipsis dataKey={'subPublisherId'} />
              </Column>
            </>
          )}
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>Impression</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'impression'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>Click</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'click'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>Install</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'install'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>Spend</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'spend'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>CTR</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'ctr'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>IPM</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'ipm'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>CPC</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'cpc'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>CPI</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'cpi'} />
          </Column>
          <Column flexGrow={1} minWidth={100}>
            <HeaderCell align={'right'}>Currency</HeaderCell>
            <ViewEllipsis align={'right'} dataKey={'currency'} />
          </Column>
        </AppTable>
      </div>
    </>
  );
};

export default ReportDetail;
