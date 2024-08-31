import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import { AppInputCount } from '@components/AppInput';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import { createAdAccount } from '@apis/ad_account.api';
import { getUserList } from '@apis/user.api';
import { getComparatorsString } from '@utils/filter/dynamicFilter';
import timezoneData from '@utils/json/timezone.json';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { REGEXP_EN_KR_NUM_HYPHEN_UNDERBAR_SPACE } from '@utils/regexp';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';
import { selectStyles } from '@utils/common';

interface AdminAccountAdAccountCreateProps {}

const AdminAccountAdAccountCreate: React.FC<AdminAccountAdAccountCreateProps> = () => {
  let navigate = useNavigate();
  const URLParams = queryString.parse(location.search);

  const [managerList, setManagerList] = useState<any>([]);
  const [accountIds, setAccountIds] = useState<any>([]);

  const {
    handleSubmit: AD_AC_handleSubmit,
    control: AD_AC_control,
    formState: { errors: AD_AC_errors },
  } = useForm();

  const fetchManagerList = useQuery(
    ['fetchManagerList', URLParams.id],
    async () => {
      let getTotalFilter: string = '';
      if (URLParams.id !== '') {
        getTotalFilter = getComparatorsString(':', 'advertiser.id', `${URLParams.id}`);
        getTotalFilter = getComparatorsString(':', 'advertiser.id', `${URLParams.id}`);
      }
      const pageParams = {
        page: 1,
        size: 1000,
      };
      const sortParams = '&sort=role,desc&sort=name,asc';
      const { data } = await getUserList(encodeURIComponent(getTotalFilter), pageParams, sortParams);
      if (!isEmpty(data.content)) {
        return data.content.map((item: any) => {
          return {
            label: '권한: ' + item.role + ' / 이름: ' + item.name + ' (' + item.signin_id + ')',
            value: item.id,
            isFixed: item.role === '광고주 마스터',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setManagerList(data);
        setAccountIds(data.filter((item: any) => item.isFixed === true));
      },
    }
  );

  const onClickADACSubmit = (data: any) => {
    const AD_AC_data = data;
    const accountIdsArr: any[] = [];
    accountIds.forEach((item: any) => {
      accountIdsArr.push(item.value);
    });
    AD_AC_data.account_ids = accountIdsArr;
    AD_AC_data.advertiser_id = URLParams.id;
    createAdAccount(AD_AC_data)
      .then((res: any) => {
        if (res.status === 200) {
          navigate('/admin/account/ad-account');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          alert(err.response.data.message);
        }
      });
  };

  const chkConfirm = () => {
    if (confirm('광고계정 생성을 취소하시겠습니까?')) {
      navigate('/admin/account/ad-account');
    }
  };

  const getAdAccountIds = (e: any, option: any) => {
    switch (option.action) {
      case 'select-option':
        if (option.option && option.option?.value === 'all') {
          setAccountIds(managerList);
        } else {
          setAccountIds(e);
        }
        return;
      case 'clear':
        setAccountIds(managerList.filter((item: any) => item.isFixed === true));
        return;
      case 'pop-value':
        if (option && option.removedValue!.isFixed) return;
    }
    if (option && option.isFixed) return;
    setAccountIds(e);
  };

  return (
    <div>
      <AppPageHeader title={'광고계정 생성'} />
      <div className={'content__inner'}>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              광고계정명
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'title'}
              control={AD_AC_control}
              render={({ field }) => {
                return (
                  <AppInputCount
                    maxLength={50}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '광고계정명을 입력해 주세요.',
                minLength: {
                  value: 2,
                  message: '광고계정명은  2~50자로 입력해 주세요.',
                },
                pattern: {
                  value: REGEXP_EN_KR_NUM_HYPHEN_UNDERBAR_SPACE,
                  message: '광고계정명은 영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능합니다.',
                },
              }}
            />
            <ErrorMessage
              errors={AD_AC_errors}
              name={'title'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
          <div className={'col col-extra'}>
            <AppTypography.Text type={'sub'} className={'text'}>
              영문(대소), 한글, 숫자, 언더바(_), -, 띄어쓰기 사용 가능
            </AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>설명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'description'}
              control={AD_AC_control}
              render={({ field }) => {
                return (
                  <AppInputTextArea
                    as="textarea"
                    height={100}
                    maxLength={200}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              시간대
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'timezone'}
              control={AD_AC_control}
              render={({ field }) => {
                return (
                  <AppSelectPicker
                    block
                    placeholder={'시간대 선택'}
                    size={'md'}
                    cleanable={false}
                    searchable={false}
                    data={timezoneData}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  />
                );
              }}
              rules={{
                required: '시간대를 선택해 주세요.',
              }}
            />
            <ErrorMessage
              errors={AD_AC_errors}
              name={'timezone'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              통화
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>KRW</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label className={'text'}>광고주명</AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <AppTypography.Text className={'text'}>{URLParams.name}</AppTypography.Text>
          </div>
        </div>
        <div className={'row'}>
          <div className={'col col-label'}>
            <AppTypography.Label isRequired className={'text'}>
              담당자
            </AppTypography.Label>
          </div>
          <div className={'col col-input'}>
            <Controller
              name={'account_ids'}
              control={AD_AC_control}
              render={({ field }) => {
                return (
                  <Select
                    options={[{ label: '전체 선택', value: 'all' }, ...managerList]}
                    isMulti
                    isClearable={accountIds.some((item: any) => !item.isFixed)}
                    closeMenuOnSelect={false}
                    value={accountIds}
                    styles={selectStyles}
                    onChange={getAdAccountIds}
                    onInputChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                );
              }}
              rules={{
                required: accountIds.length < 1 && '담당자를 선택해 주세요.',
              }}
            />
            <ErrorMessage
              errors={AD_AC_errors}
              name={'account_ids'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </div>
        </div>
      </div>
      <FinalActionDivider />
      <AppPageFooter>
        <AppButton size={'lg'} style={{ width: 138 }} onClick={chkConfirm}>
          취소
        </AppButton>
        <AppButton
          size={'lg'}
          style={{ color: 'white', width: 138, marginLeft: 15 }}
          type={'submit'}
          onClick={AD_AC_handleSubmit(onClickADACSubmit)}
        >
          완료
        </AppButton>
      </AppPageFooter>
    </div>
  );
};

export default AdminAccountAdAccountCreate;
