import React, { useEffect, useState } from 'react';
import LOGO_ONESTORE from '@assets/images/onestore_logo.svg';
import styled from 'styled-components';
import AppTabs, { AppTab } from '@components/AppTabs';
import TermsPrivacy from '@pages/Terms/TermsPrivacy';
import TermsService from '@pages/Terms/TermsService';
import AppTypography from '@components/AppTypography';
import AppDivider from '@components/AppDivider';
import { useParams } from 'react-router-dom';
import TermsCollection from '@pages/Terms/TermsCollection';

interface TermsProps {}

const StyledTerms = styled.div`
  .rs-nav {
    padding-left: 30px;
    font-size: 13px;
  }

  .rs-nav-item {
    font-weight: 400;
  }

  .rs-nav-item-active {
    font-weight: 400 !important;
  }

  .rs-nav-subtle.rs-nav-horizontal .rs-nav-bar {
    left: 0;
    border-top: 1px solid #e2e2e2;
  }

  .rs-nav-subtle.rs-nav-horizontal .rs-nav-item.rs-nav-item-active::before {
    height: 4px;
  }

  .header {
    display: flex;
    height: 60px;
    align-items: center;
    padding-left: 30px;
    padding-right: 30px;
  }

  .selected-terms {
    padding-left: 50px;
    padding-top: 30px;

    &__title {
      font-size: 24px;
      line-height: 37px;
      font-weight: 400;
      margin-bottom: 20px;
    }
  }

  .terms-table {
    border: 1px solid #222;
    width: 100%;
    margin-top: 10px;

    & + .terms-table {
      margin-top: 10px;
    }

    th,
    td {
      padding: 5px 10px;
      border: 1px solid #222;
      vertical-align: top;
    }

    th {
      text-align: left;
      background-color: #e3e3e3;
    }
  }

  .call__wrapper {
    padding-left: 20px;

    .title {
      font-weight: 700;
    }
  }

  .terms__wrapper {
  }

  .section__wrapper {
    padding-left: 50px;
    padding-right: 80px;
    padding-bottom: 40px;
  }

  .section {
    margin-top: 40px;

    p,
    li {
      font-size: 14px;
      line-height: 22px;
    }

    &__title {
      font-size: 18px;
      line-height: 28px;
    }

    &__desc {
      padding-top: 20px;

      ul {
        padding-left: 20px;
        margin: 0;
        list-style: none;
      }
    }
  }
`;

const Terms: React.FC<TermsProps> = () => {
  const { type } = useParams();
  const [activeTab, setActiveTab] = useState(type);
  const [selectedTermsServiceDate, setSelectedTermsServiceDate] = useState('20221124');
  const [selectedTermsPrivacyDate, setSelectedTermsPrivacyDate] = useState('20221124');
  const [selectedTermsCollectionDate, setSelectedTermsCollectionDate] = useState('20221124');

  const handleTermsDateChange = (type: string, date: string) => {
    switch (type) {
      case 'service':
        setSelectedTermsServiceDate(date);
        break;
      case 'privacy':
        setSelectedTermsPrivacyDate(date);
        break;
      case 'collection':
        setSelectedTermsCollectionDate(date);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setActiveTab(type);
  }, [type]);
  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView();
    }
  }, [location]);

  return (
    <StyledTerms>
      <div className={'header'}>
        <AppTypography.SubTitle level={1}>
          <img src={LOGO_ONESTORE} style={{ width: 120, marginRight: 10 }} alt="logo" />
          <span>광고센터</span>
        </AppTypography.SubTitle>
      </div>
      <AppDivider style={{ margin: '0 0 14px' }} />
      {/*  Tabs */}

      <AppTabs activeKey={activeTab} appearance="subtle" onSelect={(value) => setActiveTab(value)}>
        <AppTab eventKey={'service'}>이용약관</AppTab>
        <AppTab eventKey={'privacy'}>개인정보처리방침</AppTab>
        <AppTab eventKey={'collection'}>개인정보 수집 및 이용안내</AppTab>
      </AppTabs>

      {activeTab === 'service' && (
        <TermsService onTermsDateChange={handleTermsDateChange} selectedTermsDate={selectedTermsServiceDate} />
      )}
      {activeTab === 'privacy' && (
        <TermsPrivacy onTermsDateChange={handleTermsDateChange} selectedTermsDate={selectedTermsPrivacyDate} />
      )}
      {activeTab === 'collection' && (
        <TermsCollection onTermsDateChange={handleTermsDateChange} selectedTermsDate={selectedTermsCollectionDate} />
      )}
    </StyledTerms>
  );
};

export default Terms;
