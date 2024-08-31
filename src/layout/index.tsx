import React, { useEffect } from 'react';
import { Container } from 'rsuite';
import AppHeader from '@/layout/AppHeader';
import AppContent from '@/layout/AppContent';
import AppSidebar from '@layout/AppSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import CampaignCreateCancelModalContextProvider from '@/utils/context/CampaignCreateCancelModalContext';

interface AppLayoutProps {}
const MODE = import.meta.env.VITE_MODE;

const AppLayout: React.FC<AppLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmptyAdAccount = localStorage.getItem('isEmptyAdAccount') === 'true';

  useEffect(() => {
    // 광고계정이 없고, 광고센터이면 광고계정 생성으로 간다.
    if (isEmptyAdAccount && MODE === 'CLIENT') {
      navigate('/ad-account');
    }
  }, [isEmptyAdAccount, MODE]);

  const withGnb =
    withoutGnb.filter((path) => !location.pathname.includes('admin') && location.pathname.includes(path)).length === 0;
  const withLnb =
    withoutLnb.filter((path) => !location.pathname.includes('admin') && location.pathname.includes(path)).length === 0;

  return (
    <Container style={{ height: '100%', minWidth: 1200 }}>
      <CampaignCreateCancelModalContextProvider>
        {withGnb && <AppHeader />}
        <Container>
          {withLnb && <AppSidebar />}
          <AppContent />
        </Container>
      </CampaignCreateCancelModalContextProvider>
    </Container>
  );
};

export default AppLayout;

const withoutGnb = ['/customer-service/help'];
const withoutLnb = [
  '/customer-service/help',
  '/campaigns/campaign/create',
  '/campaigns/campaign/edit',
  '/ad-account/create',
];
