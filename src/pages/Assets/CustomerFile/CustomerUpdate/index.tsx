import React, { useMemo } from 'react';
import { AppInputCount } from '@components/AppInput';
import { AppButton } from '@components/AppButton';
import { updateCustomerFile, viewCustomerFile } from '@apis/customer_file.api';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import AppTable from '@components/AppTable';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import { getTrackingLinkList } from '@apis/tracking_link.api';
import dayjs from 'dayjs';
import TextCell from '@components/Common/TextCell';

interface UpdateCustomerProps {}

const CustomerUpdate: React.FC<UpdateCustomerProps> = () => {
  const { adAccountId: adAccountId } = useParams();

  const adAccountList: any = useRouteLoaderData('layout');

  // Variables
  const navigate = useNavigate();
  const {
    handleSubmit: CF_handleSubmit,
    control: CF_control,
    formState: { errors: CF_errors },
  } = useForm();

  // parameter
  const { customerSetId: customerSetId } = useParams();

  const fetchCustomerFileDetail = useQuery(
    ['fetchCustomerFileDetail', customerSetId],
    async () => {
      const result = await viewCustomerFile({
        customer_set_id: customerSetId,
      });
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

  const onClickCFSubmit = (data: any) => {
    const CF_data = data;
    CF_data.id_type = 'GOOGLE_ADID';
    CF_data.data_file_path = fetchCustomerFileDetail.data?.data_file_path;
    CF_data.status = fetchCustomerFileDetail.data?.status;

    /**
     title: 고객 파일명,
     id_type: 타겟 유형,
     description: 상태,
     data_file_path: 첨부 파일 경로,
     */
    updateCustomerFile(
      {
        customer_set_id: customerSetId,
      },
      CF_data
    ).then((res: any) => {
      if (res.status === 200) {
        navigate('/assets/customer-file');
      }
    });
  };

  const fetchTargetingList = useQuery(
    ['fetchTargetingList', adAccountId],
    async () => {
      const params = {
        ad_account_id: adAccountId!,
      };
      const { data } = await getTrackingLinkList(params);
      if (data && data.tracking_links.length !== 0) {
        return data.tracking_links.map((item: any) => {
          return {
            ...item,
            updated_at: dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss'),
          };
        });
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(adAccountId),
    }
  );

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === adAccountId).title;
  }, [adAccountId]);

  return (
    <div>
      <AppPageHeader title={'고객 파일 수정'} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              광고계정명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              고객 파일 ID
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchCustomerFileDetail.data?.id}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              고객 파일명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              defaultValue={fetchCustomerFileDetail.data?.title}
              control={CF_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={255}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '고객 파일명을 입력하세요.',
              }}
            />
            <ErrorMessage
              errors={CF_errors}
              name={'title'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              타겟 유형
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>GOOGLE_ADID</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              상태
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{fetchCustomerFileDetail.data?.status}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              사용현황
            </AppTypography.Label>
          </div>
          <div className={'col col-input'} style={{ width: 600 }}>
            <AppTable data={fetchTargetingList?.data}>
              <AppTable.Column flexGrow={1}>
                <AppTable.HeaderCell>맞춤 타겟명</AppTable.HeaderCell>
                <TextCell dataKey={'title'} />
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
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/customer-file')}>
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={CF_handleSubmit(onClickCFSubmit)}
        >
          수정
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default CustomerUpdate;
