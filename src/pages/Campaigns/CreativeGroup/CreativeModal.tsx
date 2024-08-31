// 소재 불러오기 모달
import React from 'react';
import AppModal from '@components/AppModal/Modal';
import Row from '@components/AppGrid/Row';
import Col from '@components/AppGrid/Col';
import AppTypography from '@components/AppTypography';
import AppRadioGroup from '@components/AppRadio';
import { creativeTypes } from '@pages/Campaigns/CreativeGroup/variables';
import InfoMessage from '@components/AppTypography/InfoMessage';
import AppTable from '@components/AppTable/Table';
import { CheckCell, DateCell, ImageCell, ImageSizeCell, VideoCell, VideoLengthCell } from '@components/Common';
import TextCell from '@components/Common/TextCell';
import { AppButton } from '@components/AppButton';

const CreativeModal = ({
  open,
  onClose,
  creativeType,
  tmpSelected,
  onCheck,
  onOk,
  loading,
  data,
  setCreativeType,
}: {
  open: boolean;
  onClose: () => void;
  creativeType: 'IMAGE' | 'NATIVE' | 'VIDEO';
  tmpSelected: any[];
  onCheck: (value: any, checked: boolean) => void;
  onOk: () => void;
  loading: boolean;
  data: {
    IMAGE: any[];
    NATIVE: any[];
    VIDEO: any[];
  };
  setCreativeType: (v: 'IMAGE' | 'NATIVE' | 'VIDEO') => void;
}) => {
  return (
    <AppModal open={open} size={'full'} role={'dialog'} onClose={onClose}>
      <AppModal.Header>
        <AppModal.Title>소재 불러오기</AppModal.Title>
      </AppModal.Header>
      <AppModal.Body>
        <Row>
          <Col isLabel style={{ alignSelf: 'center' }}>
            <AppTypography.Label isRequired>소재 유형</AppTypography.Label>
          </Col>
          <Col>
            <AppRadioGroup inline value={creativeType} data={creativeTypes} onChange={setCreativeType} />
          </Col>
        </Row>
        <Row>
          <Col isLabel>
            <AppTypography.Label isRequired>소재</AppTypography.Label>
          </Col>
          <Col>
            <div style={{ marginBottom: 5 }}>
              <InfoMessage>선택한 소재는 {tmpSelected.length}개 입니다.</InfoMessage>
            </div>
            <div>
              <AppTable loading={loading} data={data?.[creativeType]} rowHeight={60} height={450}>
                <AppTable.Column>
                  <AppTable.HeaderCell>{'  '}</AppTable.HeaderCell>
                  <CheckCell dataKey={'id'} onChange={onCheck} checkedKeys={tmpSelected} style={{ marginTop: 10 }} />
                </AppTable.Column>
                <AppTable.Column>
                  <AppTable.HeaderCell>소재명</AppTable.HeaderCell>
                  <TextCell dataKey={'title'} style={{ verticalAlign: 'middle', display: 'table-cell' }} />
                </AppTable.Column>
                {creativeType === 'IMAGE' && (
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
                {creativeType === 'NATIVE' && (
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
                {creativeType === 'VIDEO' && (
                  <>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>동영상</AppTable.HeaderCell>
                      <VideoCell dataKey={'video.video_url'} />
                    </AppTable.Column>
                    <AppTable.Column flexGrow={1} verticalAlign={'middle'}>
                      <AppTable.HeaderCell>영상길이</AppTable.HeaderCell>
                      <VideoLengthCell dataKey={'video.length_seconds'} />
                    </AppTable.Column>
                    <AppTable.Column flexGrow={1} align={'center'}>
                      <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
                      <ImageCell dataKey={'video.companion_images[0].image_url'} />
                    </AppTable.Column>
                    <AppTable.Column verticalAlign={'middle'}>
                      <AppTable.HeaderCell>이미지 사이즈</AppTable.HeaderCell>
                      <ImageSizeCell dataKey={'video.companion_images[0].width, video.companion_images[0].height'} />
                    </AppTable.Column>
                  </>
                )}
                <AppTable.Column verticalAlign={'middle'} width={200}>
                  <AppTable.HeaderCell>생성일시</AppTable.HeaderCell>
                  <DateCell dataKey={'created_at'} />
                </AppTable.Column>
              </AppTable>
            </div>
          </Col>
        </Row>
      </AppModal.Body>
      <AppModal.Footer>
        <AppButton onClick={onClose}>취소</AppButton>
        <AppButton type={'submit'} theme={'red'} onClick={onOk}>
          완료
        </AppButton>
      </AppModal.Footer>
    </AppModal>
  );
};

export default CreativeModal;
