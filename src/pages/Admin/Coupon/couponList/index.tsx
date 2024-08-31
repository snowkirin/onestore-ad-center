import React, { useState, useEffect } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { AppInput, AppInputGroup } from '@components/AppInput';
import search from '@assets/images/icons/search/search-small.svg';
import { useQuery } from '@tanstack/react-query';
import { getCouponExcel, getCouponHistory, getCouponList } from '@apis/coupon.api';
import { DateRangePicker, Pagination, SelectPicker, Table, useToaster } from 'rsuite';
import AppPagination from '@components/AppPagination';
import { AppButton } from '@components/AppButton';
import AppMultiplePicker from '@components/AppPicker/AppMultiplePicker';
import Download from '@assets/images/icons/download/download-big.svg';
import queryString from 'query-string';
import dayjs from 'dayjs';
import AppModal from '@components/AppModal/Modal';
import numberWithCommas from '@utils/common';
import AppTable from '@components/AppTable';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppTypography from '@components/AppTypography';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface CouponListProps {}

const { Column, HeaderCell, Cell } = Table;

const { allowedMaxDays } = DateRangePicker;

const AdminCouponList: React.FC<CouponListProps> = () => {
  const URLParams = queryString.parse(location.search);

  const [searchType, setSearchType] = useState('ADVERTISER');
  const [tmpSearchText, setTmpSearchText] = useState<any>('');
  const [searchText, setSearchText] = useState<any>('');
  const [couponList, setCouponList] = useState([]);

  const [tmpSelectedDateType, setTmpSelectedDateType] = useState<any>('CREATED_AT');
  const [tmpDate, setTmpDate] = useState<any>([
    dayjs().subtract(29, 'days').toDate(),
    dayjs().subtract(0, 'days').toDate(),
  ]);
  const [tmpSelectedStatus, setTmpSelectedStatus] = useState<any>([]);

  const [selectedDateType, setSelectedDateType] = useState<any>('CREATED_AT');
  const [date, setDate] = useState<any>([dayjs().subtract(29, 'days').toDate(), dayjs().subtract(0, 'days').toDate()]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);

  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);
  const [historyPageNum, setHistoryPageNum] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(25);
  const [historyTotalNum, setHistoryTotalNum] = useState(0);

  const [open, setOpen] = useState(false);
  const [historyList, setHistoryList] = useState<any>([]);

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const handleHistoryChangeLimit = (dataKey: any) => {
    setHistoryPageSize(dataKey);
    setHistoryPageNum(1);
  };

  const getSearchData = () => {
    setSearchText(tmpSearchText);
  };

  const SortHeader: React.FC<any> = ({ title, sortName, ...props }) => {
    return (
      <HeaderCell align={'center'} {...props}>
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
      </HeaderCell>
    );
  };

  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <Cell {...props}>
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>
          {numberWithCommas(rowData.spend)}
        </AppTypography.Link>
      </Cell>
    );
  };

  const StatusCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        <div>
          {
            [
              { label: '사용전', value: 'UNUSED' },
              { label: '사용중', value: 'IN_USE' },
              { label: '사용완료', value: 'USED_COMPLETE' },
              { label: '만료', value: 'OUT_OF_DATE' },
            ].filter((item) => item.value === rowData.status)[0]?.label
          }
        </div>
      </Cell>
    );
  };

  const ValueCell: React.FC<any> = ({ dataKey, rowData, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        <div>{numberWithCommas(rowData[dataKey])}</div>
      </Cell>
    );
  };

  const goDetail = (id: any) => {
    handleModalOpen();
    setHistoryPageNum(1);
    setHistoryPageSize(25);
    fetchCouponHistory(id);
  };

  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };

  const makeViewFilter = () => {
    setPageNum(1);
    setSelectedDateType(tmpSelectedDateType);
    setDate(tmpDate);
    setSelectedStatus(tmpSelectedStatus);
    setSearchText(tmpSearchText);
  };

  const fetchDownloadExcel = () => {
    const params = {
      status: selectedStatus,
      search_type: searchType,
      search_keyword: searchText,
      coupon_date_search_type: selectedDateType,
      start_date: dayjs(date[0]).format('YYYY-MM-DD'),
      end_date: dayjs(date[1]).format('YYYY-MM-DD'),
    };
    getCouponExcel(params).then((res: any) => {
      const { data } = res;
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([data], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `쿠폰발급내역_${dayjs(date[0]).format('YYYYMMDD')}_${dayjs(date[1]).format('YYYYMMDD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const fetchCouponList = useQuery(
    [
      'fetchCouponList',
      selectedDateType,
      date,
      selectedStatus,
      searchText,
      selectedSort,
      sortDirection,
      pageNum,
      pageSize,
    ],
    async () => {
      const params = {
        coupon_date_search_type: selectedDateType,
        start_date: dayjs(date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(date[1]).format('YYYY-MM-DD'),
        status: selectedStatus,
        search_type: searchType,
        search_keyword: searchText,
        page: pageNum,
        size: pageSize,
      };
      const sortParams = {
        sortType: selectedSort,
        direction: sortDirection,
      };
      const { data } = await getCouponList(params, sortParams);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            created_at: item.created_at || '-',
            name: item.name || '-',
            currency: item.currency || '-',
            total_value: item.total_value || '-',
            spend: item.spend || '0',
            value: item.value || '-',
            expire_month: item.expire_month || '-',
            exhausted_at: item.exhausted_at || '-',
            used_at: item.used_at || '-',
            created_by: item.created_by || '-',
            status: item.status || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setCouponList(data);
      },
    }
  );

  const fetchCouponHistory = (id: any) => {
    const params = {
      page: historyPageNum,
      size: historyPageSize,
    };
    getCouponHistory(id, params).then((res: any) => {
      const { data } = res;
      setHistoryTotalNum(data.total_elements);
      setHistoryList(data.content);
    });
  };

  useEffect(() => {
    if (URLParams.name !== undefined) {
      setSearchType('COUPON_NAME');
      setTmpSearchText(URLParams.name);
    }
  }, []);

  return (
    <div>
      <AppPageHeader title={'쿠폰 발급 내역'} />
      <div className="list-select">
        <div style={{ display: 'flex' }}>
          <div style={{ marginLeft: '10px' }}>
            <AppSelectPicker
              placeholder={'전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '발급일시', value: 'CREATED_AT' },
                { label: '사용완료일시', value: 'EXHAUSTED_AT' },
              ]}
              value={tmpSelectedDateType}
              onChange={(value: any) => {
                setTmpSelectedDateType(value);
              }}
            />
          </div>
          <div style={{ marginRight: '10px' }}>
            <AppDateRangePicker
              style={{ width: '240px' }}
              value={tmpDate}
              onChange={setTmpDate}
              disabledDate={(date) => dayjs(date).isAfter(dayjs())}
            ></AppDateRangePicker>
          </div>
          <div>
            <AppMultiplePicker
              placeholder={'사용여부: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '사용전', value: 'UNUSED' },
                { label: '사용중', value: 'IN_USE' },
                { label: '사용완료', value: 'USED_COMPLETE' },
                { label: '만료', value: 'OUT_OF_DATE' },
              ]}
              value={tmpSelectedStatus}
              onChange={(value: any) => {
                setTmpSelectedStatus(value);
              }}
            />
          </div>
          <div>
            <AppButton
              size={'md'}
              theme={'gray'}
              type={'submit'}
              onClick={makeViewFilter}
              style={{ padding: '0 30px' }}
            >
              조회
            </AppButton>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div className={'app-input-borderRadius'}>
            <AppSelectPicker
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '100px' }}
              data={[
                { label: '광고주', value: 'ADVERTISER' },
                { label: '광고계정', value: 'AD_ACCOUNT' },
                { label: '쿠폰명', value: 'COUPON_NAME' },
                { label: '발급자', value: 'CREATOR' },
              ]}
              value={searchType}
              onChange={(value: any) => {
                setSearchType(value);
              }}
            />
          </div>
          <div className={'app-input-borderRadius'} style={{ marginRight: '10px' }}>
            <AppInputGroup style={{ width: '169px' }}>
              <AppInput
                placeholder={'검색'}
                onPressEnter={getSearchData}
                onInput={(e: any) => {
                  setTmpSearchText(e.target.value);
                }}
                value={tmpSearchText}
              />
              <AppInputGroup.Addon style={{ cursor: 'pointer' }}>
                <img src={search} alt={'search'} />
              </AppInputGroup.Addon>
            </AppInputGroup>
          </div>
          <div>
            <AppButton
              type={'button'}
              size={'md'}
              theme={'white_gray'}
              style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}
              onClick={fetchDownloadExcel}
            >
              <div style={{ marginRight: '8px' }}>
                <img src={Download} alt="download" style={{ width: 12, height: 12 }} />
              </div>
              <div>엑셀 다운로드</div>
            </AppButton>
          </div>
        </div>
      </div>
      <div style={{ margin: '20px 10px' }}>조회 결과 (총 {totalNum}개)</div>
      <AppTable data={couponList} className={'asset-table'} height={500}>
        <Column flexGrow={1}>
          <SortHeader title={'발급일시'} sortName={'createdAt'} />
          <Cell align={'center'} dataKey={'created_at'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'광고주'} sortName={'adAccount.advertiser.advertiserName'} />
          <Cell align={'center'} dataKey={'advertiser_name'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'광고계정'} sortName={'adAccount.name'} />
          <Cell align={'center'} dataKey={'ad_account_name'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'쿠폰명'} sortName={'couponPolicy.name'} />
          <Cell align={'center'} dataKey={'name'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'통화'} sortName={'adAccount.currency'} />
          <Cell align={'center'} dataKey={'currency'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'쿠폰 금액'} sortName={'couponPolicy.value'} />
          <ValueCell align={'center'} dataKey={'total_value'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>쿠폰 만료월</HeaderCell>
          <Cell align={'center'} dataKey={'expire_month'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>사용여부</HeaderCell>
          <StatusCell align={'center'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>소진 금액</HeaderCell>
          <ViewCell align={'center'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>잔액</HeaderCell>
          <ValueCell align={'center'} dataKey={'value'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>사용완료월</HeaderCell>
          <Cell align={'center'} dataKey={'exhausted_at'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'발급자'} sortName={'createdBy.name'} />
          <Cell align={'center'} dataKey={'created_by'} />
        </Column>
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
      <AppModal open={open} onClose={handleModalClose}>
        <AppModal.Header>
          <AppModal.Title>쿠폰 소진 내역</AppModal.Title>
        </AppModal.Header>
        <AppModal.Body>
          <AppTable
            data={historyList}
            height={400}
            renderEmpty={(historyList: any) => {
              return (
                <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  소진 내역이 없습니다.
                </div>
              );
            }}
          >
            <Column flexGrow={1}>
              <HeaderCell align={'center'}>NO</HeaderCell>
              <Cell align={'center'} dataKey={'id'} />
            </Column>
            <Column flexGrow={1}>
              <HeaderCell align={'center'}>정산월</HeaderCell>
              <Cell align={'center'} dataKey={'used_at'} />
            </Column>
            <Column flexGrow={1}>
              <HeaderCell align={'center'}>소진 금액</HeaderCell>
              <Cell align={'center'} dataKey={'value'} />
            </Column>
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
                total={historyTotalNum}
                limit={historyPageSize}
                activePage={historyPageNum}
                onChangePage={setHistoryPageNum}
                onChangeLimit={handleHistoryChangeLimit}
              />
            </div>
            <div style={{ marginRight: '10px' }}>표시할 행 수</div>
            <div>
              <AppRowsPicker
                placement={'topStart'}
                value={historyPageSize}
                onChange={(value: any) => handleHistoryChangeLimit(value)}
                cleanable={false}
                searchable={false}
                data={[10, 25, 50, 75, 100].map((key) => ({ value: key, label: key }))}
                style={{ width: 70 }}
              />
            </div>
          </div>
        </AppModal.Body>
        <AppModal.Footer>
          <AppButton onClick={handleModalClose} appearance="primary">
            닫기
          </AppButton>
        </AppModal.Footer>
      </AppModal>
    </div>
  );
};

export default AdminCouponList;
