import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Nav, Sidenav } from 'rsuite';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CampaignIcon from '@assets/images/icons/leftmenu/campagin.svg';
import AssetsIcon from '@assets/images/icons/leftmenu/assets.svg';
import ReportIcon from '@assets/images/icons/leftmenu/report.svg';
import AnalysisIcon from '@assets/images/icons/leftmenu/analysis.svg';
import InvoiceIcon from '@assets/images/icons/leftmenu/invoice.svg';
import AccountIcon from '@assets/images/icons/leftmenu/account.svg';
import CustomerIcon from '@assets/images/icons/leftmenu/customer.svg';
import DashboardIcon from '@assets/images/icons/leftmenu/dashboard.svg';
import _ from 'lodash';
import { getMyInfo } from '@apis/auth.api';

interface AppSideNavProps {}

const StyledSideNav = styled(Sidenav)`
  padding: 30px 0 30px 13px;
  overflow: hidden;
`;
const StyledNav = styled(Nav)`
  .rs-sidenav-item-panel {
    font-weight: 700;
    margin-bottom: 5px;
    margin-top: 20px;

    :first-child {
      margin-top: 0;
    }

    .icon {
      margin-right: 6px;
    }
  }

  .rs-sidenav-item {
    margin-left: 14px !important;
    padding: 5px 0 5px 16px;
    font-size: 12px;
    color: var(--rs-text-primary);
    margin-bottom: 5px;

    &:hover {
      background-color: #e3e3e3;
    }

    &.rs-sidenav-item-active {
      color: var(--primary-color);
      font-weight: 700;
    }

    &-disabled {
      color: var(--disabled-color);
    }
  }
`;

const MODE = import.meta.env.VITE_MODE;

