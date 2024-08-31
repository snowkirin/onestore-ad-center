import React, { useCallback, useState } from 'react';
import _ from 'lodash';
import AppPageHeader from '@components/AppPageHeader';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { useQuery } from '@tanstack/react-query';
import { getProductList } from '@apis/product.api';
import AppTable from '@/components/AppTable';
import { getCreativeGroupList } from '@apis/creative_group.api';
import AppTypography from '@components/AppTypography';
import DateCell from '@components/Common/DateCell';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import Search from '@components/Search';
import { Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import { sortByCaseInsensitive } from '@utils/functions';

interface CreativeGroupListProps {}

const CreativeGroupList: React.FC<CreativeGroupListProps> = () => {
  const navigate = useNavigate();
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearchValue, setAppliedSearchValue] = useState('');
  const { data: productList } = useQuery(
    ['getProductList', selectedAdAccount],
    async () => {
      const { data } = await getProductList({ ad_account_id: selectedAdAccount });
      if (data.products && data.products.length !== 0) {
        const sortProductsList = sortByCaseInsensitive(data.products, 'title', 'asc');
        setSelectedProduct(sortProductsList[0].id);
        return sortProductsList;
      } else {
        setSelectedProduct('');
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  const creativeGroupList = useQuery(
    ['getCreativeGroupList', selectedProduct],
    async () => {
      const { data } = await getCreativeGroupList({
        ad_account_id: selectedAdAccount,
        product_id: selectedProduct,
        inquiry_option: 'INQUIRY_OVERVIEW',
      });
      if (data.creative_group_overviews && data.creative_group_overviews.length !== 0) {
        return data.creative_group_overviews;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(selectedProduct),
    }
  );

  const onClickCreateCreativeGroup = () => {
    const currentProductData = _.find(productList, { id: selectedProduct });
    navigate('create', {
      state: {
        currentProductData,
      },
    });
  };

  const onClickDetailCreativeGroup = (creativeGroupID: string) => {
    const currentProductData = _.find(productList, { id: selectedProduct });
    navigate(`detail/${creativeGroupID}`, {
      state: {
        currentProductData,
      },
    });
  };

  const handleApplySearchClick = useCallback(() => {
    setAppliedSearchValue(searchValue);
  }, [searchValue]);

  return (
    <div>
      <AppPageHeader
        title={'소재그룹'}
        extra={
          <AppSelectPicker
            style={{ width: '200px' }}
            data={productList}
            labelKey={'title'}
            valueKey={'id'}
            value={selectedProduct}
            searchable={false}
            cleanable={false}
            onChange={(value) => {
              setSelectedProduct(value);
            }}
          />
        }
      />
      <div style={{ padding: '0 30px', paddingBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {!selectedProduct ? (
            <Whisper
              trigger="hover"
              placement="bottomStart"
              enterable
              speaker={<AppPopover theme={'white'}>{`자산 > 앱 메뉴에서 앱을 생성하세요.`}</AppPopover>}
            >
              <span style={{ display: 'inline-block' }}>
                <AppButton theme={'create'} size="md" style={{ width: 80, pointerEvents: 'none' }} disabled>
                  생성
                </AppButton>
              </span>
            </Whisper>
          ) : (
            <AppButton theme={'create'} size="md" onClick={onClickCreateCreativeGroup} style={{ width: 80 }}>
              생성
            </AppButton>
          )}
        </div>
        <Search
          data={[{ label: '소재그룹명', value: 'title' }]}
          searchKey={'title'}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          maxLength={50}
          onSearch={handleApplySearchClick}
        />
      </div>
      <div>
        <AppTable
          data={creativeGroupList.data?.filter((item: { title: string }) =>
            appliedSearchValue ? item.title.toUpperCase().includes(appliedSearchValue.toUpperCase()) : true
          )}
          rowHeight={40}
          loading={creativeGroupList.isFetching}
          autoHeight
        >
          <AppTable.Column minWidth={140} flexGrow={1}>
            <AppTable.HeaderCell style={{ paddingLeft: 30 }}>소재그룹명</AppTable.HeaderCell>
            <AppTable.Cell style={{ paddingLeft: 30 }}>
              {(rowData) => (
                <AppTypography.Link onClick={() => onClickDetailCreativeGroup(rowData['id'])}>
                  {rowData.title}
                </AppTypography.Link>
              )}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column width={100}>
            <AppTable.HeaderCell>상태</AppTable.HeaderCell>
            <AppTable.Cell>{(rowData) => (rowData.inactive_reasons ? 'inactive' : 'active')}</AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>소재</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) =>
                `Image: ${rowData.image_creatives_count || 0} Native: ${rowData.native_creatives_count || 0} Video: ${
                  rowData.video_creatives_count || 0
                }`
              }
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column minWidth={140} flexGrow={1}>
            <AppTable.HeaderCell>생성일시</AppTable.HeaderCell>
            <DateCell dataKey={'created_at'} />
          </AppTable.Column>
          <AppTable.Column minWidth={140} flexGrow={1}>
            <AppTable.HeaderCell style={{ paddingRight: 30 }}>수정일시</AppTable.HeaderCell>
            <DateCell dataKey={'updated_at'} style={{ paddingRight: 30 }} />
          </AppTable.Column>
        </AppTable>
      </div>
    </div>
  );
};

export default CreativeGroupList;
