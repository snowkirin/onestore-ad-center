import React, { useMemo, useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppTable from '@components/AppTable';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { getAudienceTargetList } from '@apis/audience_target.api';
import AppTypography from '@components/AppTypography';
import dayjs from 'dayjs';
import styled from 'styled-components';
import Search from '@components/Search';

interface AudienceTargetListProps {}

type SortType = 'asc' | 'desc' | undefined;

const StyledAudienceTargetList = styled.div`
  .status__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px 14px;
  }
`;

const searchTypeList = [
  {
    label: '맞춤 타겟명',
    value: 'title',
  },
];

const AudienceTargetList: React.FC<AudienceTargetListProps> = () => {
  let navigate = useNavigate();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const [filterParams, setFilterParams] = useState<{
    searchValue: string;
    searchType: string;
    sortColumn: string;
    sortType: SortType;
  }>({
    searchType: 'title',
    searchValue: '',
    sortColumn: '',
    sortType: undefined,
  });

  const [tmpSearchValue, setTmpSearchValue] = useState('');
  const [tmpSearchType, setTmpSearchType] = useState('title');

  const fetchAudienceTargetList = useQuery(
    ['fetchAudienceTargetList'],
    async () => {
      const { data } = await getAudienceTargetList({
        ad_account_id: selectedAdAccount,
        inquiry_option: 'INQUIRY_OVERVIEW',
      });
      if (data.audience_target_overviews && data.audience_target_overviews.length !== 0) {
        return data.audience_target_overviews;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  const handleCreateAudienceTargetClick = () => {
    navigate('create');
  };

  const handleEditAudienceTargetClick = (rowData: any) => {
    const audience_target_id = rowData.audience_target.id;
    navigate(`detail/${audience_target_id}`);
  };

  const handleFilterParamsApply = () => {
    setFilterParams((prevState) => ({
      ...prevState,
      searchType: tmpSearchType,
      searchValue: tmpSearchValue,
    }));
  };

  const handleSortColumn = (sortColumn: string, sortType: SortType | undefined) => {
    setFilterParams((prevState) => ({
      ...prevState,
      sortColumn,
      sortType,
    }));
  };

  const filteredAudienceTargetList = useMemo(() => {
    return _.chain(fetchAudienceTargetList.data)
      .filter((item) => {
        // 대소문자 구분없이 검색 가능하게.
        return item.audience_target[filterParams.searchType]
          .toLowerCase()
          .includes(filterParams.searchValue.toLowerCase());
      })
      .orderBy([filterParams.sortColumn], [filterParams.sortType || false])
      .value();
  }, [fetchAudienceTargetList, filterParams]);

  return (
    <StyledAudienceTargetList>
      <AppPageHeader title={'맞춤 타겟'} />
      <div className={'status__wrapper'}>
        <div>
          <AppButton size={'md'} theme={'create'} onClick={handleCreateAudienceTargetClick}>
            생성
          </AppButton>
        </div>
        <div>
          <Search
            data={searchTypeList}
            maxLength={255}
            searchKey={tmpSearchType}
            onSearchKeyChange={(value) => setTmpSearchType(value)}
            searchValue={tmpSearchValue}
            onSearchValueChange={(value) => setTmpSearchValue(value)}
            onSearch={handleFilterParamsApply}
          />
        </div>
      </div>
      <AppTable
        data={filteredAudienceTargetList}
        loading={fetchAudienceTargetList.isFetching}
        autoHeight
        sortColumn={filterParams.sortColumn}
        sortType={filterParams.sortType}
        onSortColumn={handleSortColumn}
      >
        <AppTable.Column flexGrow={1} sortable={true}>
          <AppTable.HeaderCell style={{ paddingLeft: 30 }}>맞춤 타겟명</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'audience_target.title'} style={{ paddingLeft: 30 }}>
            {(rowData: any) => {
              return (
                <AppTypography.Link onClick={() => handleEditAudienceTargetClick(rowData)}>
                  {rowData.audience_target.title}
                </AppTypography.Link>
              );
            }}
          </AppTable.Cell>
        </AppTable.Column>
        <AppTable.Column flexGrow={1} sortable={true}>
          <AppTable.HeaderCell>타겟 조건</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'audience_target.targeting_condition'}>
            {(rowData) => {
              const keys = Object.keys(rowData.audience_target.targeting_condition);
              const customAudienceSet = rowData.audience_target.targeting_condition.custom_audience_set;
              const isExistCustomAudience =
                customAudienceSet &&
                (!_.isEmpty(customAudienceSet.exclude_having_all) ||
                  !_.isEmpty(customAudienceSet.exclude_having_any) ||
                  !_.isEmpty(customAudienceSet.include_having_all) ||
                  !_.isEmpty(customAudienceSet.include_having_any))
                  ? '커스텀 오디언스'
                  : null;
              const multipleExist = (arr: any[], values: any[]) => {
                return values.some((value) => {
                  return arr.includes(value);
                });
              };
              let result = [
                // multipleExist(['custom_audience_set'], keys) ? '커스텀 오디언스' : null,
                isExistCustomAudience,
                multipleExist(['allowed_languages', 'blocked_languages'], keys) ? '언어' : null,
                multipleExist(
                  [
                    'allowed_location_set',
                    'blocked_location_set',
                    'allowed_locations',
                    'blocked_locations',
                    'allowed_cities',
                    'blocked_cities',
                    'allowed_countries',
                    'blocked_countries',
                  ],
                  keys
                )
                  ? '위치'
                  : null,
                multipleExist(['device_oses'], keys) ? 'OS 및 버전' : null,
                multipleExist(['connection_types'], keys) ? '네트워크' : null,
              ].filter((v) => v);
              return result.length === 0 ? '-' : result.join(', ');
            }}
          </AppTable.Cell>
        </AppTable.Column>
        <AppTable.Column sortable={true} width={165}>
          <AppTable.HeaderCell>수정일시</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'audience_target.updated_at'}>
            {(rowData) => <>{dayjs(rowData.audience_target.updated_at).format('YYYY-MM-DD HH:mm:ss')}</>}
          </AppTable.Cell>
        </AppTable.Column>
      </AppTable>
    </StyledAudienceTargetList>
  );
};

export default AudienceTargetList;
