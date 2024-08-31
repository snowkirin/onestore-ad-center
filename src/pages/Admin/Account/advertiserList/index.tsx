import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppPageHeader from '@components/AppPageHeader';
import { AppButton } from '@components/AppButton';
import dayjs from 'dayjs';
import numberWithCommas from '@utils/common';
import AppModal from '@components/AppModal/Modal';
import { getComparatorsString, getOperatorsString } from '@utils/filter/dynamicFilter';
import { isEmptyArr, pushToArray } from '@utils/functions';
import { getAdvertiserDetail, getAdvertiserList, reviewAdvertiserId, uploadBusinessLicense } from '@apis/account.api';
import AppTypography from '@components/AppTypography';
import AppDiver from '@components/AppDivider';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import AppRadioGroup from '@components/AppRadio';
import { useNavigate } from 'react-router-dom';
import AppUploader from '@components/AppUploader';
import DeleteIcon from '@assets/images/addIcons/multiplication-gray.svg';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppTable from '@components/AppTable';
import queryString from 'query-string';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import _ from 'lodash';
import Search from '@components/Search';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';
import AppPagination from '@components/AppPagination';

interface AdminAccountAdvertiserListProps {}

const AdminAccountAdvertiserList: React.FC<AdminAccountAdvertiserListProps> = () => {
  const role = sessionStorage.getItem('role');

  const URLParams = queryString.parse(location.search);
  const status = URLParams.status;
  const navigate = useNavigate();

  // 검색
  const [searchType, setSearchType] = useState('advertiserName');
  const [searchText, setSearchText] = useState<any>('');

  // 셀렉트 박스
  const [date, setDate] = useState<any>([dayjs('2022-01-01').toDate(), dayjs().subtract(0, 'days').toDate()]);
  const [reviewStatus, setReviewStatus] = useState<any>([]);
  const [advertiserStatus, setAdvertiserStatus] = useState<any>([]);
  const [advertiserType, setAdvertiserType] = useState<any>([]);

  // 필터
  const [filter, setFilter] = useState('');

  const [advertiserList, setAdvertiserList] = useState<any>([]);

  // 정렬
  const [selectedSort, setSelectedSort] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // 페이징
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);

  const [open, setOpen] = useState(false);

  // 광고주 상세
  const [detailId, setDetailId] = useState('');
  const [advertiserDetail, setAdvertiserDetail] = useState<any>({});

  // 검수할때 저장값
  const [rejectReason, setRejectReason] = useState('');
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [businessLicenseFileName, setBusinessLicenseUrlFileName] = useState('');
  const [reviewStatusValue, setReviewStatusValue] = useState('WAITING');
  const [isFile, setIsFile] = useState<boolean>(false);
  const [isUpload, setIsUpload] = useState<boolean>(true);

  const [file, setFile] = useState('');

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
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

  const AdvertiserCell: React.FC<any> = ({ rowData, dataKey, onDetail, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <AppTypography.Link
          onClick={() => {
            navigate(`/admin/account/user?advertiserName=${rowData.name}`);
          }}
        >
          {rowData[dataKey!]}
        </AppTypography.Link>
      </AppTable.Cell>
    );
  };

  const ViewCell: React.FC<any> = ({ dataKey, rowData, ...props }) => {
    let name = rowData[dataKey] === '검수 대기' ? '검수' : rowData[dataKey] === '승인' ? '수정' : '보기';
    return (
      <AppTable.Cell {...props} className="link-group">
        <AppTypography.Link
          onClick={() =>
            rowData[dataKey] === '검수 대기'
              ? setModal(rowData['id'])
              : rowData[dataKey] === '승인'
              ? goDetail(rowData['id'], 'update')
              : goDetail(rowData['id'], 'failed')
          }
        >
          {name}
        </AppTypography.Link>
      </AppTable.Cell>
    );
  };

  const StatusCell: React.FC<any> = ({ dataKey, rowData, ...props }) => {
    let color = rowData[dataKey] === '검수 대기' ? 'orange' : rowData[dataKey] === '승인' ? 'green' : 'red';
    return (
      <AppTable.Cell {...props} className="link-group">
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <div className={'status-circle-' + color} style={{ marginRight: '8px' }}></div>
          <div>{rowData[dataKey]}</div>
        </div>
      </AppTable.Cell>
    );
  };

  const ValueCell: React.FC<any> = ({ dataKey, rowData, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <div>{numberWithCommas(rowData[dataKey])}</div>
      </AppTable.Cell>
    );
  };

  const setModal = (id: any) => {
    if (advertiserDetail.business_license_file_name !== '' && advertiserDetail.business_license_file_name !== null) {
      setIsFile(true);
    } else {
      setIsFile(false);
    }
    setIsUpload(false);
    setDetailId(id);
    handleModalOpen();
  };

  const goDetail = (id: any, menu: any) => {
    navigate(`/admin/account/advertiser/${menu}/${id}`);
  };

  const changeSort = (type: string, direction: string) => {
    setSortDirection(direction);
    setSelectedSort(type);
  };

  const makeViewFilter = () => {
    setPageNum(1);
    const tmpArray: string | string[] = [];
    const tmpFinalArray: string | string[] = [];
    //기간
    let getDateFilter: string = '';
    //검수 상태
    let getReviewStatusFilter: string = '';
    //광고주 상태
    let getAdvertiserStatusFilter: string = '';
    //광고주 유형
    let getAdvertiserTypeFilter: string = '';
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
    // 2. 검수 상태
    if (!isEmptyArr(reviewStatus)) {
      getReviewStatusFilter = getComparatorsString('in', 'reviewStatus', reviewStatus);
    }
    // 3. 광고주 상태
    if (!isEmptyArr(advertiserStatus)) {
      getAdvertiserStatusFilter = getComparatorsString('in', 'enabled', advertiserStatus);
    }
    // 4. 광고주 유형
    if (!isEmptyArr(advertiserType)) {
      getAdvertiserTypeFilter = getComparatorsString('in', 'type', advertiserType);
    }
    // 5. 검색
    if (searchType === 'advertiserName') {
      getSearchTypeFilter = getComparatorsString('~', 'advertiserName', `%${searchText}%`);
    } else if (searchType === 'birthday') {
      pushToArray(getComparatorsString('~', 'businessLicenseNumber ', `%${searchText}%`), tmpArray);
      pushToArray(getComparatorsString('~', 'birthday', `%${searchText}%`), tmpArray);
      getSearchTypeFilter = '(' + getOperatorsString('or', tmpArray) + ')';
    } else if (searchType === 'reviewer') {
      pushToArray(getComparatorsString('~', 'reviewer.name', `%${searchText}%`), tmpArray);
      pushToArray(getComparatorsString('~', 'reviewer.signinId', `%${searchText}%`), tmpArray);
      getSearchTypeFilter = '(' + getOperatorsString('or', tmpArray) + ')';
    }
    pushToArray(getDateFilter, tmpFinalArray);
    pushToArray(getReviewStatusFilter, tmpFinalArray);

    pushToArray(getAdvertiserStatusFilter, tmpFinalArray);
    pushToArray(getAdvertiserTypeFilter, tmpFinalArray);
    pushToArray(getSearchTypeFilter, tmpFinalArray);
    // 5. 세팅
    getTotalFilter = getOperatorsString('and', tmpFinalArray);
    setFilter(encodeURIComponent(getTotalFilter));
  };

  const deleteFile = () => {
    setIsFile(false);
    setIsUpload(false);
  };

  const cancelFile = () => {
    handleModalClose();
  };

  const fetchAdvertiserList = useQuery(
    ['fetchAdvertiserList', filter, selectedSort, sortDirection, pageNum, pageSize],
    async () => {
      const pageParams = {
        page: pageNum,
        size: pageSize,
      };
      const sortParams = {
        sortType: selectedSort,
        direction: sortDirection,
      };
      const { data } = await getAdvertiserList(filter, pageParams, sortParams);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            identity_number: item.identity_number || '-',
            reviewer: item.reviewer || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setAdvertiserList(data);
      },
    }
  );

  const fetchAdvertiserDetail = useQuery(
    ['fetchAdvertiserDetail', detailId],
    async () => {
      const { data } = await getAdvertiserDetail(detailId);
      if (data) {
        return {
          ...data,
          identity_number: data.identity_number || '-',
        };
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        if (data.business_license_file_name !== null && data.business_license_file_name !== '') {
          setIsFile(true);
        } else {
          setIsFile(false);
        }
        setAdvertiserDetail(data);
        const status =
          data.review_status === '승인' ? 'APPROVED' : data.review_status === '반려' ? 'DISAPPROVED' : 'WAITING';
        setReviewStatusValue(status);
        if (data.reject_reason !== null) {
          setRejectReason(data.reject_reason);
        } else {
          setRejectReason('');
        }
      },
    }
  );

  const handleShouldQueueUpdate = (file: any) => {
    const size = Number(file[0].blobFile.size / 1024).toFixed(2);
    const reg = /(.*?)\.(jpg|jpeg|png|pdf)$/;
    if (Number(size) > 1024) {
      alert('파일 용량은 최대 1MB까지 업로드할 수 있습니다.');
      return false;
    } else if (!file[0].name.match(reg)) {
      alert('jpg, png, pdf 파일만 업로드할 수 있습니다.');
      return false;
    } else {
      return true;
    }
  };

  const fetchUploadFile = async (file: any) => {
    const formData = new FormData();
    if (file.length > 0) {
      setIsUpload(true);
      formData.append('business_license_file', file[0].blobFile);
      setFile(file[0].blobFile);
      uploadBusinessLicense(formData).then((res: any) => {
        if (res.status === 200) {
          const { data } = res;
          setBusinessLicenseUrl(data.file_path);
          setBusinessLicenseUrlFileName(data.file_name);
        }
      });
    } else {
      setIsUpload(false);
    }
  };

  const fetchSaveReview = async () => {
    if (reviewStatusValue === 'APPROVED') {
      if (!confirm('광고주를 승인하시겠습니까?')) {
        return;
      }
    } else if (reviewStatusValue === 'DISAPPROVED') {
      if (rejectReason === '') {
        alert('반려 사유를 입력해 주세요.');
        return;
      }
      if (!confirm('광고주를 반려하시겠습니까?')) {
        return;
      }
    }

    const params = {
      review_status: reviewStatusValue,
      reject_reason: rejectReason,
      business_license_file_name: isUpload ? businessLicenseFileName : '',
    };
    const blob = new Blob([JSON.stringify(params)], { type: 'application/json' });

    let form = new FormData();
    if (file !== '') {
      form.append('business_license_file', file);
    }
    form.append('param', blob);

    reviewAdvertiserId(detailId, form).then((res: any) => {
      if (res) {
        if (reviewStatusValue === 'APPROVED') {
          alert('광고주를 승인하였습니다.');
        } else if (reviewStatusValue === 'DISAPPROVED') {
          alert('광고주를 반려하였습니다.');
        }
        location.reload();
      }
    });
  };

  useEffect(() => {
    if (status === 'WAITING') {
      setReviewStatus(['WAITING']);
      makeViewFilter();
    }
  }, [status]);
  useEffect(() => {
    if (status === 'WAITING') {
      makeViewFilter();
    }
  }, [reviewStatus]);

  return (
    <div>
      <AppPageHeader title={'광고주'} />
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
              placeholder={'검수 상태: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '검수 대기', value: 'WAITING' },
                { label: '승인', value: 'APPROVED' },
                { label: '반려', value: 'DISAPPROVED' },
              ]}
              value={reviewStatus}
              onChange={(value: any) => {
                setReviewStatus(value);
              }}
              renderValue={(value, item: any) => {
                return (
                  <span>
                    <span style={{ marginRight: 5 }}>검수 상태:</span>
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
            <AppCheckPicker
              placeholder={'광고주 상태: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '활성', value: 'true' },
                { label: '비활성', value: 'false' },
              ]}
              value={advertiserStatus}
              onChange={(value: any) => {
                setAdvertiserStatus(value);
              }}
              renderValue={(value, item: any) => {
                return (
                  <span>
                    <span style={{ marginRight: 5 }}>광고주 상태:</span>
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
              placeholder={'광고주 유형: 전체'}
              size={'md'}
              cleanable={false}
              searchable={false}
              style={{ width: '150px', marginRight: '10px' }}
              data={[
                { label: '사업자', value: 'BUSINESS' },
                { label: '개인', value: 'PERSONAL' },
              ]}
              value={advertiserType}
              onChange={(value: any) => {
                setAdvertiserType(value);
              }}
              renderValue={(value, item: any) => {
                return (
                  <span>
                    <span style={{ marginRight: 5 }}>광고주 유형:</span>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingTop: 14,
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700 }}>조회 결과 (총 {totalNum}개)</div>
        <Search
          data={[
            { label: '광고주명', value: 'advertiserName' },
            { label: '사업자등록번호/생년월일', value: 'birthday' },
            { label: '검수자', value: 'reviewer' },
          ]}
          searchKey={searchType}
          onSearchKeyChange={(value) => setSearchType(value)}
          searchValue={searchText}
          onSearchValueChange={setSearchText}
          onSearch={makeViewFilter}
        />
      </div>
      <AppTable data={advertiserList} className={'asset-table'} height={500}>
        <AppTable.Column width={170}>
          <SortHeader style={{ paddingLeft: 30 }} title={'가입 신청 일시'} sortName={'createdAt'} />
          <AppTable.Cell style={{ paddingLeft: 30 }} dataKey={'created_at'} />
        </AppTable.Column>
        <AppTable.Column width={130}>
          <SortHeader title={'검수 상태'} sortName={'reviewStatus'} />
          <StatusCell dataKey={'review_status'} />
        </AppTable.Column>
        <AppTable.Column width={130}>
          <SortHeader title={'광고주 상태'} sortName={'enabled'} />
          <AppTable.Cell dataKey={'enabled'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'광고주 유형'} sortName={'type'} />
          <AppTable.Cell dataKey={'type'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'광고주명'} sortName={'advertiserName'} />
          <AppTable.Cell dataKey={'name'} />
          {/*<AdvertiserCell dataKey={'name'} />*/}
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>사업자등록번호/생년월일</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'identity_number'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <SortHeader title={'검수자'} sortName={'reviewer.name'} />
          <AppTable.Cell dataKey={'reviewer'} />
        </AppTable.Column>
        <AppTable.Column width={100}>
          <AppTable.HeaderCell>관리</AppTable.HeaderCell>
          <ViewCell dataKey={'review_status'} />
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
      <AppModal open={open} onClose={handleModalClose}>
        <AppModal.Header>
          <AppModal.Title>광고주 검수</AppModal.Title>
        </AppModal.Header>
        <AppModal.Body>
          {/* 광고주 정보 */}
          <div>
            <div>
              <AppTypography.SubTitle level={1}>광고주 정보</AppTypography.SubTitle>
            </div>
            <AppDiver />
            <div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고주 유형</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.type || '-'}</AppTypography.Text>
                </div>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.name || '-'}</AppTypography.Text>
                </div>
              </div>
              {advertiserDetail.type === '사업자' ? (
                <>
                  <div className={'row'}>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>사업자등록번호</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                      <AppTypography.Text className={'text'}>
                        {advertiserDetail.identity_number || '-'}
                      </AppTypography.Text>
                    </div>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>사업자등록증</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                      {isFile ? (
                        <AppTypography.Text className={'text'}>
                          {advertiserDetail.business_license_file_name || '-'}
                          <img
                            src={DeleteIcon}
                            onClick={deleteFile}
                            style={{ cursor: 'pointer', marginLeft: '10px' }}
                            alt={'삭제'}
                          />
                        </AppTypography.Text>
                      ) : (
                        <div className={'advertiser-fileUpload'}>
                          <form style={{ height: 32 }}>
                            <AppUploader
                              action={''}
                              multiple={false}
                              autoUpload={false}
                              onChange={fetchUploadFile}
                              accept={'jpg,, jpeg, png, pdf'}
                              shouldQueueUpdate={(fileList) => handleShouldQueueUpdate(fileList)}
                            >
                              {isUpload ? (
                                <div
                                  style={{
                                    display: 'none',
                                  }}
                                />
                              ) : (
                                <AppButton size={'md'}>업로드</AppButton>
                              )}
                            </AppUploader>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={'row'}>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>대표자명</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                      <AppTypography.Text className={'text'}>{advertiserDetail.owner_name || '-'}</AppTypography.Text>
                    </div>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>사업자 주소</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                      <AppTypography.Text className={'text'}>{advertiserDetail.address || '-'}</AppTypography.Text>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={'row'}>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>식별번호</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                      <AppTypography.Text className={'text'}>{detailId || '-'}</AppTypography.Text>
                    </div>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>생년월일</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                      <AppTypography.Text className={'text'}>
                        {advertiserDetail.identity_number || '-'}
                      </AppTypography.Text>
                    </div>
                  </div>
                  <div className={'row'}>
                    <div className={'col col-label'}>
                      <AppTypography.Label className={'text'}>주소</AppTypography.Label>
                    </div>
                    <div className={'col col-input'} style={{ flex: '1 0 auto', width: 'auto' }}>
                      <AppTypography.Text className={'text'}>{advertiserDetail.address || '-'}</AppTypography.Text>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 사용자 정보 */}
          <div style={{ marginTop: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AppTypography.SubTitle level={1}>사용자 정보</AppTypography.SubTitle>
              <AppTypography.Text type={'sub'} style={{ marginLeft: 10 }}>
                *검수 완료 이후에는 조직/계정 &gt; 사용자 메뉴에서 확인 가능합니다.
              </AppTypography.Text>
            </div>
            <AppDiver />
            <div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>아이디</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.signin_id || '-'}</AppTypography.Text>
                </div>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>이름</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.account_name || '-'}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>이메일</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.account_email || '-'}</AppTypography.Text>
                </div>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>휴대폰 번호</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.account_tel || '-'}</AppTypography.Text>
                </div>
              </div>
            </div>
          </div>

          {/* 검수 정보 */}
          <div style={{ marginTop: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AppTypography.Label style={{ flex: '0 0 120px', fontSize: '16px' }}>검수 정보</AppTypography.Label>
              {role !== 'ADMIN' && (
                <AppTypography.Text type={'sub'} style={{ marginLeft: 10 }}>
                  *광고주 검수는 운영자만 가능합니다.
                </AppTypography.Text>
              )}
            </div>
            <AppDiver />
            <div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>가입 신청 일시</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppTypography.Text className={'text'}>{advertiserDetail.created_at || '-'}</AppTypography.Text>
                </div>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>검수 상태</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 'calc(50% - 120px)' }}>
                  <AppRadioGroup
                    disabled={role !== 'ADMIN'}
                    inline
                    data={[
                      { label: '검수 대기', value: 'WAITING' },
                      { label: '승인', value: 'APPROVED' },
                      { label: '반려', value: 'DISAPPROVED' },
                    ]}
                    value={reviewStatusValue}
                    onChange={(value: any) => {
                      setReviewStatusValue(value);
                    }}
                  />
                </div>
              </div>
              {role === 'ADMIN' && (
                <div className={'row'}>
                  <div className={'col col-label'}>
                    <AppTypography.Label className={'text'}>반려 사유</AppTypography.Label>
                  </div>
                  <div className={'col col-input'} style={{ flex: '1 0 auto', width: 'auto' }}>
                    <AppInputTextArea
                      as="textarea"
                      maxLength={200}
                      height={100}
                      onInput={(e: any) => {
                        setRejectReason(e.target.value);
                      }}
                      value={rejectReason}
                      disabled={reviewStatusValue === 'APPROVED'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </AppModal.Body>
        <AppModal.Footer>
          {role === 'ADMIN' ? (
            <>
              <AppButton style={{ width: 60 }} size={'md'} onClick={cancelFile} appearance="primary">
                취소
              </AppButton>
              <AppButton theme={'red'} style={{ width: 60 }} size={'md'} onClick={fetchSaveReview} appearance="primary">
                저장
              </AppButton>
            </>
          ) : (
            <AppButton onClick={cancelFile} style={{ width: 60 }} size={'md'} appearance="primary">
              닫기
            </AppButton>
          )}
        </AppModal.Footer>
      </AppModal>
    </div>
  );
};

export default AdminAccountAdvertiserList;
