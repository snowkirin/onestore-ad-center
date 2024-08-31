import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInquiryList } from '@apis/Inquiry/list.api';
import AppPageHeader from '@components/AppPageHeader';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import AppPagination from '@components/AppPagination';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { isEmptyArr, pushToArray } from '@utils/functions';
import AppTable from '@components/AppTable';
import EllipsisPopup from '@components/EllipsisPopup';
import AppTypography from '@components/AppTypography';
import Search from '@components/Search';
import _ from 'lodash';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface CustomerServiceInquiryProps {}

const CustomerServiceInquiry: React.FC<CustomerServiceInquiryProps> = () => {
  const navigate = useNavigate();

  /* 필터 선택값 */
  const [selectedType, setSelectedType] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [selectedContentType, setSelectedContentType] = useState('title');
  const [searchContent, setSearchContent] = useState('');
  const [filter, setFilter] = useState('');
  const [isDesc, setIsDesc] = useState(true);
  const [sort, setSort] = useState('createdAt,desc');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [tableData, setTableData] = useState([]);
  const [totalNum, setTotalNum] = useState(0);

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
    navigate(`/customer-service/inquiry/detail/${id}`);
  };

  const makeViewFilter = () => {
    setPageNum(1);
    const tmpFinalArray: string | string[] = [];
    let tmpSelectedStatus: string | string[] = [];
    let getTypeFilter: string = '';
    let getStatusFilter: string = '';
    let getContentTypeFilter: string = '';
    let getTotalFilter: string = '';

    // 1. 타입
    if (!isEmptyArr(selectedType)) {
      getTypeFilter = getComparatorsString('in', 'type', selectedType);
    }
    // 2. 상태
    if (!isEmptyArr(selectedStatus)) {
      // WAITING을 갖고 있을때 IN_REVIEW도 추가
      if (selectedStatus.includes('WAITING')) {
        selectedStatus.push('IN_REVIEW');
      }
      getStatusFilter = getComparatorsString('in', 'status', selectedStatus);
      // 리뷰 제외
      tmpSelectedStatus = selectedStatus.filter((value: any) => {
        return value !== 'IN_REVIEW';
      });
      setSelectedStatus(tmpSelectedStatus);
    }
    // 3. 검색
    if (searchContent !== '') {
      getContentTypeFilter = getComparatorsString('~', selectedContentType, `%${searchContent}%`);
    }
    pushToArray(getTypeFilter, tmpFinalArray);
    pushToArray(getStatusFilter, tmpFinalArray);
    pushToArray(getContentTypeFilter, tmpFinalArray);
    // 4. 세팅
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };

  const SortHeader: React.FC<any> = ({ ...props }) => {
    return (
      <AppTable.HeaderCell align={'center'} {...props}>
        <div style={{ display: 'inline-flex' }}>
          <div>등록일</div>
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
      setSort('createdAt,desc');
    } else {
      setSort('createdAt,asc');
    }
    setIsDesc(isSortDesc);
  };

  const fetchInquiryList = useQuery(
    ['fetchInquiryList', filter, sort, pageNum, pageSize],
    async () => {
      const { data } = await getInquiryList(filter, sort, '', pageNum, pageSize);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            type: item.type || '-',
            title: item.title || '-',
            status: item.status || '-',
            created_at: item.created_at || '-',
            created_by: item.created_by || '-',
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
      <AppPageHeader title={'고객문의'} />
      <div className="list-select-inquiry" style={{ padding: '0 30px' }}>
        <div style={{ display: 'flex' }}>
          <AppButton size={'md'} theme={'create'} onClick={() => navigate('/customer-service/inquiry/create')}>
            등록
          </AppButton>
          <div style={{ marginLeft: '10px' }}>
            <AppCheckPicker
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '계정', value: 'ACCOUNT' },
                { label: '광고계정', value: 'AD_ACCOUNT' },
                { label: '캠페인', value: 'CAMPAIGN' },
                { label: '소재', value: 'CREATIVE' },
                { label: '자산 관리', value: 'ASSET' },
                { label: '리포트', value: 'REPORT' },
                { label: '정산', value: 'INVOICE' },
                { label: '기타문의', value: 'ETC' },
              ]}
              value={selectedType}
              onChange={(value: any) => {
                setSelectedType(value);
              }}
              placeholder={'문의유형: 전체'}
              renderValue={(value, item: any) => {
                return (
                  <span>
                    <span style={{ marginRight: 5 }}>문의유형:</span>
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
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '확인중', value: 'WAITING' },
                { label: '답변완료', value: 'CLOSED' },
              ]}
              value={selectedStatus}
              onChange={(value: any) => {
                setSelectedStatus(value);
              }}
              placeholder={'상태: 전체'}
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
        <AppTable.Column align={'left'} flexGrow={0.5}>
          <AppTable.HeaderCell style={{ paddingLeft: 30 }}>문의 유형</AppTable.HeaderCell>
          <AppTable.Cell style={{ paddingLeft: 30 }} dataKey={'type'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1} minWidth={300} align={'left'}>
          <AppTable.HeaderCell align={'center'}>제목</AppTable.HeaderCell>
          <ViewCell />
        </AppTable.Column>
        <AppTable.Column align={'left'} flexGrow={0.5}>
          <AppTable.HeaderCell>상태</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'status'} />
        </AppTable.Column>
        <AppTable.Column align={'left'} flexGrow={0.7}>
          <SortHeader />
          <AppTable.Cell dataKey={'created_at'} />
        </AppTable.Column>
        <AppTable.Column align={'left'} flexGrow={0.8}>
          <AppTable.HeaderCell>등록자</AppTable.HeaderCell>
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
            size="sm"
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

export default CustomerServiceInquiry;
