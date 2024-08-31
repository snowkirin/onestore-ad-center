import React, { useState } from 'react';
import AppDivider from '@components/AppDivider';
import AppTable from '@components/AppTable/Table';
import AppPagination from '@components/AppPagination';
import dayjs from 'dayjs';
import { AppButton } from '@components/AppButton';
import Download from '@assets/images/icons/download/download-big.svg';
import { getAdAccountList } from '@apis/ad_account.api';
import { useQuery } from '@tanstack/react-query';
import { getAdvertiserList } from '@apis/account.api';
import { getComparatorsString } from '@utils/filter/dynamicFilter';
import {
  getCampaignStatics,
  getCampaignStaticsExcel,
  getCampaignStaticsGraph,
  getCSQuestions,
} from '@apis/dashboard.api';
import _ from 'lodash';
import AppGraph from '@components/AppGraph';
import { Spinner } from '@rsuite/icons/lib/icons/legacy';
import numberWithCommas from '@utils/common';
import AppDateRangePicker from '@components/AppDateRangePicker';
import { useNavigate } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import { ConfirmModal } from '@components/AppModal';
import { StyledDashboardWrapper } from '@pages/Admin/Dashboard/StyledComponent';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

const ENV = import.meta.env;
const ADCENTER_URL = ENV.VITE_ADCENTER_URL;

