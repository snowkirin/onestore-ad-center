import React from 'react';
import Row from '@components/AppGrid/Row';
import Col from '@components/AppGrid/Col';
import AppTypography from '@components/AppTypography';
import { Controller, useForm } from 'react-hook-form';
import AppRadioGroup from '@components/AppRadio';
import {
  campaignPurposeListByRE,
  campaignPurposeListByUA,
  campaignTypeList,
} from '@pages/Campaigns/Campaign/variables';
import { Radio, RadioGroup } from 'rsuite';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';

interface CampaignFormProps {
  appEventSummaryList: any;
}

/* 켐페인  여기서 알아서 Validation 도 종료 할것. */
const CampaignForm: React.FC<CampaignFormProps> = ({ appEventSummaryList }) => {
  const { watch, control, setValue } = useForm();
  const watchCampaignType = watch('campaignType');
  const watchCampaignPurpose = watch('campaignPurpose');
  return (
    <div>
      <Row>
        <Col isLabel>
          <AppTypography.Label isRequired>앱 이름</AppTypography.Label>
        </Col>
        <Col>
          <AppTypography.Text>원스토리</AppTypography.Text>
        </Col>
      </Row>
      <Row>
        <Col isLabel>
          <AppTypography.Label isRequired>캠페인 타입</AppTypography.Label>
        </Col>
        <Col>
          <Controller
            name={`campaignType`}
            control={control}
            defaultValue={'User_Acquisition'}
            render={({ field }) => {
              return (
                <AppRadioGroup
                  inline
                  value={field.value}
                  data={campaignTypeList}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value === 'User_Acquisition') {
                      setValue('campaignPurpose', 'Install');
                    } else {
                      setValue('campaignPurpose', 'Click');
                    }
                  }}
                />
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col isLabel>
          <AppTypography.Label isRequired>캠페인 목적</AppTypography.Label>
        </Col>
        <Col>
          <Controller
            name={`campaignPurpose`}
            control={control}
            defaultValue={'Install'}
            render={({ field }) => {
              return (
                <RadioGroup inline value={field.value} onChange={(value) => field.onChange(value)}>
                  {watchCampaignType === 'User_Acquisition'
                    ? campaignPurposeListByUA.map((item, idx) => {
                        return (
                          <Radio
                            value={item.value}
                            key={idx}
                            disabled={
                              (item.value === 'in_App_Event' && appEventSummaryList.data?.app_event.length === 0) ||
                              (item.value === 'ROAS' && appEventSummaryList.data?.roas.length === 0)
                            }
                          >
                            {item.label}
                          </Radio>
                        );
                      })
                    : campaignPurposeListByRE.map((item, idx) => {
                        return (
                          <Radio
                            value={item.value}
                            key={idx}
                            disabled={
                              (item.value === 'in_App_Event' && appEventSummaryList.data?.app_event.length === 0) ||
                              (item.value === 'ROAS' && appEventSummaryList.data?.roas.length === 0)
                            }
                          >
                            {item.label}
                          </Radio>
                        );
                      })}
                </RadioGroup>
              );
            }}
          />
        </Col>
      </Row>
      {(watchCampaignPurpose === 'In_App_Event' || watchCampaignPurpose === 'ROAS') && (
        <Row align={'center'}>
          <Col isLabel>
            <AppTypography.Label isRequired>앱 이벤트</AppTypography.Label>
          </Col>
          <Col>
            {watchCampaignPurpose === 'In_App_Event' && (
              <Controller
                name={`goalAction`}
                control={control}
                defaultValue={''}
                render={({ field }) => {
                  return (
                    <AppSelectPicker
                      data={appEventSummaryList.data?.app_event}
                      labelKey={'event_name'}
                      valueKey={'event_name'}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  );
                }}
              />
            )}
            {watchCampaignPurpose === 'ROAS' && (
              <Controller
                name={`goalActionROAS`}
                control={control}
                defaultValue={[]}
                render={({ field }) => {
                  return (
                    <AppCheckPicker
                      data={appEventSummaryList.data?.roas || []}
                      labelKey={'event_name'}
                      valueKey={'event_name'}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                    />
                  );
                }}
              />
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CampaignForm;
