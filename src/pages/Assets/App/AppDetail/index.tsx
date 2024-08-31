import React, { useEffect, useMemo, useState } from 'react';
import { AppButton } from '@components/AppButton';
import { getProductDetail } from '@apis/product.api';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';
import AppPageHeader from '@components/AppPageHeader';
import AppTypography from '@components/AppTypography';
import { FinalActionDivider } from '@components/AppDivider';
import AppPageFooter from '@components/AppPageFooter';

interface trackingViewProps {}
const AppDetail: React.FC<trackingViewProps> = () => {
  // Variables
  const adAccountList: any = useRouteLoaderData('layout');
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const navigate = useNavigate();
  const { id: productID } = useParams();

  // UseState
  const [AppContent, setAppContent] = useState<any>([]);

  // Function
  const getViewApp = () => {
    getProductDetail(productID!).then((res: any) => {
      const { data } = res;
      setAppContent(data.product);
    });
  };

  const selectedAdAccountTitle = useMemo(() => {
    return adAccountList.find((item: any) => item.id === selectedAdAccount).title;
  }, [selectedAdAccount]);

  // UseEffect
  useEffect(() => {
    getViewApp();
  }, []);

  return (
    <>
      <div>
        <AppPageHeader title={'앱 조회'} />
        <div style={{ padding: '16px 30px 0 30px' }}>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>광고계정명</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{selectedAdAccountTitle}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>OS</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>ANDROID</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>앱 ID</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.id || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>앱 이름</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.title || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>앱 설명</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.description || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>상태</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>
                {AppContent.app?.mmp_integration?.status || '-'}
              </AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>도메인</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.advertiser_domain || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>앱 마켓 URL</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.app?.app_store_url || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>앱 마켓 번들 ID</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.app?.bundle_id || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>개발자명</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.developer_name || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>카테고리</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.app?.category || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>콘텐츠 등급</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.app?.content_rating || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>MMP</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>{AppContent.app?.mmp_integration?.mmp || '-'}</AppTypography.Text>
            </div>
          </div>
          <div className={'row'}>
            <div className={'col col-label'}>
              <AppTypography.Label className={'text'}>MMP 번들 ID</AppTypography.Label>
            </div>
            <div className={'col col-input'}>
              <AppTypography.Text className={'text'}>
                {AppContent.app?.mmp_integration?.mmp_bundle_id || '-'}
              </AppTypography.Text>
            </div>
          </div>
        </div>
        <FinalActionDivider />
        <AppPageFooter>
          <AppButton size={'lg'} style={{ width: 138 }} onClick={() => navigate('/assets/app')}>
            목록
          </AppButton>
          <AppButton
            size={'lg'}
            theme={'red'}
            style={{ width: 138, marginLeft: 20 }}
            onClick={() => navigate(`/assets/app/update/${productID}`)}
          >
            수정
          </AppButton>
        </AppPageFooter>
      </div>
    </>
  );
};

export default AppDetail;
