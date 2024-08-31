import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/layout';
import Login from '@pages/Login';
import { FindID, FindPW } from '@pages/Find';
import SignUp from '@pages/SignUp';
import { AdAccountCreate, AdAccountLanding } from '@pages/AdAccount';
import {
  CampaignBridge,
  CampaignCreate,
  CampaignEdit,
  CampaignList,
  CreativeCreate,
  CreativeGroupCreate,
  CreativeGroupDetail,
  CreativeGroupEdit,
  CreativeGroupList,
  CreativeList,
} from '@pages/Campaigns';
import {
  AppCreate,
  AppDetail,
  AppList,
  AppUpdate,
  AudienceTargetCreate,
  AudienceTargetDetail,
  AudienceTargetEdit,
  AudienceTargetList,
  CustomerCreate,
  CustomerDetail,
  CustomerList,
  CustomerUpdate,
  TrackingCreate,
  TrackingDetail,
  TrackingList,
  TrackingUpdate,
} from '@pages/Assets';
import { ReportDetail, ReportList } from '@pages/Report';
import { AnalyticsCreative, AnalyticsInventory } from '@pages/Analytics';
import { InvoiceDetail, InvoiceList } from '@pages/Invoice';
import { CouponList } from '@pages/Coupon';
import {
  AccountAdAccount,
  AccountMemberCreate,
  AccountMemberDetail,
  AccountMemberList,
  AccountMemberUpdate,
} from '@pages/Account';
import { AccountAdvertiserDetail, AccountAdvertiserUpdate } from '@pages/Account/Advertiser';
import {
  CustomerServiceHelp,
  CustomerServiceInquiryCreate,
  CustomerServiceInquiryDetail,
  CustomerServiceInquiryList,
} from '@pages/CustomerService';
import Dashboard from '@pages/Admin/Dashboard';
import SalesReport from '@pages/Admin/SalesReport';
import {
  AdminAccountAdAccountCreate,
  AdminAccountAdAccountList,
  AdminAccountAdAccountUpdate,
  AdminAccountAdvertiserFailed,
  AdminAccountAdvertiserList,
  AdminAccountAdvertiserUpdate,
  AdminAccountManagerCreate,
  AdminAccountManagerList,
  AdminAccountManagerUpdate,
  AdminAccountUserList,
  AdminAccountUserUpdate,
  AdminCouponCreate,
  AdminCouponList,
  AdminCouponManage,
  AdminCouponUpdate,
  AdminCustomerServiceHelpCreate,
  AdminCustomerServiceHelpList,
  AdminCustomerServiceHelpUpdate,
  AdminCustomerServiceInquiryDetail,
  AdminCustomerServiceInquiryList,
  AdminInvoiceDetail,
  AdminInvoiceList,
  AdminInvoiceUpdate,
} from '@pages/Admin';
import Terms from '@pages/Terms';
import NotPage from '@pages/404';
import ConfirmPassword from '@pages/Password';
import { getAdAccounts } from '@apis/ad_account.api';

const MODE = import.meta.env.VITE_MODE;

