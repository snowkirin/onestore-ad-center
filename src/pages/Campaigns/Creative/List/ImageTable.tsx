import React from 'react';
import { DateCell, DeleteCell, DetailCell, ImageCell, ImageSizeCell } from '@components/Common';
import AppTable from '@/components/AppTable';

interface ImageAppTableProps {
  data: any;
  loading: boolean;
  onDelete: (id: string, title: string) => void;
  onDetail: (id: string) => void;
}

const ImageAppTable: React.FC<ImageAppTableProps> = ({ data, loading, onDelete, onDetail }) => {
  return (
    <AppTable data={data} loading={loading} autoHeight={true} rowHeight={80}>
      <AppTable.Column verticalAlign={'middle'} flexGrow={1} minWidth={200}>
        <AppTable.HeaderCell style={{ paddingLeft: 30 }}>소재명</AppTable.HeaderCell>
        <DetailCell dataKey={'title'} style={{ paddingLeft: 30 }} onDetail={onDetail} />
      </AppTable.Column>
      <AppTable.Column flexGrow={2} align={'center'}>
        <AppTable.HeaderCell>이미지</AppTable.HeaderCell>
        <ImageCell dataKey={'image.image_url'} />
      </AppTable.Column>
      <AppTable.Column verticalAlign={'middle'}>
        <AppTable.HeaderCell>사이즈</AppTable.HeaderCell>
        <ImageSizeCell dataKey={'image.width, image.height'} />
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

export default ImageAppTable;
