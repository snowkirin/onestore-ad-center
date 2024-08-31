import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { isEmptyArr, pushToArray } from '@utils/functions';
import { useQuery } from '@tanstack/react-query';
import { getAdminHelpList } from '@apis/Inquiry/admin.api';
import AppPagination from '@components/AppPagination';
import dayjs from 'dayjs';
import AppTable from '@components/AppTable';
import EllipsisPopup from '@components/EllipsisPopup';
import AppTypography from '@components/AppTypography';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import _ from 'lodash';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface CustomerServiceHelpCreateProps {}

const AdminCustomerServiceHelpList: React.FC<CustomerServiceHelpCreateProps> = () => {
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [selectedContentType, setSelectedContentType] = useState('title');
  const [searchContent, setSearchContent] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('firstCategory.sort,secondCategory.sort,sort');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [tableData, setTableData] = useState([]);
  const [totalNum, setTotalNum] = useState(0);
  const [isDesc, setIsDesc] = useState(false);

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const ViewCell: React.FC<any> = ({ rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <EllipsisPopup
          text={<AppTypography.Link onClick={() => goDetail(rowData['id'])}>{rowData.title}</AppTypography.Link>}
        />
      </AppTable.Cell>
    );
  };

  const goDetail = (id: any) => {
    navigate(`/admin/customer-service/help/update/${id}`);
  };

  const makeViewFilter = () => {
    setPageNum(1);
    const tmpFinalArray: string | string[] = [];
    let getStatusFilter: string = '';
    let tmpFilterArray: string | string[] = [];
    let tmpFilter: string = '';
    let getContentTypeFilter: string = '';
    let getTotalFilter: string = '';

    // 1. 날짜
    if (selectedStatus.includes('EMBARGO')) {
      // EMBARGO = 게시대기 는 실제로 filter=publishStatus:'PUBLISHED' and publishAt >: '2022-07-19 12:30:00' (현재시간) 으로 조건이 주어져야 합니다
      getStatusFilter =
        '(' +
        getComparatorsString(':', 'publishStatus', 'PUBLISHED') +
        ' and publishAt >: ' +
        "'" +
        dayjs().format('YYYY-MM-DD HH:mm:ss') +
        "')";
      pushToArray(getStatusFilter, tmpFilterArray);
    }
    if (selectedStatus.includes('PUBLISHED')) {
      getStatusFilter =
        '(' +
        getComparatorsString(':', 'publishStatus', 'PUBLISHED') +
        ' and publishAt < ' +
        "'" +
        dayjs().format('YYYY-MM-DD HH:mm:ss') +
        "')";
      pushToArray(getStatusFilter, tmpFilterArray);
    }
    if (selectedStatus.includes('TEMP')) {
      getStatusFilter = getComparatorsString(':', 'publishStatus', 'TEMP');
      pushToArray(getStatusFilter, tmpFilterArray);
    }
    if (!isEmptyArr(tmpFilterArray)) {
      tmpFilter = '(' + getOperatorsString('or', tmpFilterArray) + ')';
    }
    // 2. 검색
    if (searchContent !== '') {
      getContentTypeFilter = getComparatorsString('~', selectedContentType, `%${searchContent}%`);
    }
    pushToArray(tmpFilter, tmpFinalArray);
    pushToArray(getContentTypeFilter, tmpFinalArray);
    // 3. 세팅
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };

  const SortHeader: React.FC<any> = ({ ...props }) => {
    return (
      <AppTable.HeaderCell {...props}>
        <div style={{ display: 'inline-flex' }}>
          <div>순서</div>
          {isDesc ? (
            <div style={{ cursor: 'pointer', width: '20px', textAlign: 'center' }} onClick={() => changeSort(false)}>
              &darr;
            </div>
          ) : (
            <div style={{ cursor: 'pointer', width: '20px', textAlign: 'center' }} onClick={() => changeSort(true)}>
              &uarr;
            </div>
          )}
        </div>
      </AppTable.HeaderCell>
    );
  };

  const changeSort = (isSortDesc: boolean) => {
    if (isSortDesc) {
      setSort('firstCategory.sort,secondCategory.sort,sort,desc');
    } else {
      setSort('firstCategory.sort,secondCategory.sort,sort');
    }
    setIsDesc(isSortDesc);
  };

  const fetchAdminHelpList = useQuery(
    ['fetchAdminHelpList', filter, sort, pageNum, pageSize],
    async () => {
      const { data } = await getAdminHelpList(filter, sort, '', pageNum, pageSize);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            created_by: item.created_by || '-',
            first_category: item.first_category || '-',
            publish_at: item.publish_status === '임시저장' ? '-' : item.publish_at,
            publish_status: item.publish_status || '-',
            second_category: item.second_category || '-',
            sort: item.sort || '-',
            title: item.title || '-',
            updated_at: item.updated_at || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setTableData(data);
      },
    }
  );

  return (
    <div>
      <AppPageHeader title={'도움말 관리'} />
      <div className="list-select-inquiry" style={{ paddingLeft: 30, paddingRight: 30 }}>
        <div style={{ display: 'flex' }}>
          <div>
            <AppCheckPicker
              placeholder={'상태: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '임시저장', value: 'TEMP' },
                { label: '게시대기', value: 'EMBARGO' },
                { label: '게시완료', value: 'PUBLISHED' },
              ]}
              value={selectedStatus}
              onChange={(value: any) => {
                setSelectedStatus(value);
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
            <AppButton
              size={'md'}
              theme={'gray'}
              type={'submit'}
              onClick={makeViewFilter}
              style={{ padding: '0 30px' }}
            >
              조회
            </AppButton>
            <AppButton
              style={{ marginLeft: '10px' }}
              size={'md'}
              theme={'create'}
              onClick={() => navigate('/admin/customer-service/help/create')}
            >
              등록
            </AppButton>
          </div>
        </div>
        <Search
          data={[
            { label: '제목', value: 'title' },
            { label: '등록자', value: 'createdBy.name' },
          ]}
          searchKey={selectedContentType}
          onSearchKeyChange={(value) => setSelectedContentType(value)}
          searchValue={searchContent}
          onSearchValueChange={setSearchContent}
          maxLength={50}
          onSearch={makeViewFilter}
        />
      </div>
      <AppTable data={tableData} className={'asset-table'} height={500}>
        <AppTable.Column width={100}>
          <SortHeader style={{ paddingLeft: 30 }} />
          <AppTable.Cell dataKey={'sort'} style={{ paddingLeft: 30 }} />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <AppTable.HeaderCell>대카테고리</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'first_category_name'} />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <AppTable.HeaderCell>중카테고리</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'second_category_name'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>제목</AppTable.HeaderCell>
          <ViewCell />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <AppTable.HeaderCell>게시상태</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'publish_status'} />
        </AppTable.Column>
        <AppTable.Column width={130}>
          <AppTable.HeaderCell>게시일시</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'publish_at'} />
        </AppTable.Column>
        <AppTable.Column width={130}>
          <AppTable.HeaderCell>최근수정일시</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'updated_at'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1} minWidth={200}>
          <AppTable.HeaderCell>작성자</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'created_by'} />
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
export default AdminCustomerServiceHelpList;
