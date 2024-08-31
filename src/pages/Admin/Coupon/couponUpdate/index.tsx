import React, { useState } from 'react';
import AppPageHeader from '@components/AppPageHeader';
import Row from '@components/AppGrid/Row';
import Col from '@components/AppGrid/Col';
import AppTypography from '@components/AppTypography';
import AppInputTextArea from '../../../../components/AppInput/AppInputTextArea';
import { AppButton } from '@components/AppButton';
import { useNavigate, useParams } from 'react-router-dom';
import { AppInputCount } from '@components/AppInput';
import { useQuery } from '@tanstack/react-query';
import { getCouponAdAccountList, getCouponDetail, updateCoupon } from '@apis/coupon.api';
import AppDivider from '@components/AppDivider';
import Select from 'react-select';
import _ from 'lodash';
import { Whisper } from 'rsuite';
import numberWithCommas, { selectStyles } from '@utils/common';
import AppPopover from '@components/AppPopover';
import warning from '@assets/images/icons/warning/warning-big.svg';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import AppErrorMessage from '@components/AppErrorMessage';
import { REGEXP_COUPON } from '@utils/regexp';

interface CouponCreateProps {}

const CSS_Label = {
  lineHeight: '32px',
};
const CSS_Cols = {
  flex: '0 0 450px',
};

// 밑에 defaultvalue가 안 먹어서 다시 해야함

const AdminCouponUpdate: React.FC<CouponCreateProps> = () => {
  let navigate = useNavigate();
  const { id: couponSetId } = useParams();

  const [adAccounts, setAdAccounts] = useState<any>([]);
  const [adAccountList, setAdAccountList] = useState<any>([]);

  const {
    handleSubmit: CC_handleSubmit,
    control: CC_control,
    formState: { errors: CC_errors },
  } = useForm();

  const fetchCouponDetail = useQuery(
    ['fetchCouponDetail', couponSetId],
    async () => {
      const result = await getCouponDetail(couponSetId);
      if (result.status === 200) {
        return result.data;
      } else {
        return [];
      }
    },
    {
      enabled: !_.isEmpty(couponSetId),
    }
  );

  // 이미 발급된 건은 isDisabled : true 처리
  const fetchCouponAdAccount = useQuery(
    ['fetchCouponAdAccount'],
    async () => {
      const payload = {
        currency: 'KRW',
        policyId: couponSetId,
      };
      const { data } = await getCouponAdAccountList(payload);
      if (!_.isEmpty(data)) {
        return data.map((item: any) => {
          return {
            label: item.advertiser_name + '  /   광고계정: ' + item.name + ' (' + item.id + ') ',
            value: item.id,
            isDisabled: item.disabled,
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
    CC_data.ad_accounts = adAccounts.map((item: any) => item.value);
    updateCoupon(couponSetId, CC_data)
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
    if (confirm('쿠폰 수정을 취소하시겠습니까? 수정한 내용은 저장되지 않습니다.')) {
      navigate('/admin/coupon/manage');
    }
  };

  return (
    <>
      {!fetchCouponDetail.isFetching && (
        <div>
          <AppPageHeader title={'쿠폰 조회/수정'} />
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label isRequired style={CSS_Label}>
                쿠폰명
              </AppTypography.Label>
            </Col>
            <Col style={CSS_Cols}>
              <Controller
                name={'name'}
                defaultValue={fetchCouponDetail.data?.name}
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
            <Col>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '10px' }}>KRW</div>
                {numberWithCommas(fetchCouponDetail.data?.value)}
              </div>
            </Col>
          </Row>
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label isRequired style={CSS_Label}>
                쿠폰 만료월
              </AppTypography.Label>
            </Col>
            <Col>{fetchCouponDetail.data?.expire_month}</Col>
          </Row>
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label>
                발급 대상
                <Whisper
                  trigger="hover"
                  placement="bottomStart"
                  enterable
                  speaker={<AppPopover theme={'white'}>동일 쿠폰은 광고계정당 1회만 발급 가능합니다.</AppPopover>}
                >
                  <span style={{ marginLeft: '3px' }}>
                    <img src={warning} alt={'warning'} />
                  </span>
                </Whisper>
              </AppTypography.Label>
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
                        ? setAdAccounts(adAccountList.filter((item: any) => !item.isDisabled))
                        : setAdAccounts(selected);
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label style={CSS_Label}>총 발행금액/발행수</AppTypography.Label>
            </Col>
            <Col style={{ display: 'flex' }}>
              <div style={{ marginRight: '10px' }}>
                {numberWithCommas(fetchCouponDetail.data?.total_value)} /{' '}
                {numberWithCommas(fetchCouponDetail.data?.release_count)}개
              </div>
              <div
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => navigate(`/admin/coupon/list?name=${fetchCouponDetail.data?.name}`)}
              >
                발급 내역 확인 &gt;
              </div>
            </Col>
          </Row>
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label style={CSS_Label}>메모</AppTypography.Label>
            </Col>
            <Col style={CSS_Cols}>
              <Controller
                name={'comment'}
                defaultValue={fetchCouponDetail.data?.comment}
                control={CC_control}
                render={({ field }) => {
                  return (
                    <AppInputTextArea
                      as={'textarea'}
                      maxLength={300}
                      rows={4}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  );
                }}
              />
            </Col>
          </Row>
          <AppDivider />
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label style={CSS_Label}>생성일시</AppTypography.Label>
            </Col>
            <Col>
              <div>{fetchCouponDetail.data?.created_at}</div>
            </Col>
          </Row>
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label style={CSS_Label}>마지막 수정일시</AppTypography.Label>
            </Col>
            <Col>
              <div>{fetchCouponDetail.data?.updated_at}</div>
            </Col>
          </Row>
          <Row align={'center'}>
            <Col isLabel>
              <AppTypography.Label style={CSS_Label}>생성자</AppTypography.Label>
            </Col>
            <Col>
              <div>{fetchCouponDetail.data?.created_by}</div>
            </Col>
          </Row>
          <AppDivider />
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
      )}
    </>
  );
};
export default AdminCouponUpdate;
