import React from 'react';
import AppTable from '@/components/AppTable';
import {
  DateCell,
  DeleteCell,
  DetailCell,
  ImageCell,
  ImageSizeCell,
  VideoCell,
  VideoLengthCell,
} from '@components/Common';

interface VideoAppTableProps {
  data: any;
  loading: boolean;
  onDelete: (id: string, title: string) => void;
  onDetail: (id: string) => void;
}

const VideoAppTable: React.FC<VideoAppTableProps> = ({ data, loading, onDelete, onDetail }) => {
  return (
    <AppTable data={data} loading={loading} autoHeight={true} rowHeight={80}>
      <AppTable.Column verticalAlign={'middle'} flexGrow={1}>
        <AppTable.HeaderCell style={{ paddingLeft: 30 }}>소재명</AppTable.HeaderCell>
        <DetailCell dataKey={'title'} onDetail={onDetail} style={{ paddingLeft: 30 }} />
      </AppTable.Column>
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
      <AppTable.Column verticalAlign={'middle'} width={180}>
        <AppTable.HeaderCell>생성일시</AppTable.HeaderCell>
        <DateCell dataKey={'created_at'} />
      </AppTable.Column>
      <AppTable.Column verticalAlign={'middle'} align={'center'}>
        <AppTable.HeaderCell>삭제</AppTable.HeaderCell>
        <DeleteCell onDelete={onDelete} />
      </AppTable.Column>
    </AppTable>
  );
};

export default VideoAppTable;
