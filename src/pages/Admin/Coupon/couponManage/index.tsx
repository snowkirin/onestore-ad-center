import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { AppInput, AppInputGroup } from '@components/AppInput';
import search from '@assets/images/icons/search/search-small.svg';
import { useQuery } from '@tanstack/react-query';
import { deleteCouponManage, getCouponManage } from '@apis/coupon.api';
import { Checkbox, Pagination, SelectPicker, Table, useToaster } from 'rsuite';
import AppPagination from '@components/AppPagination';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import { getComparatorsString } from '@utils/filter/dynamicFilter';
import numberWithCommas from '@utils/common';
import AppTable from '@components/AppTable';
import AppTypography from '@components/AppTypography';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface CouponListProps {}

const { Column, HeaderCell, Cell } = Table;

const AdminCouponManage: React.FC<CouponListProps> = () => {
  const role = sessionStorage.getItem('role');

  let navigate = useNavigate();

  const [searchType, setSearchType] = useState('name');
  const [searchText, setSearchText] = useState('');
  const [couponList, setCouponList] = useState([]);

  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);

  const [filter, setFilter] = useState('');

  const [checkedKeys, setCheckedKeys] = useState<any>([]);

  let checked = false;

  if (checkedKeys.length === couponList.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  }

  const handleCheckAll = (value: any, checked: any) => {
    const keys = checked ? couponList.map((item: any) => item.id) : [];
    setCheckedKeys(keys);
  };
  const handleCheck = (value: any, checked: any) => {
    const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item: any) => item !== value);
    setCheckedKeys(keys);
  };

  const fetchDeleteCoupon = () => {
    const params = {
      ids: checkedKeys.join(','),
    };
    if (confirm('선택한 쿠폰이 삭제됩니다. 계속하시겠습니까?')) {
      deleteCouponManage(params)
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

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const getSearchData = () => {
    setPageNum(1);
    let getTotalFilter: string = '';
    getTotalFilter = getComparatorsString('~', searchType, `%${searchText}%`);
    setFilter(encodeURIComponent(getTotalFilter));
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

  const CheckCell: React.FC<any> = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
    return (
      <Cell {...props}>
        <Checkbox
          style={{ marginLeft: 10, marginBottom: 16 }}
          value={rowData[dataKey]}
          onChange={onChange}
          checked={checkedKeys.some((item: any) => item === rowData[dataKey])}
        />
      </Cell>
    );
  };

  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <Cell {...props}>
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>{rowData.name}</AppTypography.Link>
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
    navigate(`/admin/coupon/update/${id}`);
  };

  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };

  const fetchCouponManage = useQuery(
    ['fetchCouponManage', filter, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const sortParams = {
        sortType: selectedSort,
        direction: sortDirection,
      };
      const { data } = await getCouponManage(filter, sortParams);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            id: item.id,
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
      <AppPageHeader title={'쿠폰 관리'} />
      <div className="list-select">
        <div style={{ display: 'flex' }}>
          <AppButton
            size={'md'}
            style={{ padding: '0 12px', marginRight: '10px' }}
            onClick={fetchDeleteCoupon}
            disabled={checkedKeys.length < 1}
          >
            삭제
          </AppButton>
          {role === 'ADMIN' && (
            <AppButton size={'md'} theme={'create'} onClick={() => navigate('/admin/coupon/create')}>
              생성
            </AppButton>
          )}
        </div>
        <div style={{ display: 'flex' }}>
          <div className={'app-input-borderRadius'}>
            <AppSelectPicker
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '100px' }}
              data={[
                { label: '쿠폰명', value: 'name' },
                { label: '생성자', value: 'createdBy.name' },
              ]}
              value={searchType}
              onChange={(value: any) => {
                setSearchType(value);
              }}
            />
          </div>
          <div className={'app-input-borderRadius'}>
            <AppInputGroup style={{ width: '169px' }}>
              <AppInput
                placeholder={'검색'}
                onPressEnter={getSearchData}
                onInput={(e: any) => {
                  setSearchText(e.target.value);
                }}
              />
              <AppInputGroup.Addon style={{ cursor: 'pointer' }}>
                <img src={search} alt={'search'} />
              </AppInputGroup.Addon>
            </AppInputGroup>
          </div>
        </div>
      </div>
      <AppTable data={couponList} className={'asset-table'} height={500}>
        <Column width={80}>
          <HeaderCell align={'center'} style={{ padding: 0 }}>
            <Checkbox inline checked={checked} onChange={handleCheckAll} />
          </HeaderCell>
          <CheckCell align={'center'} dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'쿠폰명'} sortName={'name'} />
          <ViewCell align={'center'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'통화'} sortName={'currency'} />
          <Cell align={'center'} dataKey={'currency'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'쿠폰 금액'} sortName={'value'} />
          <ValueCell align={'center'} dataKey={'value'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>총 발행금액</HeaderCell>
          <ValueCell align={'center'} dataKey={'total_value'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'발행수'} sortName={'releaseCount'} />
          <ValueCell align={'center'} dataKey={'release_count'} />
        </Column>
        <Column flexGrow={1}>
          <HeaderCell align={'center'}>쿠폰 만료월</HeaderCell>
          <Cell align={'center'} dataKey={'expire_month'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'생성일시'} sortName={'createdAt'} />
          <Cell align={'center'} dataKey={'created_at'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'마지막 수정일시'} sortName={'updatedAt'} />
          <Cell align={'center'} dataKey={'updated_at'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'생성자'} sortName={'createdBy.name'} />
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
    </div>
  );
};

export default AdminCouponManage;
