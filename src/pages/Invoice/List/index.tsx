import React, { useState } from 'react';
import AppPagination from '@components/AppPagination';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppDatePicker from '@components/AppDatePicker';
import dayjs from 'dayjs';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import { useQuery } from '@tanstack/react-query';
import Download from '@assets/images/icons/download/download-big.svg';
import { getInvoiceExcel, getInvoiceList } from '@apis/invoice.api';
import AppTable from '@components/AppTable/Table';
import numberWithCommas from '@utils/common';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface InvoiceListProps {}

const ENV = import.meta.env;
const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;

const InvoiceList: React.FC<InvoiceListProps> = () => {
  const [scheduleStartDate, setScheduleStartDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());
  const [scheduleEndDate, setScheduleEndDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());

  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);

  const [tmpScheduleStartDate, setTmpScheduleStartDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());
  const [tmpScheduleEndDate, setTmpScheduleEndDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());

  const [invoiceList, setInvoiceList] = useState<any>([]);

  const navigate = useNavigate();

  const setSelectedData = () => {
    setPageNum(1);
    setScheduleStartDate(tmpScheduleStartDate);
    setScheduleEndDate(tmpScheduleEndDate);
  };

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const fetchSalesExcel = () => {
    const params = {
      start_month: dayjs(scheduleStartDate).format('YYYY-MM'),
      end_month: dayjs(scheduleEndDate).format('YYYY-MM'),
      status: 'CONFIRM',
    };
    let searchParams = '&search_type=AD_ACCOUNT_ID&search_keyword=' + localStorage.getItem('selectedAdAccount');
    const sortParams = {
      sortType: selectedSort,
      direction: sortDirection,
    };
    getInvoiceExcel(params, searchParams, sortParams).then((res: any) => {
      const { data } = res;
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([data], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `정산_${dayjs(scheduleStartDate).format('YYYYMMDD')}_${dayjs(scheduleEndDate).format(
        'YYYYMMDD'
      )}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };

  const SortHeader: React.FC<any> = ({ align, title, sortName, ...props }) => {
    return (
      <AppTable.HeaderCell align={align} {...props}>
        <div style={{ display: 'inline-flex' }}>
          <div>{title}</div>
          {selectedSort !== sortName ? (
            <div
              style={{ cursor: 'pointer', width: '20px', textAlign: 'center' }}
              onClick={() => changeSort(sortName, 'asc')}
            >
              ↕
            </div>
          ) : sortDirection === 'desc' ? (
            <div
              style={{ cursor: 'pointer', width: '20px', textAlign: 'center' }}
              onClick={() => changeSort(sortName, 'asc')}
            >
              &darr;
            </div>
          ) : (
            <div
              style={{ cursor: 'pointer', width: '20px', textAlign: 'center' }}
              onClick={() => changeSort(sortName, 'desc')}
            >
              &uarr;
            </div>
          )}
        </div>
      </AppTable.HeaderCell>
    );
  };

  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>보기</AppTypography.Link>
      </AppTable.Cell>
    );
  };

  const goDetail = (id: any) => {
    navigate(`/invoice/detail/${id}`);
  };

  const fetchInvoiceList = useQuery(
    ['fetchInvoiceList', scheduleStartDate, scheduleEndDate, pageNum, pageSize],
    async () => {
      const params = {
        start_month: dayjs(scheduleStartDate).format('YYYY-MM'),
        end_month: dayjs(scheduleEndDate).format('YYYY-MM'),
        status: 'CONFIRM',
      };
      let searchParams = '&search_type=AD_ACCOUNT_ID&search_keyword=' + localStorage.getItem('selectedAdAccount');
      const sortParams = {
        sortType: selectedSort,
        direction: sortDirection,
      };
      const { data } = await getInvoiceList(params, searchParams, sortParams, pageNum, pageSize);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            id: item.id || '-',
            status: item.status || '-',
            payment_month: item.payment_month || '-',
            advertiser_type: item.advertiser_type || '-',
            advertiser_id: item.advertiser_id || '-',
            advertiser_name: item.advertiser_name || '-',
            ad_account_name: item.ad_account_name || '-',
            time_zone: item.time_zone || '-',
            currency: item.currency || '-',
            total_coupon: item.total_coupon || '-',
            total_spend: item.total_spend || '-',
            total_fixes: item.total_fixes || '-',
            fixed_at: item.fixed_at || '-',
            fixed_by: item.fixed_by || '-',
            time_zone_detail: item.time_zone_detail || '-',
            invoice_value: item.invoice_value || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setInvoiceList(data);
      },
    }
  );

  return (
    <>
      <div>
        <AppPageHeader title={'정산내역'} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 30,
            paddingRight: 30,
            borderBottom: '1px solid var(--guide-line)',
            paddingBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AppDatePicker
              value={tmpScheduleStartDate}
              onChange={(value) => setTmpScheduleStartDate(value)}
              style={{ width: 200 }}
              format={'yyyy-MM'}
              cleanable={false}
              disabledDate={(date) =>
                dayjs(date).isAfter(dayjs().add(-1, 'month')) || dayjs(date).isAfter(tmpScheduleEndDate)
              }
            />
            <AppTypography.Text style={{ margin: '0 10px' }}>~</AppTypography.Text>
            <AppDatePicker
              value={tmpScheduleEndDate}
              onChange={(value) => setTmpScheduleEndDate(value)}
              style={{ width: 200 }}
              format={'yyyy-MM'}
              cleanable={false}
              disabledDate={(date) =>
                dayjs(date).isAfter(dayjs().add(-1, 'month')) || dayjs(date).isBefore(tmpScheduleStartDate)
              }
            />
          </div>
          <div>
            <AppButton
              size={'md'}
              theme={'gray'}
              type={'submit'}
              onClick={setSelectedData}
              style={{ padding: '0 30px', marginLeft: '10px' }}
            >
              조회
            </AppButton>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '14px',
            padding: '0 30px 14px',
          }}
        >
          <div>
            <AppButton
              type={'button'}
              size={'md'}
              theme={'white_gray'}
              style={{ marginLeft: '10px', padding: '0 16px', display: 'flex', alignItems: 'center' }}
              href={`${WISEBIRDS_API}/v1/invoices/excel?end_month=${dayjs(scheduleEndDate).format(
                'YYYY-MM'
              )}&start_month=${dayjs(scheduleStartDate).format(
                'YYYY-MM'
              )}&status=CONFIRM&sort=createdAt,desc&search_type=AD_ACCOUNT_ID&search_keyword=${localStorage.getItem(
                'selectedAdAccount'
              )}`}
            >
              <div style={{ marginRight: '8px' }}>
                <img src={Download} alt="download" style={{ width: 12, height: 12 }} />
              </div>
              <div>엑셀 다운로드</div>
            </AppButton>
          </div>
        </div>
        {/*<StyledDivider />*/}
        <AppTable data={invoiceList} className={'asset-table'} height={500}>
          <AppTable.Column width={100}>
            <SortHeader align={'left'} title={'정산월'} sortName={'paymentMonth'} style={{ paddingLeft: 30 }} />
            <AppTable.Cell align={'left'} dataKey={'payment_month'} style={{ paddingLeft: 30 }} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell align={'right'}>총 광고비</AppTable.HeaderCell>
            <AppTable.Cell align={'right'} dataKey={'total_spend'}>
              {(rowData: any) => {
                return <>{numberWithCommas(rowData.total_spend)}</>;
              }}
            </AppTable.Cell>
          </AppTable.Column>
          {/*<AppTable.Column flexGrow={1}>*/}
          {/*  <AppTable.HeaderCell align={'right'}>쿠폰 금액</AppTable.HeaderCell>*/}
          {/*  <AppTable.Cell align={'right'} dataKey={'total_coupon'} />*/}
          {/*</AppTable.Column>*/}
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell align={'right'}>기타 조정 금액</AppTable.HeaderCell>
            <AppTable.Cell align={'right'} dataKey={'total_fixes'}>
              {(rowData: any) => {
                return <>{numberWithCommas(rowData.total_fixes)}</>;
              }}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell align={'right'}>실제 정산 금액(세금계산서 발행 금액)</AppTable.HeaderCell>
            <AppTable.Cell align={'right'} dataKey={'invoice_value'}>
              {(rowData: any) => {
                return <>{numberWithCommas(rowData.invoice_value)}</>;
              }}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={100}>
            <AppTable.HeaderCell align={'center'} style={{ paddingRight: 30 }}>
              상세내역
            </AppTable.HeaderCell>
            <ViewCell align={'center'} style={{ paddingRight: 30 }} />
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
              total={totalNum}
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
    </>
  );
};

export default InvoiceList;
