import React, { useEffect, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import { Checkbox, Table } from 'rsuite';
import AppPagination from '@components/AppPagination';
import { AppButton } from '@components/AppButton';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import dayjs from 'dayjs';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { getRoleType, isEmptyArr, pushToArray } from '@utils/functions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { changeUserStatus, deleteUser, getUserList } from '@apis/user.api';
import AppTable from '@components/AppTable';
import AppTypography from '@components/AppTypography';
import Search from '@components/Search';
import _ from 'lodash';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';
import AlertModal from '@components/AppModal/AlretModal';

interface AccountMemberListProps {}

const { Column, HeaderCell, Cell } = Table;

const AccountMemberList: React.FC<AccountMemberListProps> = () => {
  const myRole = sessionStorage.getItem('role');
  const memberId = sessionStorage.getItem('id');
  const roleType = getRoleType(myRole);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storageId = sessionStorage.getItem('id');
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

  const [isOpenSubmitAlertModal, setIsOpenSubmitAlertModal] = useState(false);

  let checked = false;

  if (checkedKeys.length === userList.length) {
    checked = true;
  } else if (checkedKeys.length === 0) {
    checked = false;
  }
  // 체크박스 전체 선택
  const handleCheckAll = (value: any, checked: any) => {
    const keys = checked ? fetchUserList.data?.map((item: any) => item.id) : [];
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
    //상태
    let getStatusFilter: string = '';
    //권한
    let getRoleFilter: string = '';
    //검색
    let getSearchTypeFilter: string = '';
    //전체
    let getTotalFilter: string = '';
    if (!isEmptyArr(selectedStatus)) {
      getStatusFilter = getComparatorsString('in', 'enabled', selectedStatus);
    }
    if (!isEmptyArr(selectedRole)) {
      getRoleFilter = getComparatorsString('in', 'role', selectedRole);
    }
    if (searchText !== '') {
      getSearchTypeFilter = getComparatorsString('~', searchType, `%${searchText}%`);
    }
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
            id: item.id,
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
      onError: (error: any) => {
        if (error.response.status === 406) {
          navigate(`/confirm-password?referrer=${encodeURIComponent(location.pathname + location.search)}`);
        } else {
          alert(error.response.data.message);
        }
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
  const goDetail = (id: any, role: any) => {
    let isUpdate = false;
    if (myRole === 'AGENCY' && (role === '대행사 User' || role === '성과 Viewer')) {
      isUpdate = true;
    } else if (
      myRole === 'ADVERTISER_EMPLOYEE' &&
      (role === '광고주 User' || role === '대행사 User' || role === '성과 Viewer')
    ) {
      isUpdate = true;
    } else if (
      myRole === 'ADVERTISER_MASTER' &&
      (role === '광고주 마스터' || role === '광고주 User' || role === '대행사 User' || role === '성과 Viewer')
    ) {
      isUpdate = true;
    } else if (myRole === 'ADMIN' || myRole === 'ADMIN_FINANCE' || myRole === 'ADMIN_CS') {
      isUpdate = true;
    }
    if (isUpdate) {
      navigate(`/account/member/update/${id}`);
    } else {
      navigate(`/account/member/detail/${id}`);
    }
  };
  // 테이블 상세조회 헤더
  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        <AppTypography.Link onClick={() => goDetail(rowData['id'], rowData['role'])}>
          {rowData.signin_id}
        </AppTypography.Link>
      </Cell>
    );
  };
  // 테이블 정렬 헤더
  const SortHeader: React.FC<any> = ({ title, sortName, ...props }) => {
    return (
      <HeaderCell {...props}>
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
  // 테이블 체크 헤더
  const CheckCell: React.FC<any> = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => {
    return (
      <Cell align={'center'} {...props}>
        <div>
          {rowData.id != storageId && (
            <Checkbox
              value={rowData[dataKey]}
              style={{ marginLeft: 7, marginTop: -8 }}
              onChange={onChange}
              checked={checkedKeys.some((item: any) => item === rowData[dataKey])}
              disabled={rowData.id == storageId}
            />
          )}
        </div>
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
            //setIsOpenSubmitAlertModal(true);
            queryClient.invalidateQueries(['fetchUserList']);
          }
        })
        .catch((err: any) => {
          setStatus('');
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
      tmp = fetchUserList.data?.filter((manager: any) => manager.id === item);
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
    if (roleType === 'isViewer') {
      navigate(`/account/member/detail/${memberId}`);
    }
  }, [roleType]);

  return (
    <div>
      {fetchUserList.isSuccess && (
        <>
          <AppPageHeader title={'사용자'} />
          <div className="list-select" style={{ borderBottom: '1px solid var(--guide-line)', marginBottom: 14 }}>
            <div style={{ display: 'flex' }}>
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
                        <span style={{ marginRight: 2 }}>상태: </span>
                        {value.length === 8
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
                        <span style={{ marginRight: 2 }}>권한: </span>
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
          <div className="list-select">
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
              <AppButton
                size={'md'}
                style={{ padding: '0 12px', marginRight: '10px' }}
                onClick={fetchDeleteUser}
                disabled={checkedKeys.length < 1}
              >
                삭제
              </AppButton>
              {/*<AppButton*/}
              {/*  size={'md'}*/}
              {/*  theme={'red'}*/}
              {/*  style={{ padding: '0 12px', marginRight: '10px' }}*/}
              {/*  onClick={() => navigate('/account/member/create')}*/}
              {/*>*/}
              {/*  추가*/}
              {/*</AppButton>*/}
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
              maxLength={50}
              onSearch={makeViewFilter}
            />
          </div>
          <AppTable data={fetchUserList.data} className={'asset-table'} height={500}>
            <Column width={60}>
              <HeaderCell align={'center'} style={{ padding: 0 }}>
                <Checkbox inline onChange={handleCheckAll} />
              </HeaderCell>
              <CheckCell dataKey="id" checkedKeys={checkedKeys} onChange={handleCheck} />
            </Column>
            <Column width={100}>
              <SortHeader title={'상태'} sortName={'enabled'} />
              <Cell dataKey={'enabled'} />
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
        </>
      )}
      <AlertModal
        open={isOpenSubmitAlertModal}
        onOk={() => setIsOpenSubmitAlertModal(false)}
        content={<AppTypography.Text>상태를 변경하였습니다.</AppTypography.Text>}
        title={'알럿'}
      />
    </div>
  );
};

export default AccountMemberList;
