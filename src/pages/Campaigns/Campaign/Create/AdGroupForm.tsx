import React from 'react';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';
import { getCreativeGroupList } from '@apis/creative_group.api';
import { getAudienceTargetList } from '@apis/audience_target.api';
import { useLocation } from 'react-router-dom';
import AppTypography from '@components/AppTypography';
import { AppInputCount } from '@components/AppInput';
import clsx from 'clsx';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import InfoTooltip from '@components/InfoTooltip';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { exposureFrequencyList, exposureFrequencyUnitList } from '@pages/Campaigns/Campaign/variables';
import AppDivider from '@components/AppDivider';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import InfoMessage from '@components/AppTypography/InfoMessage';
import { sortByCaseInsensitive } from '@utils/functions';

interface AdGroupFormProps {
  adgroupForm: UseFormReturn<FieldValues, any>;
}

const AdGroupForm: React.FC<AdGroupFormProps> = ({ adgroupForm }) => {
  const { state }: { state: any } = useLocation();

  const watchAdGroupSelectedExposureFrequency = adgroupForm.watch('selectedExposureFrequency', '1_HOUR');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';

  // API : 소재그룹 리스트 가져오기
  const fetchCreativeGroupList = useQuery(
    ['fetchCreativeGroupList', selectedAdAccount, state.currentProductData.id],
    async () => {
      const { data } = await getCreativeGroupList({
        ad_account_id: selectedAdAccount,
        product_id: state.currentProductData.id,
      });
      if (data.creative_groups && data.creative_groups.length !== 0) {
        return sortByCaseInsensitive(data.creative_groups, 'title', 'asc');
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount) && !_.isEmpty(state.currentProductData.id),
    }
  );

  // API : 맞춤타겟 리스트 가져오기
  const fetchAudienceTargetList = useQuery(
    ['fetchAudienceTargetList', selectedAdAccount],
    async () => {
      const { data } = await getAudienceTargetList({
        ad_account_id: selectedAdAccount,
      });
      if (data.audience_targets && data.audience_targets.length !== 0) {
        return sortByCaseInsensitive(data.audience_targets, 'title', 'asc');
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(selectedAdAccount),
    }
  );

  return (
    <div className={'ad-group'}>
      <div className={'content__box'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired>
              광고그룹명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              control={adgroupForm.control}
              defaultValue={''}
              render={({ field }) => (
                <AppInputCount
                  className={clsx({ 'input-error': _.get(adgroupForm.formState.errors, 'title') })}
                  style={{ width: 450 }}
                  maxLength={50}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
              rules={{ required: '광고그룹명을 입력하세요.' }}
            />
            <ErrorMessage
              name={`title`}
              errors={adgroupForm.formState.errors}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'} isRequired style={{ display: 'inline-block' }}>
              노출빈도
            </AppTypography.Label>
            <InfoTooltip inner={'설정한 시간동안 동일한 사용자에게 광고를 1회만 노출합니다.'} />
          </div>
          <div className={'col col-input'}>
            <div style={{ display: 'flex' }}>
              <Controller
                name={'selectedExposureFrequency'}
                control={adgroupForm.control}
                defaultValue={'1_HOUR'}
                render={({ field }) => (
                  <AppSelectPicker
                    style={{
                      width: 200,
                    }}
                    searchable={false}
                    cleanable={false}
                    className={clsx({
                      'input-error': _.get(adgroupForm.formState.errors, 'selectedExposureFrequency'),
                    })}
                    data={exposureFrequencyList}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      adgroupForm.clearErrors('exposureFrequencyValue.amount');
                    }}
                  />
                )}
                rules={{ required: true }}
              />
              {watchAdGroupSelectedExposureFrequency === 'CUSTOM' && (
                <>
                  <Controller
                    name={'exposureFrequencyValue.amount'}
                    control={adgroupForm.control}
                    render={({ field }) => (
                      <AppInputCount
                        className={clsx({
                          'input-error': _.get(adgroupForm.formState.errors, 'exposureFrequencyValue.amount'),
                        })}
                        style={{
                          width: 100,
                          marginLeft: 10,
                        }}
                        isNumber={true}
                        maxLength={2}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{
                      validate: {
                        afterStartDate: (v) => {
                          return watchAdGroupSelectedExposureFrequency !== 'CUSTOM' || v
                            ? true
                            : '노출빈도를 입력하세요.';
                        },
                      },
                    }}
                  />
                  <Controller
                    name={'exposureFrequencyValue.unit'}
                    control={adgroupForm.control}
                    defaultValue={'MINUTE'}
                    render={({ field }) => (
                      <AppSelectPicker
                        className={clsx({
                          'input-error': _.get(adgroupForm.formState.errors, 'exposureFrequencyValue.unit'),
                        })}
                        style={{
                          width: 100,
                          marginLeft: 10,
                        }}
                        cleanable={false}
                        searchable={false}
                        data={exposureFrequencyUnitList}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                    rules={{
                      required: true,
                    }}
                  />
                </>
              )}
            </div>
            <ErrorMessage
              name={'exposureFrequencyValue.amount'}
              errors={adgroupForm.formState.errors}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
      </div>
      <AppDivider />
      <div className={'content__box'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>소재그룹</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <div>
              <Controller
                name={'selectedCreativeGroup'}
                control={adgroupForm.control}
                defaultValue={[]}
                render={({ field }) => (
                  <AppCheckPicker
                    style={{ width: 450 }}
                    data={fetchCreativeGroupList.data || []}
                    labelKey={'title'}
                    valueKey={'id'}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    placeholder={'소재그룹을 선택하세요.'}
                  />
                )}
              />
            </div>
            <InfoMessage style={{ marginTop: 10 }}>
              하나 이상의 소재그룹을 추가해야 캠페인 라이브가 가능합니다.
            </InfoMessage>
          </div>
        </div>
      </div>

      <AppDivider />
      <div className={'content__box'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>맞춤 타겟</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'selectedAudienceTarget'}
              control={adgroupForm.control}
              defaultValue={[]}
              render={({ field }) => (
                <AppCheckPicker
                  style={{ width: 450 }}
                  data={fetchAudienceTargetList.data || []}
                  labelKey={'title'}
                  valueKey={'id'}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  placeholder={'맞춤 타겟명을 선택하세요.'}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdGroupForm;
