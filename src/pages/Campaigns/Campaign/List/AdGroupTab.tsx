import React from 'react';
import AppTable from '@/components/AppTable';
import { Controller, useForm } from 'react-hook-form';
import AppToggle from '@components/AppToggle';
import AppTypography from '@components/AppTypography';
import TextCell from '@components/Common/TextCell';
import { CommaCell, CostCell, CtrCell, SpendCell } from '@components/Common/NumberCell';

interface AdGroupTabProps {
  adGroupData: {
    data: any;
    isLoading: boolean;
    error?: boolean;
  };
  onAdGroupToggleChange: (rowData: any, checked: boolean, field: any) => void;
  onAdGroupEditClick: (rowData: any) => void;
  toggleLoadingId: string;
}

const AdGroupTab: React.FC<AdGroupTabProps> = ({
  adGroupData,
  onAdGroupToggleChange,
  onAdGroupEditClick,
  toggleLoadingId,
}) => {
  const { control } = useForm();

  return (
    <div>
      <div>
        <AppTable data={adGroupData.data} loading={adGroupData.isLoading} autoHeight style={{ borderTop: 0 }}>
          <AppTable.Column align={'center'}>
            <AppTable.HeaderCell>온/오프</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => {
                return (
                  <Controller
                    name={`toggle-${rowData.ad_group.id}`}
                    control={control}
                    defaultValue={rowData.ad_group.enabling_state === 'ENABLED'}
                    render={({ field }) => {
                      return (
                        <AppToggle
                          checked={field.value}
                          loading={toggleLoadingId === rowData.ad_group.id}
                          onChange={(checked: boolean) => {
                            onAdGroupToggleChange(rowData, checked, field);
                          }}
                        />
                      );
                    }}
                  />
                );
              }}
            </AppTable.Cell>
          </AppTable.Column>
          <AppTable.Column flexGrow={2}>
            <AppTable.HeaderCell>광고그룹명</AppTable.HeaderCell>
            <TextCell dataKey={'ad_group.title'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} minWidth={150}>
            <AppTable.HeaderCell>캠페인 명</AppTable.HeaderCell>
            <TextCell dataKey={'campaign_title'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'} minWidth={100}>
            <AppTable.HeaderCell>Spend</AppTable.HeaderCell>
            <SpendCell dataKey={'metric.spend'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'} minWidth={100}>
            <AppTable.HeaderCell>Impression</AppTable.HeaderCell>
            <CommaCell dataKey={'metric.impressions'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'} minWidth={100}>
            <AppTable.HeaderCell>Click</AppTable.HeaderCell>
            <CommaCell dataKey={'metric.clicks'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'} minWidth={100}>
            <AppTable.HeaderCell>Install</AppTable.HeaderCell>
            <CommaCell dataKey={'metric.installs'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'} minWidth={100}>
            <AppTable.HeaderCell>CTR</AppTable.HeaderCell>
            <CtrCell firstKey={'metric.clicks'} secondKey={'metric.impressions'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'} minWidth={100}>
            <AppTable.HeaderCell>CPI</AppTable.HeaderCell>
            <CostCell firstKey={'metric.spend'} secondKey={'metric.installs'} />
          </AppTable.Column>
          <AppTable.Column width={80} fixed={'right'} align={'center'}>
            <AppTable.HeaderCell>수정</AppTable.HeaderCell>
            <AppTable.Cell>
              {(rowData) => {
                return <AppTypography.Link onClick={() => onAdGroupEditClick(rowData)}>수정</AppTypography.Link>;
              }}
            </AppTable.Cell>
          </AppTable.Column>
        </AppTable>
      </div>
    </div>
  );
};

export default AdGroupTab;