const router = createBrowserRouter([
  // 로그인 페이지
  {
    path: '/',
    element: <Login />,
  },
  // 아아디/비멀번호 찾기
  {
    path: 'find',
    children: [
      {
        path: 'id',
        element: <FindID />,
      },
      {
        path: 'pw',
        element: <FindPW />,
      },
    ],
  },
  // 회원가입
  {
    path: 'signup',
    element: <SignUp />,
  },
  // 고객센터 - 도움말
  {
    path: `customer-service/help`,
    element: <CustomerServiceHelp />,
  },
  // 메인페이지
  {
    element: <AppLayout />,
    id: 'layout',
    loader: async () => {
      if (MODE === 'CLIENT') {
        const { data } = await getAdAccounts();
        if (data.ad_accounts && data.ad_accounts.length > 0) {
          const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
          const matchResult = data.ad_accounts.some((item: any) => {
            return item.id === selectedAdAccount;
          });
          if (!matchResult) {
            localStorage.setItem('selectedAdAccount', data.ad_accounts[0].id);
            localStorage.setItem('selectedAdAccount.title', data.ad_accounts[0].title);
          }
          localStorage.setItem('isEmptyAdAccount', 'false');
          return data.ad_accounts;
        } else {
          localStorage.setItem('selectedAdAccount', '');
          localStorage.setItem('selectedAdAccount.title', '');
          localStorage.setItem('isEmptyAdAccount', 'true');
          return [];
        }
      }
    },
    children: [
      // 조직/계정 메뉴 비밀번호 재확인
      {
        path: 'confirm-password',
        element: <ConfirmPassword />,
      },
      // 광고 계정
      {
        path: 'ad-account',
        children: [
          {
            path: '',
            element: <AdAccountLanding />,
          },
          {
            path: 'create',
            element: <AdAccountCreate />,
          },
        ],
      },
      // 캠페인
      {
        path: 'campaigns',
        children: [
          // 캠페인 - 캠페인
          {
            path: 'campaign',
            children: [
              {
                children: [
                  {
                    path: '',
                    element: <CampaignList />,
                  },
                ],
              },
              {
                path: 'create',
                element: <CampaignCreate />,
              },
              {
                path: 'edit/:id',
                element: <CampaignEdit />,
              },
            ],
          },
          {
            path: 'bridge',
            element: <CampaignBridge />,
          },
          // 캠페인 - 소재
          {
            path: 'creative',
            children: [
              {
                path: '',
                element: <CreativeList />,
              },
              {
                path: 'create/:type/:productId',
                element: <CreativeCreate />,
              },
            ],
          },
          // 캠페인 - 소재그룹
          {
            path: 'creative-group',
            children: [
              {
                path: '',
                element: <CreativeGroupList />,
              },
              {
                path: 'create',
                element: <CreativeGroupCreate />,
              },
              {
                path: 'detail/:id',
                element: <CreativeGroupDetail />,
              },
              {
                path: 'edit/:id',
                element: <CreativeGroupEdit />,
              },
            ],
          },
        ],
      },
      // 자산
      {
        path: 'assets',
        children: [
          // 자산 - 앱
          {
            path: 'app',
            children: [
              // 자산 - 앱 - 리스트
              {
                path: '',
                element: <AppList />,
              },
              // 자산 - 앱 - 생성
              {
                path: 'create',
                element: <AppCreate />,
              },
              // 자산 - 앱 - 상세
              {
                path: 'detail/:id',
                element: <AppDetail />,
              },
              // 자산 앱 - 수정
              {
                path: 'update/:id',
                element: <AppUpdate />,
              },
            ],
          },
          // 자산 - 트래킹 링크
          {
            path: 'tracking-link',
            children: [
              // 자산 - 트래킹 링크 - 리스트
              {
                path: '',
                element: <TrackingList />,
              },
              // 자산 - 트래킹 링크 - 생성
              {
                path: 'create',
                element: <TrackingCreate />,
              },
              // 자산 - 트래킹 링크 - 상세
              {
                path: 'detail/:id/:title',
                element: <TrackingDetail />,
              },
              // 자산 - 트래킹 링크 - 수정
              {
                path: 'update/:id/:title',
                element: <TrackingUpdate />,
              },
            ],
          },
          // 자산 - 고객 파일
          {
            path: `customer-file`,
            children: [
              // 자산 - 고객 파일 - 리스트
              {
                path: '',
                element: <CustomerList />,
              },
              // 자산 - 고객 파일 - 생성
              {
                path: 'create',
                element: <CustomerCreate />,
              },
              // 자산 - 고객 파일 - 상세
              {
                path: `detail/:customerSetId/:adAccountId`,
                element: <CustomerDetail />,
              },
              // 자산 - 고객 파일 - 수정
              {
                path: `update/:customerSetId/:adAccountId`,
                element: <CustomerUpdate />,
              },
            ],
          },
          // 자산 - 맞춤 타겟
          {
            path: `audience-target`,
            children: [
              // 자산 - 맞춤 타겟 - 리스트
              {
                path: '',
                element: <AudienceTargetList />,
              },
              // 자산 - 맞춤 타겟 - 생성
              {
                path: `create`,
                element: <AudienceTargetCreate />,
              },
              // 자산 - 맞춤 타겟 - 상세
              {
                path: `detail/:audienceTargetId`,
                element: <AudienceTargetDetail />,
              },
              // 자산 - 맞춤 타겟 - 수정
              {
                path: `edit/:audienceTargetId`,
                element: <AudienceTargetEdit />,
              },
            ],
          },
        ],
      },
      // 리포트
      {
        path: 'report',
        children: [
          // 리포트 - 리스트
          {
            path: '',
            element: <ReportList />,
          },
          // 리포트 - 상세
          {
            path: `detail/:reportId/:dateRange/:notOnlyDate`,
            element: <ReportDetail />,
          },
        ],
      },
      // 분석
      {
        path: `analytics`,
        children: [
          // 분석 - 소재
          {
            path: `creative`,
            element: <AnalyticsCreative />,
          },
          // 분석 - 인벤토리
          {
            path: `inventory`,
            element: <AnalyticsInventory />,
          },
        ],
      },
      // 정산
      {
        path: 'invoice',
        children: [
          // 정산 - 리스트
          {
            path: '',
            element: <InvoiceList />,
          },
          // 정산 - 상세
          {
            path: `detail/:id`,
            element: <InvoiceDetail />,
          },
        ],
      },
      // 쿠폰
      {
        path: 'coupon',
        element: <CouponList />,
      },
      // 조직/계정
      {
        path: `account`,
        children: [
          // 조직/계정 - 광고주
          {
            path: `advertiser`,
            children: [
              {
                path: `update/:advertiserId`,
                element: <AccountAdvertiserUpdate />,
              },
              {
                path: `detail/:advertiserId`,
                element: <AccountAdvertiserDetail />,
              },
            ],
          },
          // 조직/계정 - 광고계정
          {
            path: `ad-account/detail/:adAccountId`,
            element: <AccountAdAccount />,
          },
          // 조직/계정 - 사용자
          {
            path: `member`,
            children: [
              // 조직/계정 - 사용자 - 리스트
              {
                path: ``,
                element: <AccountMemberList />,
              },
              // 조직/계정 - 사용자 - 생성
              {
                path: `create`,
                element: <AccountMemberCreate />,
              },
              // 조직/계정 - 사용자 - 상세
              {
                path: `detail/:accountId`,
                element: <AccountMemberDetail />,
              },
              // 조직/계정 - 사용자 - 수정
              {
                path: `update/:accountId`,
                element: <AccountMemberUpdate />,
              },
            ],
          },
        ],
      },
      // 고객센터
      {
        path: `customer-service`,
        children: [
          // 고객센터 - 고객문의
          {
            path: `inquiry`,
            children: [
              // 고객센터 - 고객문의 - 리스트
              {
                path: ``,
                element: <CustomerServiceInquiryList />,
              },
              // 고객센터 - 고객문의 - 생성
              {
                path: `create`,
                element: <CustomerServiceInquiryCreate />,
              },
              // 고객센터 - 고객문의 - 상세
              {
                path: `detail/:inquiryId`,
                element: <CustomerServiceInquiryDetail />,
              },
            ],
          },
        ],
      },
      // 관리자
      {
        path: `admin`,
        children: [
          // 관리자 - 대시보드
          {
            path: `dashboard`,
            // 추후 <AdminDashboard />로 변경할것.
            element: <Dashboard />,
          },
          // 관리자 - 리포트
          {
            path: `sales`,
            element: <SalesReport />,
          },
          // 관리자 - 정산 관리
          {
            path: 'invoice',
            children: [
              {
                path: '',
                element: <AdminInvoiceList />,
              },
              {
                path: 'detail/:id',
                element: <AdminInvoiceDetail />,
              },
              {
                path: 'update/:id',
                element: <AdminInvoiceUpdate />,
              },
            ],
          },
          // 관리자 - 쿠폰
          {
            path: `coupon`,
            children: [
              // 관리자 - 쿠폰 - 발급 내역
              {
                path: `list`,
                element: <AdminCouponList />,
              },
              // 관리자 - 쿠폰 - 생성
              {
                path: `create`,
                element: <AdminCouponCreate />,
              },
              // 관리자 - 쿠폰 - 관리
              {
                path: `manage`,
                element: <AdminCouponManage />,
              },
              // 관리자 - 쿠폰 - 수정
              {
                path: `update/:id`,
                element: <AdminCouponUpdate />,
              },
            ],
          },
          // 관리자 - 조직/계정
          {
            path: `account`,
            children: [
              // 관리자 - 조직/계정 - 광고주
              {
                path: `advertiser`,
                children: [
                  // 관리자 - 조직/계정 - 광고주 - 리스트
                  {
                    path: ``,
                    element: <AdminAccountAdvertiserList />,
                  },
                  // 관리자 - 조직/계정 - 광고주 - 수정
                  {
                    path: `update/:advertiserId`,
                    element: <AdminAccountAdvertiserUpdate />,
                  },
                  // 관리자 - 조직/계정 - 광고주 - ???
                  {
                    path: `failed/:advertiserId`,
                    element: <AdminAccountAdvertiserFailed />,
                  },
                ],
              },
              // 관리자 - 조직/계정 - 사용자
              {
                path: `user`,
                children: [
                  // 관리자 - 조직/계정 - 사용자 - 리스트
                  {
                    path: ``,
                    element: <AdminAccountUserList />,
                  },
                  // 관리자 - 조직/계정 - 사용자 - 수정
                  {
                    path: `update/:userId`,
                    element: <AdminAccountUserUpdate />,
                  },
                ],
              },
              // 관리자 - 조직/계정 - 광고계정
              {
                path: `ad-account`,
                children: [
                  // 관리자 - 조직/계정 - 광고계정 - 리스트
                  {
                    path: ``,
                    element: <AdminAccountAdAccountList />,
                  },
                  // 관리자 - 조직/계정 - 광고계정 - 생성
                  {
                    path: `create`,
                    element: <AdminAccountAdAccountCreate />,
                  },
                  // 관리자 - 조직/계정 - 광고계정 - 수정
                  {
                    path: `update`,
                    element: <AdminAccountAdAccountUpdate />,
                  },
                ],
              },
              // 관리자 - 조직/계정 - 관리자
              {
                path: `manager`,
                children: [
                  // 관리자 - 조직/계정 - 관리자 - 리스트
                  {
                    path: ``,
                    element: <AdminAccountManagerList />,
                  },
                  // 관리자 - 조직/계정 - 관리자 - 생성
                  {
                    path: `create`,
                    element: <AdminAccountManagerCreate />,
                  },
                  // 관리자 - 조직/계정 - 관리자 - 수정
                  {
                    path: `update/:id`,
                    element: <AdminAccountManagerUpdate />,
                  },
                ],
              },
            ],
          },
          // 관리자 - 고객센터
          {
            path: `customer-service`,
            children: [
              // 관리자 - 고객센터 - 고객문의
              {
                path: `inquiry`,
                children: [
                  // 관리자 - 고객센터 - 고객문의 - 리스트
                  {
                    path: ``,
                    element: <AdminCustomerServiceInquiryList />,
                  },
                  {
                    path: `detail/:inquiryId`,
                    element: <AdminCustomerServiceInquiryDetail />,
                  },
                ],
              },
              // 관리자 - 고객센터 - 도움말
              {
                path: `help`,
                children: [
                  // 관리자 - 고객센터 - 도움말 - 리스트
                  {
                    path: ``,
                    element: <AdminCustomerServiceHelpList />,
                  },
                  // 관리자 - 고객센터 - 도움말 - 생성
                  {
                    path: `create`,
                    element: <AdminCustomerServiceHelpCreate />,
                  },
                  // 관리자 - 고객센터 - 도움말 - 수정
                  {
                    path: `update/:id`,
                    element: <AdminCustomerServiceHelpUpdate />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  // 약관
  {
    path: 'terms/:type',
    element: <Terms />,
  },
  // 에러페이지
  {
    path: `*`,
    element: <NotPage />,
  },
]);

export default router;