const AppSideNav: React.FC<AppSideNavProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmptyAdAccount = localStorage.getItem('isEmptyAdAccount') === 'true';

  const advertiserId = sessionStorage.getItem('advertiser_id');
  const adAccountId = localStorage.getItem('selectedAdAccount');

  const [role, setRole] = useState(sessionStorage.getItem('role'));

  const [currentKey, setCurrentKey] = useState('');
  const handleNavItemSelect = (data: any) => {
    if (data.path) {
      navigate(data.path);
    } else {
      if (data.key === '/customer-service/help') {
        window.open('/customer-service/help', '_blank');
      } else {
        navigate(data.key);
      }
    }
  };

  // url 치고 들어왔는데 로그인 되어있는 경우
  useEffect(() => {
    if (role === null) {
      getMyInfo().then((res) => {
        if (res.status === 200) {
          // 유저 정보를 세션에 저장.
          setRole(res.data.role);
          Object.keys(res.data).forEach((key) => {
            sessionStorage.setItem(key, res.data[key]);
          });
        }
      });
    }
  });

  useEffect(() => {
    const searchResult = location.pathname.search(/(\/update)|(\/edit)|(\/detail)|(\/create)|(\/failed)/g);
    if (searchResult !== -1) {
      setCurrentKey(location.pathname.slice(0, searchResult));
    } else {
      setCurrentKey(location.pathname);
    }
  }, [location]);

  const navList = useMemo(() => {
    const NAV_CLIENT = [
      {
        title: '캠페인',
        isPanel: true,
        key: 'campaigns',
        icon: CampaignIcon,
        role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
        children: [
          {
            title: '캠페인',
            key: '/campaigns/campaign',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: '소재그룹',
            key: '/campaigns/creative-group',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: '소재',
            key: '/campaigns/creative',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
        ],
      },
      {
        title: '자산',
        isPanel: true,
        key: 'assets',
        icon: AssetsIcon,
        role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
        children: [
          {
            title: '앱',
            key: '/assets/app',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: '트래킹 링크',
            key: '/assets/tracking-link',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: '고객파일',
            key: '/assets/customer-file',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: '맞춤 타겟',
            key: '/assets/audience-target',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
        ],
      },
      {
        title: '리포트',
        isPanel: true,
        key: 'report',
        icon: ReportIcon,
        role: [
          'ADMIN',
          'ADMIN_FINANCE',
          'ADMIN_CS',
          'ADVERTISER_MASTER',
          'ADVERTISER_EMPLOYEE',
          'AGENCY',
          'REPORT_VIEWER',
        ],
        children: [
          {
            title: '광고 리포트',
            key: '/report',
            role: [
              'ADMIN',
              'ADMIN_FINANCE',
              'ADMIN_CS',
              'ADVERTISER_MASTER',
              'ADVERTISER_EMPLOYEE',
              'AGENCY',
              'REPORT_VIEWER',
            ],
          },
        ],
      },
      {
        title: '분석',
        isPanel: true,
        key: 'analytics',
        icon: AnalysisIcon,
        role: [
          'ADMIN',
          'ADMIN_FINANCE',
          'ADMIN_CS',
          'ADVERTISER_MASTER',
          'ADVERTISER_EMPLOYEE',
          'AGENCY',
          'REPORT_VIEWER',
        ],
        children: [
          {
            title: '소재 분석',
            key: '/analytics/creative',
            role: [
              'ADMIN',
              'ADMIN_FINANCE',
              'ADMIN_CS',
              'ADVERTISER_MASTER',
              'ADVERTISER_EMPLOYEE',
              'AGENCY',
              'REPORT_VIEWER',
            ],
          },
          // {
          //   title: '인벤토리 분석',
          //   key: '/analytics/inventory',
          //   role: [
          //     'ADMIN',
          //     'ADMIN_FINANCE',
          //     'ADMIN_CS',
          //     'ADVERTISER_MASTER',
          //     'ADVERTISER_EMPLOYEE',
          //     'AGENCY',
          //     'REPORT_VIEWER',
          //   ],
          // },
        ],
      },
      {
        title: '정산',
        isPanel: true,
        key: 'invoice',
        icon: InvoiceIcon,
        role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
        children: [
          {
            title: '정산 내역',
            key: '/invoice',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
        ],
      },
      // {
      //   title: '쿠폰',
      //   isPanel: true,
      //   key: 'coupon',
      //   icon: CouponIcon,
      //   role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
      //   children: [
      //     {
      //       title: '쿠폰 사용 내역',
      //       key: '/coupon',
      //       role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
      //     },
      //   ],
      // },
      {
        title: '조직/계정',
        isPanel: true,
        key: 'account',
        icon: AccountIcon,
        role: [
          'ADMIN',
          'ADMIN_FINANCE',
          'ADMIN_CS',
          'ADVERTISER_MASTER',
          'ADVERTISER_EMPLOYEE',
          'AGENCY',
          'REPORT_VIEWER',
        ],
        children: [
          {
            title: '광고주',
            key: `/account/advertiser`,
            path: `/account/advertiser/detail/${advertiserId}`,
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS', 'ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: ' 사용자',
            key: '/account/member',
            role: [
              'ADMIN',
              'ADMIN_FINANCE',
              'ADMIN_CS',
              'ADVERTISER_MASTER',
              'ADVERTISER_EMPLOYEE',
              'AGENCY',
              'REPORT_VIEWER',
            ],
          },
          {
            title: '광고계정',
            key: `/account/ad-account`,
            path: `/account/ad-account/detail/${adAccountId}`,
            role: [
              'ADMIN',
              'ADMIN_FINANCE',
              'ADMIN_CS',
              'ADVERTISER_MASTER',
              'ADVERTISER_EMPLOYEE',
              'AGENCY',
              'REPORT_VIEWER',
            ],
          },
        ],
      },
      {
        title: '고객센터',
        isPanel: true,
        key: 'customer-service',
        icon: CustomerIcon,
        role: [
          'ADMIN',
          'ADMIN_FINANCE',
          'ADMIN_CS',
          'ADVERTISER_MASTER',
          'ADVERTISER_EMPLOYEE',
          'AGENCY',
          'REPORT_VIEWER',
        ],
        children: [
          {
            title: '고객문의',
            key: '/customer-service/inquiry',
            role: ['ADVERTISER_MASTER', 'ADVERTISER_EMPLOYEE', 'AGENCY'],
          },
          {
            title: '도움말',
            key: '/customer-service/help',
            role: [
              'ADMIN',
              'ADMIN_FINANCE',
              'ADMIN_CS',
              'ADVERTISER_MASTER',
              'ADVERTISER_EMPLOYEE',
              'AGENCY',
              'REPORT_VIEWER',
            ],
          },
        ],
      },
    ];
    const NAV_ADMIN = [
      {
        title: '대시보드',
        isPanel: true,
        key: '/admin/dashboard',
        icon: DashboardIcon,
        role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
        children: [
          {
            title: '대시보드',
            key: '/admin/dashboard',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
          },
        ],
      },
      {
        title: '리포트',
        isPanel: true,
        key: 'admin/sales-report',
        icon: ReportIcon,
        role: ['ADMIN'],
        children: [
          {
            title: '매출 리포트',
            key: '/admin/sales',
            role: ['ADMIN'],
          },
        ],
      },
      {
        title: '정산',
        isPanel: true,
        key: 'admin/invoice',
        icon: InvoiceIcon,
        role: ['ADMIN', 'ADMIN_FINANCE'],
        children: [
          {
            title: '정산 관리',
            key: '/admin/invoice',
            role: ['ADMIN', 'ADMIN_FINANCE'],
          },
        ],
      },
      // {
      //   title: '쿠폰',
      //   isPanel: true,
      //   key: 'admin/coupon',
      //   icon: CouponIcon,
      //   role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
      //   children: [
      //     {
      //       title: '쿠폰 관리',
      //       key: '/admin/coupon/manage',
      //       role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
      //     },
      //     {
      //       title: '쿠폰 발급 내역',
      //       key: '/admin/coupon/list',
      //       role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
      //     },
      //   ],
      // },
      {
        title: '조직/계정',
        isPanel: true,
        key: 'admin/account',
        icon: AccountIcon,
        role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
        children: [
          {
            title: '광고주',
            key: '/admin/account/advertiser',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
          },
          {
            title: '사용자',
            key: '/admin/account/user',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
          },
          {
            title: '광고계정',
            key: '/admin/account/ad-account',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
          },
          {
            title: '관리자',
            key: '/admin/account/manager',
            role: ['ADMIN', 'ADMIN_FINANCE', 'ADMIN_CS'],
          },
        ],
      },
      {
        title: '고객센터',
        isPanel: true,
        key: 'admin/customer-service',
        icon: CustomerIcon,
        role: ['ADMIN', 'ADMIN_CS'],
        children: [
          {
            title: '고객문의 관리',
            key: '/admin/customer-service/inquiry',
            role: ['ADMIN', 'ADMIN_CS'],
          },
          {
            title: '도움말 관리',
            key: '/admin/customer-service/help',
            role: ['ADMIN', 'ADMIN_CS'],
          },
        ],
      },
    ];

    if (role) {
      return _.filter(MODE === 'CLIENT' ? NAV_CLIENT : NAV_ADMIN, (item) => {
        if (item.children) {
          item.children = _.filter(item.children, (childItem) => {
            return childItem.role.includes(role);
          });
        }
        return item.role.includes(role);
      });
    }
  }, [role, MODE, adAccountId, advertiserId]);

  return (
    <StyledSideNav appearance={'subtle'}>
      <Sidenav.Body>
        <StyledNav activeKey={currentKey}>
          {navList &&
            navList.map((item: any) => {
              return (
                <Fragment key={item.key}>
                  {item.isPanel && (
                    <Nav.Item panel>
                      {item.icon && <img className={'icon'} src={item.icon} alt={item.title} />}
                      {item.title}
                    </Nav.Item>
                  )}
                  {item.children &&
                    item.children.map((child: any) => {
                      return (
                        <Nav.Item
                          disabled={isEmptyAdAccount && MODE === 'CLIENT' && !child.key.includes('help')}
                          key={child.key}
                          eventKey={child.key}
                          onSelect={() => handleNavItemSelect(child)}
                        >
                          {child.title}
                        </Nav.Item>
                      );
                    })}
                </Fragment>
              );
            })}
        </StyledNav>
      </Sidenav.Body>
    </StyledSideNav>
  );
};

export default AppSideNav;
