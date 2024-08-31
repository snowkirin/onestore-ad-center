import React, { useCallback, useState } from 'react';
import { CellProps, Whisper } from 'rsuite';
import { AppButton } from '@components/AppButton';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import { getProductList } from '@apis/product.api';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import AppTable from '@/components/AppTable';
import EllipsisPopup from '@components/EllipsisPopup';
import AppTypography from '@components/AppTypography';
import AppPopover from '@components/AppPopover';
import Search from '@components/Search';
import { sortByCaseInsensitive } from '@utils/functions';

interface TrackingListProps {}

interface ViewCellProps extends CellProps {
  onTitleClick: (id: any, title: any) => void;
}

// 컴포넌트
const ViewCell: React.FC<ViewCellProps> = ({ rowData, dataKey, onTitleClick, ...props }) => {
  return (
    <AppTable.Cell {...props} className="link-group">
      <EllipsisPopup
        text={
          <AppTypography.Link onClick={() => onTitleClick(rowData['id'], rowData['app_title'])}>
            {rowData.title}
          </AppTypography.Link>
        }
      />
    </AppTable.Cell>
  );
};

const TrackingList: React.FC<TrackingListProps> = () => {
  // Variables
  let navigate = useNavigate();
  // adAccountId
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  // UseState
  const [productId, setProductId] = useState('');
  const [tmpSearchText, setTmpSearchText] = useState('');
  const [searchText, setSearchText] = useState('');

  const fetchProductList = useQuery(
    ['fetchProductList', selectedAdAccount],
    async () => {
      const { data } = await getProductList({
        ad_account_id: selectedAdAccount,
        show_deleted: false,
      });
      if (data.products && data.products.length !== 0) {
        return sortByCaseInsensitive(data.products, 'title', 'asc');
      }
      return [];
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
      onSuccess: (data) => {
        if (data.length) {
          setProductId(data[0].id);
        }
      },
    }
  );

  // 트래킹 링크 정보
  const fetchTrackingList = useQuery(
    ['fetchTrackingList', productId],
    async () => {
      const response = await getTrackingLinkList({
        product_id: productId,
        ad_account_id: selectedAdAccount,
        inquiry_option: 'INQUIRY_ENTITY',
      });
      if (response.status === 200) {
        if (Object.keys(response.data).length !== 0) {
          return _.sortBy(response.data.tracking_links, 'created_at').reverse();
        } else {
          return [];
        }
      }
      return response.data;
    },
    {
      enabled: !_.isEmpty(productId),
    }
  );

  const fetchIntegratedList = useQuery(
    ['fetchIntegratedList', fetchProductList, fetchTrackingList, searchText],
    async () => {
      if (fetchTrackingList.data?.length) {
        return fetchTrackingList.data
          .map((trackingItem: any) => {
            if (fetchProductList.data?.length) {
              const matchProduct = fetchProductList.data.find((productItem: any) => {
                return productItem.id === trackingItem.product_id;
              });
              if (matchProduct) {
                return {
                  ...trackingItem,
                  app_title: trackingItem.title,
                  created_at: dayjs(trackingItem.created_at).format('YYYY-MM-DD HH:mm:ss'),
                  updated_at: dayjs(trackingItem.updated_at).format('YYYY-MM-DD HH:mm:ss'),
                };
              } else {
                return [];
              }
            } else {
              return [];
            }
          })
          .filter((ele: any) => {
            return ele !== undefined;
          })
          .filter((ele: any) => {
            return ele.title.toLowerCase().includes(searchText.toLowerCase());
          });
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(fetchTrackingList) && !_.isEmpty(fetchProductList.data),
    }
  );

  // Function
  const handleTitleClick = (id: any, title: any) => {
    navigate(`/assets/tracking-link/detail/${id}/${title}`);
  };

  const handleApplySearchClick = useCallback(() => {
    setSearchText(tmpSearchText);
  }, [tmpSearchText]);

  return (
    <>
      <div>
        <AppPageHeader
          title={'트래킹 링크'}
          extra={
            <AppSelectPicker
              style={{ width: 200 }}
              size={'md'}
              data={fetchProductList.data}
              searchable={false}
              cleanable={false}
              labelKey={'title'}
              valueKey={'id'}
              value={productId}
              onChange={(value: any) => {
                setProductId(value);
              }}
            />
          }
        />

        <div className="list-select">
          {!productId ? (
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
            <AppButton
              size={'md'}
              style={{ width: 80 }}
              theme={'create'}
              onClick={() => {
                navigate('/assets/tracking-link/create');
              }}
            >
              생성
            </AppButton>
          )}

          <Search
            data={[{ label: '트래킹링크명', value: 'title' }]}
            searchKey={'title'}
            searchValue={tmpSearchText}
            onSearchValueChange={setTmpSearchText}
            maxLength={50}
            onSearch={handleApplySearchClick}
          />
        </div>
        <AppTable
          data={fetchIntegratedList.data}
          className={'asset-table'}
          height={800}
          loading={fetchIntegratedList.isFetching}
        >
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell style={{ paddingLeft: 30 }}>트래킹링크명</AppTable.HeaderCell>
            <ViewCell style={{ paddingLeft: 30 }} onTitleClick={handleTitleClick} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>MMP</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'tracking_company'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>생성일시</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'created_at'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>수정일시</AppTable.HeaderCell>
            <AppTable.Cell dataKey={'updated_at'} />
          </AppTable.Column>
        </AppTable>
      </div>
    </>
  );
};

export default TrackingList;
