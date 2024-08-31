import React, { useMemo } from 'react';
import { AppButton } from '@components/AppButton';
import { deleteCustomerFile, viewCustomerFile } from '@apis/customer_file.api';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import AppTable from '@components/AppTable';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';
import TextCell from '@components/Common/TextCell';
import { getAudienceTargetList } from '@apis/audience_target.api';

interface CustomerViewProps {}

const CustomerDetail: React.FC<CustomerViewProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const navigate = useNavigate();
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const [open, setOpen] = React.useState(false);

  const { customerSetId: customerSetId } = useParams();
  const { adAccountId: adAccountId } = useParams();

  const fetchCustomerFileDetail = useQuery(
    ['fetchCustomerFileDetail', customerSetId],
    async () => {
      const params = {
        customer_set_id: customerSetId,
      };
      const result = await viewCustomerFile(params);
      if (result.status === 200) {
        return result.data.customer_set;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(customerSetId),
    }
  );

  /*
    타케팅 리스트는 audience_target.targeting_condition.custom_audience_set.exclude_having_all.user_lists 안의
    exclude_having_all, exclude_having_any, include_having_all, include_having_any에 들어있는 id 와 customerSetId이 동일한 것만 가져온다.
  */

  const fetchTargetingList = useQuery(
    ['fetchTargetingList', adAccountId],
    async () => {
      const params = {
        ad_account_id: adAccountId!,
        inquiry_option: 'INQUIRY_OVERVIEW',
      };
      const { data } = await getAudienceTargetList(params);
      if (data && data.audience_target_overviews.length !== 0) {
        return data.audience_target_overviews
          .map((item: any) => {
            return {
              ...item,
              updated_at: dayjs(item.audience_target.updated_at).format('YYYY-MM-DD HH:mm:ss'),
            };
          })
          .filter((item: any) => {
            return (
              (_.has(item, 'audience_target.targeting_condition.custom_audience_set.exclude_having_all.user_lists') &&
                item.audience_target.targeting_condition.custom_audience_set.exclude_having_all.user_lists.includes(
                  customerSetId
                )) ||
              (_.has(item, 'audience_target.targeting_condition.custom_audience_set.exclude_having_any.user_lists') &&
                item.audience_target.targeting_condition.custom_audience_set.exclude_having_any.user_lists.includes(
                  customerSetId
                )) ||
              (_.has(item, 'audience_target.targeting_condition.custom_audience_set.include_having_all.user_lists') &&
                item.audience_target.targeting_condition.custom_audience_set.include_having_all.user_lists.includes(
                  customerSetId
                )) ||
              (_.has(item, 'audience_target.targeting_condition.custom_audience_set.include_having_any.user_lists') &&
                item.audience_target.targeting_condition.custom_audience_set.include_having_any.user_lists.includes(
                  customerSetId
                ))
            );
          });
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(adAccountId),
    }
  );

  const deleteCustomer = () => {
    handleModalClose();
    const payload = {
      customer_set_id: customerSetId,
    };
    deleteCustomerFile(payload)
      .then(async (res) => {
        if (res.status === 200) {
          navigate('/assets/customer-file');
        }
      })
      .catch((err: any) => {
        alert('맞춤 타겟에 사용중인 고객 파일은 삭제할 수 없습니다.');
      });
  };

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'고객 파일 조회'} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>광고계정명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>고객 파일 ID</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchCustomerFileDetail.data?.id}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>고객 파일명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchCustomerFileDetail.data?.title}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>타겟 유형</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>GOOGLE_ADID</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>상태</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchCustomerFileDetail.data?.status}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>사용현황</AppTypography.Label>
          </div>
          <div className={'col col-input'} style={{ width: 600 }}>
            <AppTable data={fetchTargetingList?.data}>
              <AppTable.Column flexGrow={1}>
                <AppTable.HeaderCell>맞춤 타겟명</AppTable.HeaderCell>
                <TextCell dataKey={'audience_target.title'} />
              </AppTable.Column>
              <AppTable.Column width={130}>
                <AppTable.HeaderCell>수정일시</AppTable.HeaderCell>
                <AppTable.Cell dataKey={'updated_at'} />
              </AppTable.Column>
            </AppTable>
          </div>
        </div>
      </div>
      <FinalActionDivider />
      <AppPageFooter
        extra={
          <AppButton theme={'white_gray'} style={{ width: 70 }} size={'lg'} onClick={handleModalOpen}>
            삭제
          </AppButton>
        }
      >
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/customer-file')}>
          목록
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={() => navigate(`/assets/customer-file/update/${customerSetId}/${adAccountId}`)}
        >
          수정
        </AppButton>
      </AppPageFooter>

      <ConfirmModal
        open={open}
        onClose={handleModalClose}
        title={'고객 파일 삭제'}
        onOk={deleteCustomer}
        content={
          <>
            <AppTypography.Text>삭제한 고객 파일은 복구할 수 없으며,</AppTypography.Text>
            <AppTypography.Text>고객 파일 화면에 노출되지 않습니다.</AppTypography.Text>
            <AppTypography.Text>{fetchCustomerFileDetail.data?.title}을 삭제하시겠습니까?</AppTypography.Text>
          </>
        }
      />
    </div>
  );
};

export default CustomerDetail;
