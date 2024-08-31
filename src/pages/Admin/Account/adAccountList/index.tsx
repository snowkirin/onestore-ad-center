import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { pushToArray } from '@utils/functions';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from 'rsuite';
import AppPagination from '@components/AppPagination';
import AppPageHeader from '@components/AppPageHeader';
import { ckhAccountDeleteAble, deleteAdAccount, getAdAccountList } from '@apis/ad_account.api';
import AppTable from '@components/AppTable';
import AppTypography from '@components/AppTypography';
import TextCell from '@components/Common/TextCell';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface AdminAccountAdAccountListProps {}

const AdminAccountAdAccountList: React.FC<AdminAccountAdAccountListProps> = () => {
  const navigate = useNavigate();
  // 검색
  const [searchType, setSearchType] = useState('advertiser.advertiserName');
  const [searchText, setSearchText] = useState<any>('');
  // 필터
  const [filter, setFilter] = useState('');
  // 테이블 데이터
  const [adAccountList, setAdAccountList] = useState<any>([]);
  // 정렬
  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  // 페이징
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);
  // 테이블 체크
  const [checkedKeys, setCheckedKeys] = useState<any>([]);
  let checked = false;
  if (checkedKeys.length === adAccountList.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  }
  const handleCheckAll = (value: any, checked: any) => {
    const keys = checked ? adAccountList.map((item: any) => item.id) : [];
    setCheckedKeys(keys);
  };
  const handleCheck = (value: any, checked: any) => {
    const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item: any) => item !== value);
    setCheckedKeys(keys);
  };
  // 필터 생성
  const makeViewFilter = () => {
    setPageNum(1);
    const tmpFinalArray: string | string[] = [];
    let getSearchTypeFilter: string = '';
    let getTotalFilter: string = '';

    if (searchText !== '') {
      getSearchTypeFilter = getComparatorsString('~', searchType, `%${searchText}%`);
    }
    pushToArray(getSearchTypeFilter, tmpFinalArray);
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };
  // 계정 삭제
  const fetchDeleteManager = () => {
    const params = {
      ids: checkedKeys.join(','),
    };
    ckhAccountDeleteAble(params)
      .then((res) => {
        if (res.status === 200) {
          if (
            confirm(
              '선택한 광고계정을 삭제하시겠습니까? \n삭제 시, 다음 데이터가 모두 삭제되며 복구되지 않습니다.\n\n' +
                '● 광고계정 자산: 앱, 캠페인, 광고그룹, 소재그룹, 소재, 맞춤 타겟, \n트래킹 링크\n\n' +
                '● 보고서 데이터 ' +
                '\n\n' +
                '단, 정산 관련 데이터는 유지됩니다.'
            )
          ) {
            deleteAdAccount(params).then((res: any) => {
              if (res.status === 200) {
                location.reload();
              }
            });
          }
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          alert(err.response.data.message);
        }
      });
  };
  // 테이블 데이터 세팅
  const fetchAdAccountList = useQuery(
    ['fetchAdAccountList', filter, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const pageParams = {
        page: pageNum,
        size: pageSize,
      };
      const sortParams = {
        sortType: selectedSort,
        direction: sortDirection,
      };
      const { data } = await getAdAccountList(filter, pageParams, sortParams);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setAdAccountList(data);
      },
    }
  );
  // 테이블 페이징
  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };
  // 테이블 정렬 변경
  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };
  // 테이블 상세조회
  const goDetail = (id: any) => {
    navigate(`/admin/account/ad-account/update?id=${id}`);
  };
  // 테이블 상세조회 헤더
  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>{rowData.name}</AppTypography.Link>
      </AppTable.Cell>
    );
  };
  // 테이블 광고주 헤더
  const AdvisorCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <AppTypography.Link onClick={() => window.open(`/admin/account/advertiser/update/${rowData['advertiser_id']}`)}>
          {' '}
          {rowData.advertiser_name}
        </AppTypography.Link>
      </AppTable.Cell>
    );
  };
  // 테이블 정렬 헤더
  const SortHeader: React.FC<any> = ({ title, sortName, ...props }) => {
    return (
      <AppTable.HeaderCell {...props}>
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
  // 테이블 체크 헤더
  const CheckCell: React.FC<any> = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <div>
          <Checkbox
            value={rowData[dataKey]}
            style={{ marginLeft: 10, marginBottom: 16 }}
            onChange={onChange}
            checked={checkedKeys.some((item: any) => item === rowData[dataKey])}
          />
        </div>
      </AppTable.Cell>
    );
  };
  return (
    <div>
      <AppPageHeader title={'광고계정'} />
      <div className="list-select">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/*<AppButton*/}
          {/*  size={'md'}*/}
          {/*  style={{ padding: '0 12px', marginRight: '10px' }}*/}
          {/*  onClick={fetchDeleteManager}*/}
          {/*  disabled={checkedKeys.length < 1}*/}
          {/*>*/}
          {/*  삭제*/}
          {/*</AppButton>*/}
          <div style={{ color: 'var(--sub-gray-color)' }}>
            *새 광고계정 추가 생성은 조직/계정 {'>'} 광고주 {'>'} 광고주 조회/수정 화면에서 진행하실 수 있습니다.
          </div>
        </div>
        <Search
          data={[
            { label: '광고주명', value: 'advertiser.advertiserName' },
            { label: '광고계정 ID', value: 'id' },
            { label: '광고계정명', value: 'name' },
          ]}
          searchKey={searchType}
          onSearchKeyChange={(value) => setSearchType(value)}
          searchValue={searchText}
          onSearchValueChange={setSearchText}
          onSearch={makeViewFilter}
        />
      </div>
      <AppTable data={adAccountList} className={'asset-table'} height={500}>
        {/*<Column width={80}>*/}
        {/*  <HeaderCell align={'center'} style={{ padding: 0 }}>*/}
        {/*    <Checkbox inline checked={checked} onChange={handleCheckAll} />*/}
        {/*  </HeaderCell>*/}
        {/*  <CheckCell*/}
        {/*    align={'center'}*/}
        {/*    dataKey="id"*/}
        {/*    enabled={'enabled'}*/}
        {/*    checkedKeys={checkedKeys}*/}

        {/*    onChange={handleCheck}*/}
        {/*  />*/}
        {/*</Column>*/}
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'광고주명'} sortName={'advertiser.advertiserName'} style={{ paddingLeft: 30 }} />
          <AdvisorCell style={{ paddingLeft: 30 }} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>광고계정 ID</AppTable.HeaderCell>
          <TextCell dataKey={'id'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'광고계정명'} sortName={'name'} />
          <ViewCell />
        </AppTable.Column>
        <AppTable.Column width={170}>
          <SortHeader title={'시간대'} sortName={'timeZone'} />
          <AppTable.Cell dataKey={'time_zone_detail'} />
        </AppTable.Column>
        <AppTable.Column width={70}>
          <SortHeader title={'통화'} sortName={'currency'} />
          <AppTable.Cell dataKey={'currency'} />
        </AppTable.Column>
        <AppTable.Column width={160}>
          <SortHeader title={'생성일시'} sortName={'createdAt'} />
          <AppTable.Cell dataKey={'created_at'} />
        </AppTable.Column>
        <AppTable.Column width={160}>
          <SortHeader title={'마지막 수정일시'} sortName={'updatedAt'} />
          <AppTable.Cell dataKey={'updated_at'} />
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

export default AdminAccountAdAccountList;
