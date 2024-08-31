import React from 'react';
import ReactDOM from 'react-dom/client';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CustomProvider } from 'rsuite';
import koKR from 'rsuite/locales/ko_KR';
import { RouterProvider } from 'react-router-dom';
import router from '@/routes';
import { queryClient } from './queryClient';
import './shared/index.less';

const locale = {
  ...koKR,
  common: {
    ...koKR.common,
    emptyMessage: '데이터가 없습니다.',
  },
  Picker: {
    ...koKR.Picker,
    placeholder: '선택해 주세요.',
    searchPlaceholder: '검색어를 입력하세요.',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <Helmet>
        <title>{import.meta.env.VITE_MODE === 'CLIENT' ? '원스토어 광고센터' : '원스토어 관리자 어드민'}</title>
      </Helmet>
      <CustomProvider locale={locale}>
        <RouterProvider router={router} />
      </CustomProvider>
    </HelmetProvider>
    <ReactQueryDevtools initialIsOpen={false} position={'bottom-right'} />
  </QueryClientProvider>
);
