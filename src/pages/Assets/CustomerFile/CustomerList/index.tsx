import React, { useCallback, useState } from 'react';
import { AppButton } from '@components/AppButton';
import { getCustomerFile } from '@apis/customer_file.api';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import AppTable from '@/components/AppTable';
import EllipsisPopup from '@components/EllipsisPopup';
import AppTypography from '@components/AppTypography';
import Search from '@components/Search';
import _ from 'lodash';

interface CustomerListProps {}

const CustomerList: React.FC<CustomerListProps> = () => {
  // Variables
  let navigate = useNavigate();
  // adAccountId
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const [tmpSearchText, setTmpSearchText] = useState('');
  const [searchText, setSearchText] = useState('');

  const handleApplySearchClick = useCallback(() => {
    setSearchText(tmpSearchText);
  }, [tmpSearchText]);

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
    navigate(`/assets/customer-file/detail/${id}/${selectedAdAccount}`);
  };

  const fetchCustomerList = useQuery(
    ['fetchCustomerList', selectedAdAccount, searchText],
    async () => {
      const params = {
        ad_account_id: selectedAdAccount,
      };
      const { data } = await getCustomerFile(params);
      if (Object.keys(data).length !== 0) {
        return data.customer_sets
          .map((item: any) => {
            return {
              ...item,
              status: item.status.toLowerCase(),
              created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
              updated_at: dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss'),
            };
          })
          .filter((item: any) => {
            return item.title.includes(searchText);
          });
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  return (
    <div>
      <AppPageHeader title={'고객 파일'} />
      <div className="list-select">
        <div>
          <AppButton size={'md'} theme={'create'} onClick={() => navigate('/assets/customer-file/create')}>
            생성
          </AppButton>
        </div>
        <Search
          data={[{ label: '고객파일명', value: 'title' }]}
          searchKey={'title'}
          searchValue={tmpSearchText}
          onSearchValueChange={setTmpSearchText}
          maxLength={50}
          onSearch={handleApplySearchClick}
        />
      </div>
      <AppTable
        data={fetchCustomerList.data}
        loading={fetchCustomerList.isFetching}
        className={'asset-table'}
        height={800}
      >
        <AppTable.Column flexGrow={1} minWidth={310}>
          <AppTable.HeaderCell style={{ paddingLeft: 30 }}>고객 파일명</AppTable.HeaderCell>
          <ViewCell style={{ paddingLeft: 30 }} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1} minWidth={210}>
          <AppTable.HeaderCell>상태</AppTable.HeaderCell>
          <AppTable.Cell dataKey={'status'} />
        </AppTable.Column>
        <AppTable.Column flexGrow={1}>
          <AppTable.HeaderCell>생성일시</AppTable.HeaderCell>
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

export default CustomerList;
