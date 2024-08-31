import React, { useMemo, useState } from 'react';
import { AppButton } from '@components/AppButton';
import { Message, useToaster } from 'rsuite';
import { deleteTrackingLink, viewTrackingLink } from '@apis/tracking_link.api';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import AppPageHeader from '@components/AppPageHeader';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';

interface trackingViewProps {}

const TrackingView: React.FC<trackingViewProps> = () => {
  // Variables
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  const toaster = useToaster();
  const navigate = useNavigate();

  const { id: trackingLinkId } = useParams();
  const { title: appName } = useParams();

  // UseState
  const [open, setOpen] = useState(false);
  const [trackingContent, setTrackingContent] = useState<any>([]);

  // Function
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const fetchTrackingDetail = useQuery(
    ['fetchTrackingDetail', trackingLinkId],
    async () => {
      const response = await viewTrackingLink({
        tracking_link_id: trackingLinkId,
      });
      if (response.status === 200) {
        return response.data.tracking_link;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(trackingLinkId),
      onSuccess: (data) => {
        setTrackingContent(data);
      },
    }
  );

  const deleteTracking = () => {
    handleModalClose();
    const payload = {
      tracking_link_id: trackingLinkId,
    };
    deleteTrackingLink(payload)
      .then(async (res) => {
        if (res.status === 200) {
          navigate('/assets/tracking-link');
        } else {
          toaster.push(<Message showIcon type={'error'} header="삭제 실패" />);
        }
      })
      .catch((err: any) => {
        toaster.push(<Message showIcon type={'error'} header="캠페인에 사용중인 트래킹은 삭제할 수 없습니다." />);
      });
  };

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  return (
    <div>
      <AppPageHeader title={'트래킹 링크 조회'} />
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
            <AppTypography.Label className={'text'}>OS</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>ANDROID</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>앱 이름</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{appName}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>트래킹 링크 ID</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{trackingContent.id || '-'}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>트래킹 링크명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{trackingContent.title || '-'}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>트래킹 링크 설명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{trackingContent.description || '-'}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>MMP</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{trackingContent.tracking_company || '-'}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>클릭 트래킹 URL</AppTypography.Label>
          </div>
          <div className={'col col-input'} style={{ width: 600 }}>
            <div style={{ paddingTop: 7 }}>
              <a style={{ wordBreak: 'break-all' }} href={trackingContent.click_through_link?.url} target={'_blank'}>
                {trackingContent.click_through_link?.url || '-'}
              </a>
            </div>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>뷰 트래킹 URL</AppTypography.Label>
          </div>
          <div className={'col col-input'} style={{ width: 600 }}>
            <div style={{ paddingTop: 7 }}>
              <a style={{ wordBreak: 'break-all' }} href={trackingContent.view_through_link?.url} target={'_blank'}>
                {trackingContent.view_through_link?.url || '-'}
              </a>
            </div>
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
        <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/tracking-link')}>
          목록
        </AppButton>
        <AppButton
          size={'lg'}
          theme={'red'}
          style={{ width: 138, marginLeft: 20 }}
          onClick={() => navigate(`/assets/tracking-link/update/${trackingLinkId}/${appName}`)}
        >
          수정
        </AppButton>
      </AppPageFooter>

      <ConfirmModal
        open={open}
        onClose={handleModalClose}
        title={'트래킹 링크 삭제'}
        onOk={deleteTracking}
        content={
          <>
            <AppTypography.Text>삭제한 트래킹 링크는 복구할 수 없으며,</AppTypography.Text>
            <AppTypography.Text>트래킹 링크 화면에 노출되지 않습니다.</AppTypography.Text>
            <AppTypography.Text>{trackingContent.title}을 삭제하시겠습니까?</AppTypography.Text>
          </>
        }
      />
    </div>
  );
};

export default TrackingView;
