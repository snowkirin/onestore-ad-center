import React, { useEffect, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import { Checkbox, Table } from 'rsuite';
import AppPagination from '@components/AppPagination';
import { AppButton } from '@components/AppButton';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import dayjs from 'dayjs';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { isEmptyArr, pushToArray } from '@utils/functions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { changeUserStatus, deleteUser, getUserList } from '@apis/user.api';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppTable from '@components/AppTable';
import queryString from 'query-string';
import AppTypography from '@components/AppTypography';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import _ from 'lodash';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface AdminAccountUserListProps {}

const { Column, HeaderCell, Cell } = Table;

const AdminAccountUserList: React.FC<AdminAccountUserListProps> = () => {
  const role = sessionStorage.getItem('role');

  const URLParams = queryString.parse(location.search);
  const advertiserName = URLParams.advertiserName;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // 셀렉트 박스
  const [date, setDate] = useState<any>([dayjs('2022-01-01').toDate(), dayjs().subtract(0, 'days').toDate()]);
  const [selectedStatus, setSelectedStatus] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any[]>([]);
  // 검색
  const [searchType, setSearchType] = useState('signinId');
  const [searchText, setSearchText] = useState<any>('');
  // 상태 변경
  const [status, setStatus] = useState('');
  // 필터
  const [filter, setFilter] = useState('');
  // 테이블 데이터
  const [userList, setUserList] = useState<any[]>([]);
  // 정렬
  const [selectedSort, setSelectedSort] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  // 페이징
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);
  // 테이블 체크
  const [checkedKeys, setCheckedKeys] = useState<any[]>([]);

  let checked = false;

  if (checkedKeys.length === userList.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  }
  // 체크박스 전체 선택
  const handleCheckAll = (value: any, checked: any) => {
    const keys = checked ? userList.map((item: any) => item.id) : [];
    setCheckedKeys(keys);
  };
  // 체크 박스 선택
  const handleCheck = (value: any, checked: any) => {
    const keys = checked ? [...checkedKeys, value] : checkedKeys.filter((item: any) => item !== value);
    setCheckedKeys(keys);
  };
  // 필터 생성
  const makeViewFilter = () => {
    setPageNum(1);
    const tmpFinalArray: string | string[] = [];
    //기간
    let getDateFilter: string = '';
    //상태
    let getStatusFilter: string = '';
    //권한
    let getRoleFilter: string = '';
    //검색
    let getSearchTypeFilter: string = '';
    //전체
    let getTotalFilter: string = '';
    if (date !== null) {
      getDateFilter =
        '(' +
        getComparatorsString('>:', 'createdAt', dayjs(date[0]).format('YYYY-MM-DD') + ' 00:00:00') +
        ' and ' +
        getComparatorsString('<:', 'createdAt', dayjs(date[1]).format('YYYY-MM-DD') + ' 23:59:59') +
        ')';
    }
    if (!isEmptyArr(selectedStatus)) {
      getStatusFilter = getComparatorsString('in', 'enabled', selectedStatus);
    }
    if (!isEmptyArr(selectedRole)) {
      getRoleFilter = getComparatorsString('in', 'role', selectedRole);
    }
    if (searchText !== '') {
      getSearchTypeFilter = getComparatorsString('~', searchType, `%${searchText}%`);
    }
    pushToArray(getDateFilter, tmpFinalArray);
    pushToArray(getStatusFilter, tmpFinalArray);
    pushToArray(getRoleFilter, tmpFinalArray);
    pushToArray(getSearchTypeFilter, tmpFinalArray);
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };
  // 테이블 데이터 세팅
  const fetchUserList = useQuery(
    ['fetchUserList', filter, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const pageParams = {
        page: pageNum,
        size: pageSize,
      };
      let sortParams = '';
      if (selectedSort === '') {
        sortParams = `&sort=advertiser.advertiserName,asc&sort=role,asc&sort=createdAt,desc`;
      } else {
        sortParams = `&sort=${selectedSort},${sortDirection}`;
      }
      const { data } = await getUserList(filter, pageParams, sortParams);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            enabled: item.enabled || '-',
            advertiser_name: item.advertiser_name || '-',
            name: item.name || '-',
            signin_id: item.signin_id || '-',
            role: item.role || '-',
            created_at: item.created_at || '-',
            updated_at: item.updated_at || '-',
            last_login: item.last_login || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setUserList(data);
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
    navigate(`/admin/account/user/update/${id}`);
  };
  // 테이블 상세조회 헤더
  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <Cell {...props}>
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>{rowData.signin_id}</AppTypography.Link>
      </Cell>
    );
  };
  // 테이블 정렬 헤더
  const SortHeader: React.FC<any> = ({ title, sortName, ...props }) => {
    return (
      <HeaderCell {...props}>
        <div style={{ display: 'flex' }}>
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
  // 테이블 체크 헤더
  const CheckCell: React.FC<any> = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
    return (
      <Cell {...props}>
        <Checkbox
          style={{ marginLeft: 10, marginTop: -8 }}
          value={rowData[dataKey]}
          onChange={onChange}
          checked={checkedKeys.some((item: any) => item === rowData[dataKey])}
        />
      </Cell>
    );
  };
  // 상태 변경
  const fetchUserChange = (value: any) => {
    const params = {
      ids: checkedKeys.join(','),
      enabled: value,
    };
    if (checkedKeys.length) {
      changeUserStatus(params)
        .then((res: any) => {
          if (res.status === 200) {
            setStatus('');
            alert('상태를 변경하였습니다.');
            queryClient.invalidateQueries(['fetchUserList']);
          }
        })
        .catch((err: any) => {
          alert(err.response.data.message);
        });
    }
    return true;
  };
  // 사용자 삭제
  const fetchDeleteUser = () => {
    // 활성이 있는지 확인
    let tmp: any[] = [];
    let isEnabled = false;
    checkedKeys.forEach((item: any) => {
      tmp = userList.filter((manager: any) => manager.id === item);
    });
    tmp.forEach((item: any) => {
      if (item.enabled === '활성') {
        alert('활성 상태인 회원은 삭제가 불가합니다. 비활성 상태로 변경 후 다시 시도해주세요.');
        isEnabled = true;
      }
    });
    if (!isEnabled) {
      const params = {
        ids: checkedKeys.join(','),
      };
      if (confirm('선택한 회원이 삭제됩니다. 계속하시겠습니까?')) {
        deleteUser(params)
          .then((res: any) => {
            if (res.data.change === 0) {
              alert('활성 상태인 회원은 삭제가 불가합니다. 비활성 상태로 변경 후 다시 시도해주세요.');
            } else {
              location.reload();
            }
          })
          .catch((err: any) => {
            if (err.response.status == 400) {
              alert(err.response.data.message);
            }
          });
      }
    }
  };
  useEffect(() => {
    if (advertiserName !== '') {
      makeViewFilter();
    }
  }, [advertiserName]);
  return (
    <div>
      <AppPageHeader title={'사용자'} />
      <div className="list-select" style={{ borderBottom: '1px solid var(--guide-line)' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '10px' }}>
            <AppDateRangePicker
              cleanable={false}
              style={{ width: '240px' }}
              value={date}
              onChange={setDate}
            ></AppDateRangePicker>
          </div>
          <div>
            <AppCheckPicker
              placeholder={'상태: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '130px', marginRight: '10px' }}
              data={[
                { label: '활성', value: 'true' },
                { label: '비활성', value: 'false' },
              ]}
              value={selectedStatus}
              onChange={(value: any) => {
                setSelectedStatus(value);
              }}
              renderValue={(value, item: any) => {
                return (
                  <span>
                    <span style={{ marginRight: 5 }}>상태:</span>
                    {value.length === 2
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
            <AppCheckPicker
              placeholder={'권한: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '170px', marginRight: '10px' }}
              data={[
                { label: '광고주 마스터', value: 'ADVERTISER_MASTER' },
                { label: '광고주 User', value: 'ADVERTISER_EMPLOYEE' },
                { label: '대행사 User', value: 'AGENCY' },
                { label: '성과 Viewer', value: 'REPORT_VIEWER' },
              ]}
              value={selectedRole}
              onChange={(value: any) => {
                setSelectedRole(value);
              }}
              renderValue={(value, item: any) => {
                return (
                  <span>
                    <span style={{ marginRight: 5 }}>권한:</span>
                    {value.length === 4
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
      </div>
      <div className="list-select" style={{ paddingTop: 14 }}>
        <div style={{ display: 'flex' }}>
          <div>
            <AppSelectPicker
              disabled={checkedKeys.length < 1}
              placeholder={'상태 변경'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '100px', marginRight: '10px' }}
              data={[
                { label: '활성', value: 'true' },
                { label: '비활성', value: 'false' },
              ]}
              value={status}
              onChange={(value: any) => {
                fetchUserChange(value);
              }}
            />
          </div>
          {role === 'ADMIN' && (
            <AppButton
              size={'md'}
              style={{ padding: '0 12px', marginRight: '10px' }}
              onClick={fetchDeleteUser}
              disabled={checkedKeys.length < 1}
            >
              삭제
            </AppButton>
          )}
        </div>
        <Search
          data={[
            { label: '아이디', value: 'signinId' },
            { label: '광고주명', value: 'advertiser.advertiserName' },
            { label: '이름', value: 'name' },
          ]}
          searchKey={searchType}
          onSearchKeyChange={(value) => setSearchType(value)}
          searchValue={searchText}
          onSearchValueChange={setSearchText}
          onSearch={makeViewFilter}
        />
      </div>
      <AppTable data={fetchUserList.data} className={'asset-table'} height={500}>
        <Column width={80}>
          <HeaderCell align={'center'} style={{ padding: 0 }}>
            <Checkbox inline checked={checked} onChange={handleCheckAll} />
          </HeaderCell>
          <CheckCell align={'center'} dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} />
        </Column>
        <Column width={100}>
          <SortHeader title={'상태'} sortName={'enabled'} />
          <Cell dataKey={'enabled'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'광고주명'} sortName={'advertiser.advertiserName'} />
          <Cell dataKey={'advertiser_name'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'이름'} sortName={'name'} />
          <Cell dataKey={'name'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'아이디'} sortName={'signinId'} />
          <ViewCell />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'권한'} sortName={'role'} />
          <Cell dataKey={'role'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'생성일시'} sortName={'createdAt'} />
          <Cell dataKey={'created_at'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'마지막 수정일시'} sortName={'updatedAt'} />
          <Cell dataKey={'updated_at'} />
        </Column>
        <Column flexGrow={1}>
          <SortHeader title={'마지막 접속일시'} sortName={'lastLogin'} />
          <Cell dataKey={'last_login'} />
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

export default AdminAccountUserList;
