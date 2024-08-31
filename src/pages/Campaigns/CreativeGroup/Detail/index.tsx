import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { deleteCreativeGroup, getCreativeGroupDetail } from '@apis/creative_group.api';
import AppTypography from '@components/AppTypography';
import dayjs from 'dayjs';
import { creativeByType, toComponentScheduleValue, toScheduleValue } from '@utils/functions';
import AppTabs, { AppTab } from '@components/AppTabs';
import AppTable from '@/components/AppTable';
import { ImageCell, ImageSizeCell, VideoCell, VideoLengthCell } from '@components/Common';
import AppSchedule from '@components/AppSchedule';
import { AppButton } from '@/components/AppButton';
import AppPageHeader from '@components/AppPageHeader';
import { Loader } from 'rsuite';
import { ADGROUP_STATUS, CAMPAIGN_STATUS } from '@pages/Campaigns/Campaign/variables';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import { ConfirmModal } from '@components/AppModal';
import TextCell from '@components/Common/TextCell';

interface CreativeGroupDetailProps {}

const CreativeGroupDetail: React.FC<CreativeGroupDetailProps> = () => {
  /* Variables */
  // 모달
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);
  // 소재그룹아이디
  const { id: creativeGroupId } = useParams();
  const { state }: { state: any } = useLocation();
  const navigate = useNavigate();

  /* State */
  const [open, setOpen] = React.useState(false);
  const [scheduleValue, setScheduleValue] = useState<any>({});
  const [selectedCreativeListTab, setSelectedCreativeListTab] = useState<'IMAGE' | 'NATIVE' | 'VIDEO'>('IMAGE');
  const [isShowSchedule, setIsShowSchedule] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCreativeGroupDetail = useQuery(
    ['fetchCreativeGroupDetail', creativeGroupId],
    async () => {
      const result = await getCreativeGroupDetail(creativeGroupId!, { inquiry_option: 'INQUIRY_OVERVIEW' });

      if (result.data.creative_group_overview.creative_group.audience.targeting_condition.weekly_schedules) {
        setScheduleValue(
          toComponentScheduleValue(
            result.data.creative_group_overview.creative_group.audience.targeting_condition.weekly_schedules
          )
        );
      }
      // toComponentScheduleValue
      return result.data;
    },
    {
      enabled: !isEmpty(creativeGroupId),
    }
  );

  const convertCreativeList = useMemo(() => {
    if (fetchCreativeGroupDetail.data?.creatives) {
      return creativeByType(fetchCreativeGroupDetail.data.creatives);
    } else {
      return {
        IMAGE: [],
        NATIVE: [],
        VIDEO: [],
      };
    }
  }, [fetchCreativeGroupDetail.data?.creatives]);

  const onDeleteCreativeGroup = () => {
    setLoading(true);
    deleteCreativeGroup(creativeGroupId!)
      .then(() => {
        navigate('/campaigns/creative-group');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onEditCreativeGroup = () => {
    navigate(`/campaigns/creative-group/edit/${creativeGroupId}`, {
      state: {
        currentProductData: state.currentProductData,
      },
    });
  };
  return (
    <>
      <div>
        {(fetchCreativeGroupDetail.isFetching || loading) && <Loader center backdrop style={{ zIndex: 99 }} />}
        <AppPageHeader title={'소재그룹 조회'} />
        {fetchCreativeGroupDetail.isSuccess && (
          <>
            <div className={'content__inner'}>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>앱 이름</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>{state.currentProductData.title}</AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>소재그룹 ID</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchCreativeGroupDetail.data.creative_group_overview.creative_group.id}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>소재그룹명</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchCreativeGroupDetail.data.creative_group_overview.creative_group.title}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>상태</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchCreativeGroupDetail.data.creative_group_overview.inactive_reasons ? 'inactive' : 'active'}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>시작일/종료일</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  {fetchCreativeGroupDetail.data.creative_group_overview.creative_group.audience.targeting_condition
                    .schedule ? (
                    <>
                      <AppTypography.Text className={'text'}>
                        {`${dayjs(
                          fetchCreativeGroupDetail.data.creative_group_overview.creative_group.audience
                            .targeting_condition.schedule.start
                        ).format('YYYY-MM-DD HH:mm')} ~ ${
                          fetchCreativeGroupDetail.data.creative_group_overview.creative_group.audience
                            .targeting_condition.schedule.end
                            ? dayjs(
                                fetchCreativeGroupDetail.data.creative_group_overview.creative_group.audience
                                  .targeting_condition.schedule.end
                              ).format('YYYY-MM-DD HH:mm')
                            : '종료일 없음'
                        }`}
                      </AppTypography.Text>
                    </>
                  ) : (
                    <AppTypography.Text className={'text'}>설정안함</AppTypography.Text>
                  )}
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>스케줄</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 650 }}>
                  <AppTypography.Link className={'text'} onClick={() => setIsShowSchedule(!isShowSchedule)}>
                    스케줄 설정 ▼
                  </AppTypography.Link>
                  {isShowSchedule && <AppSchedule readOnly value={toScheduleValue(scheduleValue)} />}
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>트래킹 링크</AppTypography.Label>
                </div>
                <div className={'col col-input'}>
                  <AppTypography.Text className={'text'}>
                    {fetchCreativeGroupDetail.data.tracking_link?.title || '-'}
                  </AppTypography.Text>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>소재</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 650 }}>
                  <AppTabs activeKey={selectedCreativeListTab} onSelect={(value) => setSelectedCreativeListTab(value)}>
                    <AppTab eventKey={'IMAGE'}>이미지</AppTab>
                    <AppTab eventKey={'NATIVE'}>네이티브</AppTab>
                    <AppTab eventKey={'VIDEO'}>비디오</AppTab>
                  </AppTabs>
                  <div>
                    <AppTable data={convertCreativeList[selectedCreativeListTab]} style={{ borderTop: 'none' }}>
                      <AppTable.Column>
                        <AppTable.HeaderCell>소재명</AppTable.HeaderCell>
                        <TextCell dataKey={'title'} />
                      </AppTable.Column>
                      {selectedCreativeListTab === 'IMAGE' && (
                        <>
                          <AppTable.Column flexGrow={1} align={'center'}>
                            <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                            <ImageCell dataKey={'image.image_url'} />
                          </AppTable.Column>
                          <AppTable.Column verticalAlign={'middle'}>
                            <AppTable.HeaderCell>사이즈</AppTable.HeaderCell>
                            <ImageSizeCell dataKey={'image.width, image.height'} />
                          </AppTable.Column>
                        </>
                      )}
                      {selectedCreativeListTab === 'NATIVE' && (
                        <>
                          <AppTable.Column flexGrow={1} align={'center'}>
                            <AppTable.HeaderCell>아이콘</AppTable.HeaderCell>
                            <ImageCell dataKey={'native.icon_image.image_url'} />
                          </AppTable.Column>
                          <AppTable.Column flexGrow={1} align={'center'}>
                            <AppTable.HeaderCell>동영상</AppTable.HeaderCell>
                            <VideoCell dataKey={'native.video.video_url'} />
                          </AppTable.Column>
                          <AppTable.Column flexGrow={1} align={'center'}>
                            <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                            <ImageCell dataKey={'native.main_image.image_url'} />
                          </AppTable.Column>
                          <AppTable.Column verticalAlign={'middle'}>
                            <AppTable.HeaderCell>이미지 사이즈</AppTable.HeaderCell>
                            <ImageSizeCell dataKey={'native.main_image.width, native.main_image.height'} />
                          </AppTable.Column>
                        </>
                      )}
                      {selectedCreativeListTab === 'VIDEO' && (
                        <>
                          <AppTable.Column flexGrow={1} align={'center'}>
                            <AppTable.HeaderCell>동영상</AppTable.HeaderCell>
                            <VideoCell dataKey={'video.video_url'} />
                          </AppTable.Column>
                          <AppTable.Column width={100} verticalAlign={'middle'}>
                            <AppTable.HeaderCell>영상길이</AppTable.HeaderCell>
                            <VideoLengthCell dataKey={'video.length_seconds'} />
                          </AppTable.Column>
                          <AppTable.Column flexGrow={1} align={'center'}>
                            <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                            <ImageCell dataKey={'video.companion_images[0].image_url'} />
                          </AppTable.Column>
                          <AppTable.Column verticalAlign={'middle'}>
                            <AppTable.HeaderCell>이미지 사이즈</AppTable.HeaderCell>
                            <ImageSizeCell
                              dataKey={'video.companion_images[0].width, video.companion_images[0].height'}
                            />
                          </AppTable.Column>
                        </>
                      )}
                    </AppTable>
                  </div>
                </div>
              </div>
              <div className={'row'}>
                <div className={'col col-label'}>
                  <AppTypography.Label className={'text'}>사용현황</AppTypography.Label>
                </div>
                <div className={'col col-input'} style={{ width: 650 }}>
                  <AppTable data={fetchCreativeGroupDetail.data.creative_group_overview.creative_group_referrer_infos}>
                    <AppTable.Column minWidth={100} flexGrow={1}>
                      <AppTable.HeaderCell>캠페인명</AppTable.HeaderCell>
                      <TextCell dataKey={'campaign_title'} />
                    </AppTable.Column>
                    <AppTable.Column minWidth={100} flexGrow={1}>
                      <AppTable.HeaderCell>캠페인 상태</AppTable.HeaderCell>
                      <AppTable.Cell dataKey={'campaign_state'}>
                        {(rowData) =>
                          CAMPAIGN_STATUS[
                            rowData.campaign_state as
                              | 'SUBMITTED'
                              | 'READY'
                              | 'UPCOMING'
                              | 'ACTIVE'
                              | 'PAUSED'
                              | 'COMPLETED'
                          ]
                        }
                      </AppTable.Cell>
                    </AppTable.Column>
                    <AppTable.Column minWidth={100} flexGrow={1}>
                      <AppTable.HeaderCell>광고그룹명</AppTable.HeaderCell>
                      <TextCell dataKey={'ad_group_title'} />
                    </AppTable.Column>
                    <AppTable.Column minWidth={100} flexGrow={1}>
                      <AppTable.HeaderCell>광고그룹 상태</AppTable.HeaderCell>
                      <AppTable.Cell dataKey={'ad_group_state'}>
                        {(rowData) => ADGROUP_STATUS[rowData.ad_group_state as 'UNSPECIFIED' | 'ENABLED' | 'DISABLED']}
                      </AppTable.Cell>
                    </AppTable.Column>
                  </AppTable>
                </div>
              </div>
            </div>
            <FinalActionDivider />
            <AppPageFooter
              extra={
                <AppButton size={'lg'} style={{ width: 70 }} theme={'white_gray'} onClick={handleModalOpen}>
                  삭제
                </AppButton>
              }
            >
              <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/campaigns/creative-group')}>
                목록
              </AppButton>
              <AppButton
                size={'lg'}
                type={'submit'}
                style={{ color: 'white', width: 138, marginLeft: 15 }}
                onClick={onEditCreativeGroup}
              >
                수정
              </AppButton>
            </AppPageFooter>
          </>
        )}
      </div>
      <ConfirmModal
        open={open}
        onClose={handleModalClose}
        title={'소재그룹 삭제'}
        onOk={onDeleteCreativeGroup}
        content={
          <>
            삭제한 소재그룹은 복구할 수 없으며 소재그룹 화면에 노출되지 않습니다.
            <br />
            또한, 운영중인 캠페인에 적용된 소재그룹일 경우 더이상 노출되지 않습니다.
            <br />
            {fetchCreativeGroupDetail.data?.creative_group_overview?.creative_group.title}을 삭제하시겠습니까?
          </>
        }
      />
    </>
  );
};

export default CreativeGroupDetail;
