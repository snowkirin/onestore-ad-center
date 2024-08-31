import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppPagination from '@components/AppPagination';
import { useNavigate } from 'react-router-dom';
import { isEmptyArr, pushToArray } from '@utils/functions';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { useQuery } from '@tanstack/react-query';
import { getInquiryList } from '@apis/Inquiry/list.api';
import { AppButton } from '@components/AppButton';
import dayjs from 'dayjs';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppTable from '@components/AppTable';
import AppTypography from '@components/AppTypography';
import EllipsisPopup from '@components/EllipsisPopup';
import TextCell from '@components/Common/TextCell';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import _ from 'lodash';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

interface adminCustomerServiceInquiryListProps {}

const AdminCustomerServiceInquiryList: React.FC<adminCustomerServiceInquiryListProps> = () => {
  const navigate = useNavigate();

  /* 필터 선택값 */
  const [selectedType, setSelectedType] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [selectedContentType, setSelectedContentType] = useState('title');
  const [searchContent, setSearchContent] = useState('');
  const [filter, setFilter] = useState('');

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [tableData, setTableData] = useState([]);
  const [totalNum, setTotalNum] = useState(0);
  const [date, setDate] = useState<any>([dayjs().subtract(29, 'days').toDate(), dayjs().subtract(0, 'days').toDate()]);

  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

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
    navigate(`/admin/customer-service/inquiry/detail/${id}`);
  };

  const makeViewFilter = () => {
    setPageNum(1);
    const tmpFinalArray: string | string[] = [];
    let getTypeFilter: string = '';
    let getStatusFilter: string = '';
    let getDateFilter: string = '';
    let getContentTypeFilter: string = '';
    let getTotalFilter: string = '';

    // 1. 날짜
    if (date !== null) {
      getDateFilter =
        '((' +
        getComparatorsString('>:', 'createdAt', dayjs(date[0]).format('YYYY-MM-DD') + ' 00:00:00') +
        ' and ' +
        getComparatorsString('<:', 'createdAt', dayjs(date[1]).format('YYYY-MM-DD') + ' 23:59:59') +
        ') or (' +
        getComparatorsString('>:', 'answerAt', dayjs(date[0]).format('YYYY-MM-DD') + ' 00:00:00') +
        ' and ' +
        getComparatorsString('<:', 'answerAt', dayjs(date[1]).format('YYYY-MM-DD') + ' 23:59:59') +
        '))';
    }
    // 2. 타입
    if (!isEmptyArr(selectedType)) {
      getTypeFilter = getComparatorsString('in', 'type', selectedType);
    }
    // 3. 상태
    if (!isEmptyArr(selectedStatus)) {
      getStatusFilter = getComparatorsString('in', 'status', selectedStatus);
    }
    // 4. 검색
    if (searchContent !== '') {
      getContentTypeFilter = getComparatorsString('~', selectedContentType, `%${searchContent}%`);
    }
    pushToArray(getDateFilter, tmpFinalArray);
    pushToArray(getTypeFilter, tmpFinalArray);
    pushToArray(getStatusFilter, tmpFinalArray);
    pushToArray(getContentTypeFilter, tmpFinalArray);
    // 5. 세팅
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };

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

  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };

  const fetchInquiryList = useQuery(
    ['fetchInquiryList', filter, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const { data } = await getInquiryList(filter, selectedSort, sortDirection, pageNum, pageSize);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            created_at: item.created_at || '-',
            type: item.type || '-',
            title: item.title || '-',
            advertiser_name: item.advertiser_name || '-',
            ad_account_name: item.ad_account_name || '-',
            created_by: item.created_by || '-',
            status: item.status || '-',
            answer_at: item.answer_at || '-',
            answerer: item.answerer || '-',
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
    <>
      <div>
        <AppPageHeader title={'고객문의 관리'} />
        <div className="list-select-inquiry" style={{ paddingLeft: 30, paddingRight: 30 }}>
          <div style={{ display: 'flex' }}>
            <div>
              <AppDateRangePicker
                style={{ width: '240px' }}
                value={date}
                onChange={setDate}
                cleanable={false}
              ></AppDateRangePicker>
            </div>
            <div style={{ marginLeft: '10px' }}>
              <AppCheckPicker
                placeholder={'문의유형: 전체'}
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
                placeholder={'상태: 전체'}
                size={'md'}
                cleanable={false}
                searchable={false}
                style={{ width: '150px', marginRight: '10px' }}
                data={[
                  { label: '답변대기', value: 'WAITING' },
                  { label: '임시저장', value: 'IN_REVIEW' },
                  { label: '답변완료', value: 'CLOSED' },
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
            </div>
          </div>
          <Search
            data={[
              { label: '제목', value: 'title' },
              { label: '답변자', value: 'answerer.name ' },
              { label: '문의자', value: 'createdBy.name ' },
              { label: '광고계정', value: 'adAccount.name ' },
              { label: '광고주', value: 'advertiser.advertiserName ' },
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
          <AppTable.Column width={150}>
            <SortHeader title={'문의일시'} sortName={'createdAt'} style={{ paddingLeft: 30 }} />
            <AppTable.Cell dataKey={'created_at'} style={{ paddingLeft: 30 }} />
          </AppTable.Column>
          <AppTable.Column width={100}>
            <AppTable.HeaderCell>문의 유형</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'type'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <SortHeader title={'제목'} sortName={'title'} />
            <ViewCell />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <SortHeader title={'광고주'} sortName={'advertiser.advertiserName'} />
            <TextCell dataKey={'advertiser_name'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <SortHeader title={'광고계정'} sortName={'adAccount.name'} />
            <TextCell dataKey={'ad_account_name'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <SortHeader title={'문의자'} sortName={'createdBy.name'} />
            <TextCell dataKey={'created_by'} />
          </AppTable.Column>
          <AppTable.Column width={100}>
            <SortHeader title={'답변상태'} sortName={'status'} />
            <AppTable.Cell dataKey={'status'} />
          </AppTable.Column>
          <AppTable.Column width={130}>
            <SortHeader title={'답변일시'} sortName={'answerAt'} />
            <AppTable.Cell dataKey={'answer_at'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <SortHeader title={'답변자'} sortName={'answerer.name'} />
            <TextCell dataKey={'answerer'} />
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
    </>
  );
};

export default AdminCustomerServiceInquiryList;
