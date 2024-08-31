import React, { useState } from 'react';
import { Checkbox } from 'rsuite';
import AppPagination from '@components/AppPagination';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppDatePicker from '@components/AppDatePicker';
import dayjs from 'dayjs';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import { useQuery } from '@tanstack/react-query';
import Download from '@assets/images/icons/download/download-big.svg';
import { getInvoiceExcel, getInvoiceList, updateInvoiceList } from '@apis/invoice.api';
import AppTable from '@components/AppTable/Table';
import numberWithCommas from '@utils/common';
import TextCell from '@components/Common/TextCell';
import _ from 'lodash';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';
import EllipsisPopup from '@components/EllipsisPopup';

interface adminInvoiceListProps {}

const ENV = import.meta.env;
const WISEBIRDS_API = ENV.VITE_PROXY === 'true' ? '/WB_API' : ENV.VITE_WISEBIRDS_API;

const AdminInvoiceList: React.FC<adminInvoiceListProps> = () => {
  const [scheduleStartDate, setScheduleStartDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());
  const [scheduleEndDate, setScheduleEndDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());
  const [selectedStatus, setSelectedStatus] = useState<any>([]);

  const [searchType, setSearchType] = useState('ADVERTISER');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);

  const [tmpScheduleStartDate, setTmpScheduleStartDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());
  const [tmpScheduleEndDate, setTmpScheduleEndDate] = useState<Date | null>(dayjs().add(-1, 'month').toDate());
  const [tmpSelectedStatus, setTmpSelectedStatus] = useState<any>([]);
  const [tmpSearchKeyword, setTmpSearchKeyword] = useState('');

  const [checkedKeys, setCheckedKeys] = useState<any>([]);

  const [invoiceList, setInvoiceList] = useState<any>([]);

  const [excelSearchParams, setExcelSearchParams] = useState('');

  const navigate = useNavigate();

  const setSelectedData = () => {
    setPageNum(1);
    setScheduleStartDate(tmpScheduleStartDate);
    setScheduleEndDate(tmpScheduleEndDate);
    setSelectedStatus(tmpSelectedStatus);
  };

  const setSearchedData = () => {
    setPageNum(1);
    setSearchKeyword(tmpSearchKeyword);
  };

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  let checked = false;

  if (checkedKeys.length === invoiceList.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  }

  const handleCheckAll = (value: any, checked: any) => {
    const keys = checked ? invoiceList.map((item: any) => item.id) : [];
    setCheckedKeys(keys);
  };
  const handleCheck = (value: any, checked: any) => {
    const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item: any) => item !== value);
    setCheckedKeys(keys);
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

  const CheckCell: React.FC<any> = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <Checkbox
          style={{ marginTop: '-7px' }}
          value={rowData[dataKey]}
          onChange={onChange}
          checked={checkedKeys.some((item: any) => item === rowData[dataKey])}
          disabled={rowData.status === '정산 확정'}
        />
      </AppTable.Cell>
    );
  };

  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <EllipsisPopup
          text={
            <AppTypography.Link onClick={() => goDetail(rowData['id'], rowData['status'])}>
              {rowData.ad_account_name}
            </AppTypography.Link>
          }
        />
      </AppTable.Cell>
    );
  };

  const goDetail = (id: any, status: any) => {
    if (status === '정산 대기' || status === '정산 검토중') {
      navigate(`/admin/invoice/update/${id}`);
    } else {
      navigate(`/admin/invoice/detail/${id}`);
    }
  };

  const ValueCell: React.FC<any> = ({ dataKey, rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <div>{numberWithCommas(rowData[dataKey])}</div>
      </AppTable.Cell>
    );
  };

  const fetchInvoiceList = useQuery(
    ['fetchInvoiceList', scheduleStartDate, scheduleEndDate, selectedStatus, searchKeyword, pageNum, pageSize],
    async () => {
      const params = {
        start_month: dayjs(scheduleStartDate).format('YYYY-MM'),
        end_month: dayjs(scheduleEndDate).format('YYYY-MM'),
        status: selectedStatus,
      };
      let searchParams = '';
      if (searchKeyword !== '') {
        searchParams = '&search_type=' + searchType + '&search_keyword=' + searchKeyword;
        setExcelSearchParams(searchParams);
      }
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
            total_spend: item.total_spend || '-',
            total_coupon: item.total_coupon || '-',
            total_fixes: item.total_fixes || '-',
            fixed_at: item.fixed_at ? dayjs(item.fixed_at).format('YYYY-MM-DD HH:mm:ss') : '-',
            fixed_by: item.fixed_by || '-',
            time_zone_detail: item.time_zone_detail || '-',
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

  const fetchSalesExcel = () => {
    const params = {
      start_month: dayjs(scheduleStartDate).format('YYYY-MM'),
      end_month: dayjs(scheduleEndDate).format('YYYY-MM'),
      status: selectedStatus,
    };
    let searchParams = '';
    if (searchKeyword !== '') {
      searchParams = '&search_type=' + searchType + '&search_keyword=' + searchKeyword;
    }
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
      a.download = `정산내역_${dayjs(scheduleStartDate).format('YYYYMMDD')}-${dayjs(scheduleEndDate).format(
        'YYYYMMDD'
      )}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const fetchInvoiceStatus = () => {
    const params = {
      ids: checkedKeys.join(','),
    };
    if (confirm('선택한 정산내역을 확정하시겠습니까? 확정 이후에는 취소할 수 없습니다.')) {
      updateInvoiceList(params)
        .then((res: any) => {
          location.reload();
        })
        .catch((err: any) => {
          if (err.response.status == 400) {
            alert(err.response.data.message);
          }
        });
    }
  };

  return (
    <div>
      <AppPageHeader title={'정산 관리'} />
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
          <AppCheckPicker
            placeholder={'상태: 전체'}
            size={'md'}
            cleanable={false}
            searchable={false}
            style={{ width: '150px', marginLeft: '10px', marginRight: '10px' }}
            data={[
              { label: '정산 대기', value: 'WAITING' },
              { label: '정산 검토중', value: 'REVIEW' },
              { label: '정산 확정', value: 'CONFIRM' },
            ]}
            value={tmpSelectedStatus}
            onChange={(value: any) => {
              setTmpSelectedStatus(value);
            }}
            renderValue={(value, item: any) => {
              return (
                <span>
                  <span style={{ marginRight: 5 }}>상태:</span>
                  {value.length === 3
                    ? '전체'
                    : _.find(item, (obj) => {
                        return obj.value === value[0];
                      }).label}
                </span>
              );
            }}
          />
        </div>
        <div>
          <AppButton size={'md'} theme={'gray'} type={'submit'} onClick={setSelectedData} style={{ padding: '0 30px' }}>
            조회
          </AppButton>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 14,
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        <div>
          <AppButton
            size={'md'}
            theme={'red'}
            type={'submit'}
            onClick={fetchInvoiceStatus}
            style={{ padding: '0 30px' }}
            disabled={checkedKeys.length < 1}
          >
            정산 확정
          </AppButton>
        </div>
        <div style={{ display: 'flex' }}>
          <Search
            data={[
              { label: '광고주명', value: 'ADVERTISER' },
              { label: '광고계정명', value: 'AD_ACCOUNT' },
            ]}
            searchKey={searchType}
            onSearchKeyChange={(value) => setSearchType(value)}
            searchValue={tmpSearchKeyword}
            onSearchValueChange={setTmpSearchKeyword}
            onSearch={setSearchedData}
          />
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
              )}&status=${selectedStatus}${excelSearchParams}&sort=createdAt,desc`}
            >
              <div style={{ marginRight: '8px' }}>
                <img src={Download} alt="download" style={{ width: 12, height: 12 }} />
              </div>
              <div>엑셀 다운로드</div>
            </AppButton>
          </div>
        </div>
      </div>
      <AppTable
        data={invoiceList}
        className={'asset-table'}
        height={500}
        style={{ marginTop: 14 }}
        loading={fetchInvoiceList.isFetching}
      >
        <AppTable.Column width={70}>
          <AppTable.HeaderCell align={'left'} style={{ paddingLeft: 20 }}>
            <Checkbox checked={checked} onChange={handleCheckAll} style={{ marginTop: '-7px' }} />
          </AppTable.HeaderCell>
          <CheckCell
            align={'left'}
            dataKey={'id'}
            style={{ paddingLeft: 20 }}
            checkedKeys={checkedKeys}
            onChange={handleCheck}
          />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <SortHeader title={'상태'} sortName={'status'} />
          <AppTable.Cell dataKey={'status'} />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <SortHeader title={'정산월'} sortName={'paymentMonth'} />
          <AppTable.Cell dataKey={'payment_month'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'광고주명'} sortName={'advertiser.advertiserName'} />
          <TextCell dataKey={'advertiser_name'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'광고계정명'} sortName={'adAccount.name'} />
          <ViewCell />
        </AppTable.Column>
        <AppTable.Column width={150}>
          <SortHeader title={'시간대'} sortName={'adAccount.timeZone'} />
          <ValueCell dataKey={'time_zone_detail'} />
        </AppTable.Column>
        <AppTable.Column width={60}>
          <SortHeader title={'통화'} sortName={'adAccount.currency'} />
          <AppTable.Cell dataKey={'currency'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1} align={'right'}>
          <AppTable.HeaderCell>총 광고비</AppTable.HeaderCell>
          <AppTable.Cell>
            {(rowData) => {
              const value = rowData['total_spend'];

              if (value === '-') {
                return value;
              } else {
                return `${numberWithCommas(_.ceil(value))}`;
              }
            }}
          </AppTable.Cell>
        </AppTable.Column>
        {/*<Column flexGrow={1}>*/}
        {/*  <HeaderCell align={'right'}>쿠폰 금액</HeaderCell>*/}
        {/*  <Cell align={'right'} dataKey={'total_coupon'} />*/}
        {/*</Column>*/}
        <AppTable.Column flexGrow={1} align={'right'}>
          <AppTable.HeaderCell>기타 조정 금액</AppTable.HeaderCell>
          <AppTable.Cell>
            {(rowData) => {
              const value = rowData['total_fixes'];

              if (value === '-') {
                return value;
              } else {
                return `${numberWithCommas(_.ceil(value))}`;
              }
            }}
          </AppTable.Cell>
          {/*<SpendCell dataKey={'total_fixes'} currencyKey={'currency'} />*/}
          {/*<AppTable.Cell align={'right'} dataKey={'total_fixes'} />*/}
        </AppTable.Column>
        <AppTable.Column flexGrow={1} align={'right'}>
          <AppTable.HeaderCell>실제 정산 금액(세금계산서 발행 금액)</AppTable.HeaderCell>
          <AppTable.Cell>
            {(rowData) => {
              const value = rowData['invoice_value'];

              if (value === '-') {
                return value;
              } else {
                return `${numberWithCommas(_.ceil(value))}`;
              }
            }}
          </AppTable.Cell>
        </AppTable.Column>
        <AppTable.Column width={150}>
          <SortHeader align={'left'} title={'정산 확정일시'} sortName={'fixedAt'} />
          <AppTable.Cell align={'left'} dataKey={'fixed_at'} />
        </AppTable.Column>
        <AppTable.Column width={150}>
          <AppTable.HeaderCell align={'left'}>정산 확정자</AppTable.HeaderCell>
          <AppTable.Cell align={'left'} dataKey={'fixed_by'} />
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
  );
};

export default AdminInvoiceList;
