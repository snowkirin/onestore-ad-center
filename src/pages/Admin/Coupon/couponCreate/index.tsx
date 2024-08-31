import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import Row from '@components/AppGrid/Row';
import Col from '@components/AppGrid/Col';
import AppTypography from '@components/AppTypography';
import { AppButton } from '@components/AppButton';
import { useNavigate } from 'react-router-dom';
import { AppInputCount } from '@components/AppInput';
import { useToaster } from 'rsuite';
import AppInputTextArea from '@components/AppInput/AppInputTextArea';
import dayjs from 'dayjs';
import { createCoupon, getCouponAdAccountList } from '@apis/coupon.api';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { REGEXP_COUPON, REGEXP_NUMBER } from '@utils/regexp';
import AppDatePicker from '@components/AppDatePicker';
import { selectStyles } from '@utils/common';

interface CouponCreateProps {}

const CSS_Label = {
  lineHeight: '32px',
};
const CSS_Cols = {
  flex: '0 0 450px',
};

const AdminCouponCreate: React.FC<CouponCreateProps> = () => {
  let navigate = useNavigate();

  const toaster = useToaster();
  const [adAccounts, setAdAccounts] = useState<any>([]);
  const [comment, setComment] = useState('');
  const [adAccountList, setAdAccountList] = useState<any>([]);

  const {
    handleSubmit: CC_handleSubmit,
    control: CC_control,
    formState: { errors: CC_errors },
  } = useForm();

  const fetchCouponAdAccount = useQuery(
    ['fetchCouponAdAccount'],
    async () => {
      const payload = {
        currency: 'KRW',
        policyId: '',
      };
      const { data } = await getCouponAdAccountList(payload);
      if (!isEmpty(data)) {
        return data.map((item: any) => {
          return {
            label: '광고주: ' + item.advertiser_name + '  /   광고계정: ' + item.name + ' (' + item.id + ')',
            value: item.id,
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setAdAccountList(data);
      },
    }
  );

  const onClickCCSubmit = (data: any) => {
    const CC_data = data;
    CC_data.currency = 'KRW';
    CC_data.expire_month = dayjs(CC_data.expire_month).format('YYYY-MM');
    CC_data.ad_accounts = adAccounts.map((item: any) => item.value);
    createCoupon(CC_data)
      .then((res: any) => {
        if (res.status === 200) {
          navigate('/admin/coupon/manage');
        }
      })
      .catch((err: any) => {
        if (err.response.status === 400) {
          alert(err.response.data.message);
        }
      });
  };

  const chkConfirm = () => {
    if (confirm('쿠폰 생성을 취소하시겠습니까?')) {
      navigate('/admin/coupon/manage');
    }
  };

  return (
    <>
      <div>
        <AppPageHeader title={'쿠폰 생성'} />
        <Row align={'center'}>
          <Col isLabel>
            <AppTypography.Label isRequired style={CSS_Label}>
              쿠폰명
            </AppTypography.Label>
          </Col>
          <Col style={CSS_Cols}>
            <Controller
              name={'name'}
              control={CC_control}
              render={({ field }) => {
                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AppInputCount
                      style={{ width: '450px', marginRight: '10px' }}
                      maxLength={50}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                      placeholder={'2~50자'}
                    />
                    <div style={{ width: '300px' }}>영문(대소), 한글, 숫자, 언더바(_), ., -, 띄어쓰기 사용 가능</div>
                  </div>
                );
              }}
              rules={{
                required: '쿠폰명을 입력해 주세요.',
                pattern: {
                  value: REGEXP_COUPON,
                  message: '쿠폰명은 영문(대소), 한글, 숫자, 언더바(_), ., -, 띄어쓰기 사용 가능합니다.',
                },
              }}
            />
            <ErrorMessage
              errors={CC_errors}
              name={'name'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </Col>
        </Row>
        <Row align={'center'}>
          <Col isLabel>
            <AppTypography.Label isRequired style={CSS_Label}>
              통화/금액
            </AppTypography.Label>
          </Col>
          <Col style={CSS_Cols}>
            <Controller
              name={'value'}
              control={CC_control}
              render={({ field }) => {
                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: '10px' }}>KRW</div>
                    <AppInputCount
                      style={{ width: '412px', marginRight: '10px' }}
                      maxLength={8}
                      placeholder={'금액 입력'}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    />
                  </div>
                );
              }}
              rules={{
                required: '쿠폰금액을 입력해 주세요.',
                pattern: {
                  value: REGEXP_NUMBER,
                  message: '쿠폰금액은 숫자만 사용 가능합니다.',
                },
              }}
            />
            <ErrorMessage
              errors={CC_errors}
              name={'value'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </Col>
        </Row>
        <Row align={'center'}>
          <Col isLabel>
            <AppTypography.Label isRequired style={CSS_Label}>
              쿠폰 만료월
            </AppTypography.Label>
          </Col>
          <Col style={CSS_Cols}>
            <Controller
              name={'expire_month'}
              control={CC_control}
              render={({ field }) => {
                return (
                  <AppDatePicker
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    format={'yyyy-MM'}
                    disabledDate={(date) => dayjs(date).isAfter(dayjs().add(365, 'day'))}
                  />
                );
              }}
              rules={{
                required: '쿠폰 만료월을 입력해 주세요.',
              }}
            />
            <ErrorMessage
              errors={CC_errors}
              name={'expire_month'}
              render={({ message }) => <AppErrorMessage>{message}</AppErrorMessage>}
            />
          </Col>
        </Row>
        <Row align={'center'}>
          <Col isLabel>
            <AppTypography.Label style={CSS_Label}>발급 대상</AppTypography.Label>
          </Col>
          <Col style={CSS_Cols}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '10px', width: '70px' }}>총 {adAccounts.length}개 선택됨</div>
              <div style={{ width: '1200px', zIndex: 5 }}>
                <Select
                  styles={selectStyles}
                  options={[{ label: '전체 선택', value: 'all' }, ...adAccountList]}
                  isMulti
                  closeMenuOnSelect={false}
                  value={adAccounts}
                  onChange={(selected) => {
                    selected.length && selected.find((option: any) => option.value === 'all')
                      ? setAdAccounts(adAccountList)
                      : setAdAccounts(selected);
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col isLabel>
            <AppTypography.Label style={CSS_Label}>메모</AppTypography.Label>
          </Col>
          <Col style={CSS_Cols}>
            <Controller
              name={'comment'}
              control={CC_control}
              render={({ field }) => {
                return (
                  <AppInputTextArea
                    as={'textarea'}
                    maxLength={300}
                    rows={4}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                );
              }}
            />
          </Col>
        </Row>
        <div className={'create-cancel-btn'}>
          <AppButton size={'lg'} style={{ width: 138, marginLeft: 15 }} onClick={chkConfirm}>
            취소
          </AppButton>
          <AppButton
            size={'lg'}
            style={{ color: 'white', width: 138, marginLeft: 15 }}
            type={'submit'}
            onClick={CC_handleSubmit(onClickCCSubmit)}
          >
            생성
          </AppButton>
        </div>
      </div>
    </>
  );
};
export default AdminCouponCreate;
