import React, { useCallback, useState } from 'react';
import { AppButton } from '@components/AppButton';
import { getProductList } from '@apis/product.api';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import AppTable from '@components/AppTable';
import EllipsisPopup from '@components/EllipsisPopup';
import AppTypography from '@components/AppTypography';
import Search from '@components/Search';

interface AppListProps {}

const AppList: React.FC<AppListProps> = () => {
  // Variables
  let navigate = useNavigate();

  const [tmpSearchText, setTmpSearchText] = useState('');
  const [searchText, setSearchText] = useState('');

  // adAccountId
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const handleApplySearchClick = useCallback(() => {
    setSearchText(tmpSearchText);
  }, [tmpSearchText]);

  const fetchAppList = useQuery(
    ['fetchAppList', selectedAdAccount, searchText],
    async () => {
      const params = {
        ad_account_id: selectedAdAccount,
      };
      const { data } = await getProductList(params);
      if (data.products && data.products.length !== 0) {
        return _.sortBy(
          data.products
            .map((item: any) => {
              return {
                ...item,
                status: item.app.mmp_integration.status.toLowerCase(),
                created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
                updated_at: dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss'),
              };
            })
            .filter((item: any) => {
              return item.title.includes(searchText);
            }),
          'created_at'
        ).reverse();
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  const ViewCell: React.FC<any> = ({ rowData, dataKey, ...props }) => {
    return (
      <AppTable.Cell {...props} className="link-group">
        <EllipsisPopup
          text={<AppTypography.Link onClick={() => goDetail(rowData[dataKey])}>{rowData.title}</AppTypography.Link>}
        />
      </AppTable.Cell>
    );
  };

  const goDetail = (id: string) => {
    navigate(`/assets/app/detail/${id}`);
  };

  return (
    <div>
      <AppPageHeader title={'앱'} />
      <div className="list-select">
        <div>
          <AppButton size={'md'} theme={'create'} onClick={() => navigate('/assets/app/create')}>
            생성
          </AppButton>
        </div>
        <Search
          data={[{ label: '앱 이름', value: 'title' }]}
          searchKey={'title'}
          searchValue={tmpSearchText}
          onSearchValueChange={setTmpSearchText}
          maxLength={50}
          onSearch={handleApplySearchClick}
        />
      </div>
      <AppTable data={fetchAppList.data} className={'asset-table'} height={800} loading={fetchAppList.isFetching}>
        <AppTable.Column flexGrow={1} minWidth={200}>
          <AppTable.HeaderCell style={{ paddingLeft: 30 }}>앱 이름</AppTable.HeaderCell>
          <ViewCell dataKey={'id'} style={{ paddingLeft: 30 }} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1} minWidth={100}>
          <AppTable.HeaderCell>상태</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'status'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>앱 번들 ID</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'app.bundle_id'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>MMP</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'app.postback_integration.mmp'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1} minWidth={180}>
          <AppTable.HeaderCell>MMP 번들 ID</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'app.mmp_integration.mmp_bundle_id'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>생성일시&darr;</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'created_at'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell style={{ paddingRight: 30 }}>수정일시</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'updated_at'} style={{ paddingRight: 30 }} />
        </AppTable.Column>
      </AppTable>
    </div>
  );
};

export default AppList;