interface DashboardProps {}
const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<any>([dayjs().subtract(31, 'days').toDate(), dayjs().subtract(1, 'days').toDate()]);
  const [advertiserTotalNum, setAdvertiserTotalNum] = useState(0);
  const [accountsTotalNum, setAccountsTotalNum] = useState(0);
  // 광고 계정 페이징
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [id, setId] = useState('');
  const [open, setOpen] = React.useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  // 테이블 페이징
  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const fetchDownloadExcel = () => {
    const params = {
      start_date: dayjs(date[0]).format('YYYY-MM-DD'),
      end_date: dayjs(date[1]).format('YYYY-MM-DD'),
    };
    getCampaignStaticsExcel(params).then((res: any) => {
      const { data } = res;
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([data], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `dashboard_sales report_${dayjs(date[0]).format('YYYYMMDD')}-${dayjs(date[1]).format(
        'YYYYMMDD'
      )}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const fetchCampaignStaticsGraph = useQuery(
    ['fetchCampaignStaticsGraph', date],
    async () => {
      const campaignGraph = await getCampaignStaticsGraph({
        start_date: dayjs(date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(date[1]).format('YYYY-MM-DD'),
      });
      campaignGraph.data.series[1] = { yAxisIndex: 1, ...campaignGraph.data.series[1] };
      return campaignGraph;
    },
    {
      enabled: !_.isEmpty(date),
    }
  );

  const fetchCampaignStatics = useQuery(
    ['fetchCampaignStatics', date],
    async () => {
      const result = await getCampaignStatics({
        start_date: dayjs(date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(date[1]).format('YYYY-MM-DD'),
      });
      if (result.status === 200) {
        return result.data[0];
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(date),
    }
  );

  const fetchCSQuestions = useQuery(['fetchCSQuestions'], async () => {
    const result = await getCSQuestions();
    if (result.status === 200) {
      return result.data;
    } else {
      return [];
    }
  });

  const fetchAccountsData = useQuery(['fetchAccountsData'], async () => {
    const pageParams = {
      page: 1,
      size: 1000,
    };
    const sortParams = {
      sortType: 'createdAt',
      direction: 'desc',
    };
    const result = await getAdAccountList('', pageParams, sortParams);
    if (result.status === 200) {
      setAccountsTotalNum(result.data.total_elements);
      return result.data.content;
    } else {
      return [];
    }
  });

  const fetchAdvertiserList = useQuery(['fetchAdvertiserList'], async () => {
    const pageParams = {
      page: 1,
      size: 1000,
    };
    const sortParams = {
      sortType: 'createdAt',
      direction: 'desc',
    };
    const result = await getAdvertiserList(
      encodeURIComponent(getComparatorsString('in', 'reviewStatus', ['WAITING'])),
      pageParams,
      sortParams
    );
    if (result.status === 200) {
      setAdvertiserTotalNum(result.data.total_elements);
      return result.data.content.map((item: any) => {
        return {
          ...item,
          created_at: item.created_at || '-',
          type: item.type || '-',
          name: item.name || '-',
          identity_number: item.identity_number || '-',
        };
      });
    } else {
      return [];
    }
  });

  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>{rowData.name}</AppTypography.Link>
      </AppTable.Cell>
    );
  };

  const goDetail = (id: any) => {
    setId(id);
    handleModalOpen();
  };

  const goCenter = () => {
    window.open(`${ADCENTER_URL}/campaigns/bridge?id=${id}`, '_blank');
    navigate('/');
  };

  return (
    <StyledDashboardWrapper>
      <div className={'header'}>
        <AppTypography.Headline>대시보드</AppTypography.Headline>
        <div className={'header__download'}>
          <AppTypography.SubTitle level={2} style={{ lineHeight: '32px' }}>
            매출 현황
          </AppTypography.SubTitle>
          <div className={'btn__wrapper'}>
            <AppButton
              type={'button'}
              size={'md'}
              theme={'white_gray'}
              style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}
              onClick={() => fetchDownloadExcel()}
            >
              <div style={{ marginRight: '8px' }}>
                <img src={Download} alt="download" style={{ width: 12, height: 12 }} />
              </div>
              <div>다운로드</div>
            </AppButton>
            <AppDateRangePicker
              style={{ width: '230px', marginLeft: '10px' }}
              placement={'leftStart'}
              value={date}
              onChange={setDate}
              cleanable={false}
              disabledDate={(date) => dayjs(date).isBefore(dayjs().subtract(181, 'day'))}
            />
          </div>
        </div>
      </div>

      {/* 완료 */}
      <div className={'dashboard__inner'}>
        <div className={'sales-summary'}>
          <div className={'sales-summary__item'}>
            <div className={'sales-summary__header'}>Impression</div>
            <div className={'sales-summary__body'}>{numberWithCommas(fetchCampaignStatics.data?.impression)}</div>
          </div>
          <div className={'sales-summary__item'}>
            <div className={'sales-summary__header'}>Click</div>
            <div className={'sales-summary__body'}>{numberWithCommas(fetchCampaignStatics.data?.click)}</div>
          </div>
          <div className={'sales-summary__item'}>
            <div className={'sales-summary__header'}>Install</div>
            <div className={'sales-summary__body'}>{numberWithCommas(fetchCampaignStatics.data?.install)}</div>
          </div>
          <div className={'sales-summary__item'}>
            <div className={'sales-summary__header'}>Spend</div>
            <div className={'sales-summary__body'}>{numberWithCommas(fetchCampaignStatics.data?.spend)}</div>
          </div>
        </div>
        {fetchCampaignStaticsGraph.isLoading ? (
          <Spinner />
        ) : (
          <AppGraph data={fetchCampaignStaticsGraph.data?.data} colors={['#e15656', '#267c97']} />
        )}
      </div>
      <AppDivider />

      {/* 시작 */}
      <div className={'dashboard__inner'}>
        <AppTypography.SubTitle level={2}>CS 문의 현황</AppTypography.SubTitle>
        <div className={'cs-summary'}>
          <div className={'cs-summary__item'}>
            <div className={'cs-summary__title'}>지난 7일 문의</div>
            <div className={'cs-summary__count'}>{fetchCSQuestions.data?.weekly}</div>
            <div className={'cs-summary__unit'}>건</div>
          </div>
          <div className={'cs-summary__item'}>
            <div className={'cs-summary__title'}>오늘 문의</div>
            <div className={'cs-summary__count'}>{fetchCSQuestions.data?.today}</div>
            <div className={'cs-summary__unit'}>건</div>
          </div>
          <div className={'cs-summary__item'}>
            <div className={'cs-summary__title'}>문의 답변대기</div>
            <div className={'cs-summary__count'}>{fetchCSQuestions.data?.waiting}</div>
            <div className={'cs-summary__unit'}>건</div>
          </div>
        </div>
      </div>
      <AppDivider />

      {/* 시작 */}
      <div className={'dashboard__inner'}>
        <AppTypography.SubTitle level={2}>
          광고계정 현황 <span className={'text--point'}>{accountsTotalNum}</span> 개
        </AppTypography.SubTitle>
        <AppTable data={fetchAccountsData.data} height={270} style={{ marginTop: '27px' }}>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>광고주명</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'advertiser_name'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>광고계정 ID</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'id'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>광고계정명</AppTable.HeaderCell>
            <ViewCell dataKey={'name'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>생성일시 &darr; </AppTable.HeaderCell>
            <AppTable.Cell dataKey={'created_at'} />
          </AppTable.Column>
        </AppTable>
        <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <AppPagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              maxButtons={5}
              size="md"
              total={accountsTotalNum}
              limit={pageSize}
              activePage={pageNum}
              onChangePage={setPageNum}
              onChangeLimit={handleChangeLimit}
            />
          </div>
          <div style={{ marginRight: '10px' }}>표시할 행 수</div>
          <div>
            <AppRowsPicker
              placement={'topStart'}
              value={pageSize}
              onChange={(value: any) => handleChangeLimit(value)}
              cleanable={false}
              searchable={false}
              data={[10, 25, 50, 75, 100].map((key) => ({ value: key, label: key }))}
              style={{ width: 70 }}
            />
          </div>
        </div>
      </div>
      <AppDivider />

      {/* 시작 */}
      <div className={'dashboard__inner'}>
        <AppTypography.SubTitle level={2}>
          회원가입 신청 현황 (검수대기){' '}
          <span
            className={'text--point'}
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(`/admin/account/advertiser?status=WAITING`, '_blank')}
          >
            {advertiserTotalNum}
          </span>{' '}
          개
        </AppTypography.SubTitle>
        <AppTable data={fetchAdvertiserList.data} height={270} style={{ marginTop: '27px' }}>
          <AppTable.Column width={150}>
            <AppTable.HeaderCell>가입 신청 일시 &darr;</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'created_at'} />
          </AppTable.Column>
          <AppTable.Column width={150}>
            <AppTable.HeaderCell>광고주 유형</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'type'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>광고주명</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'name'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>사업자등록번호/생년월일</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'identity_number'} />
          </AppTable.Column>
        </AppTable>
      </div>

      <ConfirmModal
        open={open}
        onClose={handleModalClose}
        title={'광고센터로 전환'}
        onOk={goCenter}
        okText={'확인'}
        content={
          <>
            광고센터로 전환하면 어드민에서 로그아웃됩니다.
            <br />
            광고센터로 전환하시겠습니까?
          </>
        }
      />
    </StyledDashboardWrapper>
  );
};

export default Dashboard;
