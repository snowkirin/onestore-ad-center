import React, { useEffect, useState } from 'react';
import { AppButton } from '@components/AppButton';
import AppModal from '@/components/AppModal';
import { Checkbox } from 'rsuite';
import AppTypography from '@components/AppTypography';
import { useNavigate } from 'react-router-dom';
import ICON_WARNING from '@assets/images/icons/warning/warning-big.svg';
import dayjs from 'dayjs';

interface AdAccountLandingProps {}

const AdAccountLanding: React.FC<AdAccountLandingProps> = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShowToday, setIsShowToday] = useState(false);

  const handleModalCancel = () => {
    setIsShowToday(false);
    setIsModalOpen(false);
  };

  const handleModalSubmit = () => {
    if (isShowToday) {
      localStorage.setItem('exp_ad_account', dayjs().add(1, 'day').format('YYYYMMDD'));
    }
    setIsModalOpen(false);
    navigate('create');
  };

  useEffect(() => {
    // 진입시 기본적으로 모달창 보여줌.
    if (localStorage.getItem('exp_ad_account')) {
      const expDate = localStorage.getItem('exp_ad_account');
      if (dayjs().isBefore(dayjs(expDate))) {
        setIsModalOpen(false);
      } else {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
    return () => {
      setIsShowToday(false);
      setIsModalOpen(false);
    };
  }, []);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img src={ICON_WARNING} alt="경고" style={{ width: 40 }} />
          <AppTypography.SubTitle level={1} style={{ marginTop: 10 }}>
            광고를 등록하고 운영할 광고계정을 생성해 주세요.
          </AppTypography.SubTitle>
          <AppButton theme={'red'} style={{ marginTop: 10, width: 138 }} onClick={() => navigate('create')} size={'lg'}>
            광고계정 생성
          </AppButton>
        </div>
      </div>

      <AppModal open={isModalOpen} onClose={handleModalCancel} width={600}>
        <AppModal.Header>
          <AppModal.Title>{sessionStorage.getItem('signin_id') || ''}님 환영합니다.</AppModal.Title>
        </AppModal.Header>
        <AppModal.Body>
          <AppTypography.Text>
            원스토어 광고센터를 이용하려면 광고를 등록하고 운영할 광고계정이 필요합니다.
            <br />
            지금 바로 광고계정을 생성하시겠습니까?
          </AppTypography.Text>
        </AppModal.Body>
        <AppModal.Footer>
          <AppButton style={{ width: 100 }} onClick={handleModalCancel}>
            취소
          </AppButton>
          <AppButton style={{ width: 100 }} theme={'red'} onClick={handleModalSubmit}>
            확인
          </AppButton>
          <Checkbox
            style={{
              position: 'absolute',
              right: 30,
              top: 25,
            }}
            checked={isShowToday}
            onChange={(value, checked) => setIsShowToday(checked)}
          >
            오늘은 그만 보기
          </Checkbox>
        </AppModal.Footer>
      </AppModal>
    </>
  );
};

export default AdAccountLanding;
