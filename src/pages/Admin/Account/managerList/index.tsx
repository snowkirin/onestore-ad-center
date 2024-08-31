import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { isEmptyArr, pushToArray } from '@utils/functions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { changeAdminStatus, deleteAdmin, getAdminList } from '@apis/admin.api';
import { Checkbox } from 'rsuite';
import AppPagination from '@components/AppPagination';
import AppPageHeader from '@components/AppPageHeader';
import { AppButton } from '@components/AppButton';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppTable from '@components/AppTable';
import AppTypography from '@components/AppTypography';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import _ from 'lodash';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface AdminAccountManagerListProps {}

const AdminAccountManagerList: React.FC<AdminAccountManagerListProps> = () => {
  const role = sessionStorage.getItem('role');
  const memberId = sessionStorage.getItem('id');

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // 셀렉트 박스
  const [date, setDate] = useState<any>([dayjs('2022-01-01').toDate(), dayjs().subtract(0, 'days').toDate()]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  // 검색
  const [searchType, setSearchType] = useState('signinId');
  const [searchText, setSearchText] = useState<any>('');
  // 상태 변경
  const [status, setStatus] = useState('');
  // 필터
  const [filter, setFilter] = useState('');
  // 테이블 데이터
  const [managerList, setManagerList] = useState<any>([]);
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

  if (checkedKeys.length === managerList.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  }
  // 체크박스 전체 선택
  const handleCheckAll = (value: any, checked: any) => {
    const keys = checked ? managerList.map((item: any) => item.id) : [];
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
    //검색
    let getSearchTypeFilter: string = '';
    //전체
    let getTotalFilter: string = '';
    // 1. 날짜
    if (date !== null) {
      getDateFilter =
        '(' +
        getComparatorsString('>:', 'createdAt', dayjs(date[0]).format('YYYY-MM-DD') + ' 00:00:00') +
        ' and ' +
        getComparatorsString('<:', 'createdAt', dayjs(date[1]).format('YYYY-MM-DD') + ' 23:59:59') +
        ')';
    }
    // 2. 상태
    if (!isEmptyArr(selectedStatus)) {
      getStatusFilter = getComparatorsString('in', 'enabled', selectedStatus);
    }
    // 5. 검색
    if (searchText !== '') {
      getSearchTypeFilter = getComparatorsString('~', searchType, `%${searchText}%`);
    }
    pushToArray(getDateFilter, tmpFinalArray);
    pushToArray(getStatusFilter, tmpFinalArray);
    pushToArray(getSearchTypeFilter, tmpFinalArray);
    // 5. 세팅
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };

  // 상태 변경
  const fetchManagerChange = (value: any) => {
    const params = {
      ids: checkedKeys.join(','),
      enabled: value,
    };
    if (checkedKeys.length) {
      changeAdminStatus(params)
        .then((res: any) => {
          if (res.status === 200) {
            setStatus('');
            alert('상태를 변경하였습니다.');
            queryClient.invalidateQueries(['fetchManagerList']);
          }
        })
        .catch((err: any) => {
          setStatus('');
          alert(err.response.data.message);
        });
    }
    return true;
  };

  // 관리자 삭제
  const fetchDeleteManager = () => {
    // 활성이 있는지 확인
    let tmp: any[] = [];
    let isEnabled = false;
    checkedKeys.forEach((item: any) => {
      tmp = managerList.filter((manager: any) => manager.id === item);
    });
    tmp.map((item: any) => {
      if (item.enabled === '활성') {
        alert('활성 상태인 관리자는 삭제가 불가합니다. 비활성 상태로 변경 후 다시 시도해주세요.');
        isEnabled = true;
        return;
      }
    });
    if (!isEnabled) {
      const params = {
        ids: checkedKeys.join(','),
      };
      if (confirm('선택한 관리자가 삭제됩니다. 계속하시겠습니까?')) {
        deleteAdmin(params)
          .then((res: any) => {
            if (res.data.change === 0) {
              alert('활성 상태인 관리자는 삭제가 불가합니다. 비활성 상태로 변경 후 다시 시도해주세요.');
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
  // 테이블 데이터 세팅
  const fetchManagerList = useQuery(
    ['fetchManagerList', filter, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const pageParams = {
        page: pageNum,
        size: pageSize,
      };
      const sortParams = {
        sortType: selectedSort,
        direction: sortDirection,
      };
      const { data } = await getAdminList(filter, pageParams, sortParams);
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
        setManagerList(data);
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
    navigate(`/admin/account/manager/update/${id}`);
  };
  // 테이블 상세조회 헤더
  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <AppTypography.Link onClick={() => goDetail(rowData['id'])}>{rowData.signin_id}</AppTypography.Link>
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
        {rowData.id != memberId && (
          <Checkbox
            value={rowData[dataKey]}
            style={{ marginTop: -8 }}
            onChange={onChange}
            checked={checkedKeys.some((item: any) => item === rowData[dataKey])}
          />
        )}
      </AppTable.Cell>
    );
  };

  useEffect(() => {
    if (role === 'ADMIN_FINANCE' || role === 'ADMIN_CS') {
      navigate(`/admin/account/manager/update/${memberId}`);
    }
  }, [role]);

  return (
    <div>
      <AppPageHeader title={'관리자'} />
      <div className="list-select" style={{ borderBottom: '1px solid var(--guide-line)' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '10px' }}>
            <AppDateRangePicker
              style={{ width: '240px' }}
              value={date}
              onChange={setDate}
              cleanable={false}
            ></AppDateRangePicker>
          </div>
          <div>
            <AppCheckPicker
              placeholder={'상태: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '120px', marginRight: '10px' }}
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
                fetchManagerChange(value);
              }}
            />
          </div>
          <AppButton
            size={'md'}
            style={{ padding: '0 12px', marginRight: '10px' }}
            onClick={fetchDeleteManager}
            disabled={checkedKeys.length < 1}
          >
            삭제
          </AppButton>
          <AppButton size={'md'} theme={'create'} onClick={() => navigate('/admin/account/manager/create')}>
            추가
          </AppButton>
        </div>
        <Search
          data={[
            { label: '아이디', value: 'signinId' },
            { label: '이름', value: 'name' },
          ]}
          searchKey={searchType}
          onSearchKeyChange={(value) => setSearchType(value)}
          searchValue={searchText}
          onSearchValueChange={setSearchText}
          onSearch={makeViewFilter}
        />
      </div>
      <AppTable data={managerList} className={'asset-table'} height={500}>
        <AppTable.Column width={70}>
          <AppTable.HeaderCell style={{ paddingLeft: 20 }}>
            <Checkbox checked={checked} onChange={handleCheckAll} style={{ marginTop: '-7px' }} />
          </AppTable.HeaderCell>
          <CheckCell
            dataKey="id"
            enabled={'enabled'}
            checkedKeys={checkedKeys}
            onChange={handleCheck}
            style={{ paddingLeft: 20 }}
          />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <SortHeader title={'상태'} sortName={'enabled'} />
          <AppTable.Cell dataKey={'enabled'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'이름'} sortName={'name'} />
          <AppTable.Cell dataKey={'name'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'아이디'} sortName={'signinId'} />
          <ViewCell />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'권한'} sortName={'role'} />
          <AppTable.Cell dataKey={'role'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'생성일시'} sortName={'createdAt'} />
          <AppTable.Cell dataKey={'created_at'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'마지막 수정일시'} sortName={'updatedAt'} />
          <AppTable.Cell dataKey={'updated_at'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'마지막 접속일시'} sortName={'lastLogin'} />
          <AppTable.Cell dataKey={'last_login'} />
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

export default AdminAccountManagerList;
