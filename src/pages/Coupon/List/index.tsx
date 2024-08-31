import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppMultiplePicker from '@components/AppPicker/AppMultiplePicker';
import { AppInput, AppInputGroup } from '@components/AppInput';
import search from '@assets/images/icons/search/search-small.svg';
import { useQuery } from '@tanstack/react-query';
import { getCouponList } from '@apis/coupon.api';
import { Pagination, SelectPicker, Table } from 'rsuite';
import AppPagination from '@components/AppPagination';
import { AppButton } from '@components/AppButton';
import AppTable from '@components/AppTable';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface CouponListProps {}

const { Column, HeaderCell, Cell } = Table;

const CouponList: React.FC<CouponListProps> = () => {
  // adAccountId
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const [tmpSelectedStatus, setTmpSelectedStatus] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [tmpSearchText, setTmpSearchText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [couponList, setCouponList] = useState([]);
  const [searchType, setSearchType] = useState('');

  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);

  const getData = () => {
    setPageNum(1);
    setSelectedStatus(tmpSelectedStatus);
  };

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const getSearchData = () => {
    setPageNum(1);
    setSearchType('COUPON_NAME');
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

  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };

  const fetchCouponList = useQuery(
    ['fetchCouponList', selectedAdAccount, selectedStatus, searchText, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const params = {
        ad_account_id: selectedAdAccount,
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
            spend: item.spend || '-',
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

  return (
    <div>
      <AppPageHeader title={'쿠폰 사용 내역'} />
      <div className="list-select">
        <div style={{ display: 'flex' }}>
          <div style={{ marginLeft: '10px' }}>
            <AppMultiplePicker
              placeholder={'전체'}
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
            <AppButton size={'md'} theme={'gray'} type={'submit'} onClick={getData} style={{ padding: '0 30px' }}>
              조회
            </AppButton>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div className={'select-name'}>쿠폰명</div>
          <div className={'app-input-borderRadius'}>
            <AppInputGroup style={{ width: '169px' }}>
              <AppInput
                placeholder={'검색'}
                onPressEnter={getSearchData}
                onInput={(e: any) => {
                  setTmpSearchText(e.target.value);
                }}
              />
              <AppInputGroup.Addon style={{ cursor: 'pointer' }}>
                <img src={search} alt={'search'} />
              </AppInputGroup.Addon>
            </AppInputGroup>
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
          <SortHeader title={'쿠폰명'} sortName={'couponPolicy.name'} />
          <Cell align={'center'} dataKey={'name'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'통화'} sortName={'adAccount.currency'} />
          <Cell align={'center'} dataKey={'currency'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'쿠폰금액'} sortName={'couponPolicy.value'} />
          <Cell align={'center'} dataKey={'total_value'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>쿠폰 만료월</HeaderCell>
          <Cell align={'center'} dataKey={'expire_month'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>사용여부</HeaderCell>
          <Cell align={'center'} dataKey={'status'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>소진 금액</HeaderCell>
          <Cell align={'center'} dataKey={'spend'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>잔액</HeaderCell>
          <Cell align={'center'} dataKey={'value'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>사용완료월</HeaderCell>
          <Cell align={'center'} dataKey={'exhausted_at'} />
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
    </div>
  );
};

export default CouponList;
