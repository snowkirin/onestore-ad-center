import React, { useState } from 'react';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import AppTypography from '@components/AppTypography';
import { AppInput, AppInputGroup } from '@components/AppInput';
import searchIcon from '@assets/images/icons/search/search-small.svg';
import { useQuery } from '@tanstack/react-query';
import { getHelpList } from '@apis/Help/list.api';
import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import './style.less';
import { Message, useToaster } from 'rsuite';
import 'quill/dist/quill.snow.css';
import _ from 'lodash';
import { getComparatorsString } from '@utils/filter/dynamicFilter';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';

interface CustomerServiceHelpProps {}

const MainWrapper = styled.div`
  padding: 114px 130px;
  .accordion__button {
    border-bottom: none !important;
  }
  .accordion__panel {
    overflow: auto;
  }
`;

const CustomerServiceHelp: React.FC<CustomerServiceHelpProps> = () => {
  const toaster = useToaster();

  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [categories, setCategories] = useState<any>([]);
  const [helps, setHelps] = useState<any>([]);

  const getSearchData = (key: any) => {
    if (_.isEmpty(key)) {
      toaster.push(<Message showIcon type={'error'} header="검색어를 입력해 주세요." />);
    } else {
      setSearchKey(key);
    }
  };

  const fetchHelpList = useQuery(
    ['fetchHelpList', first, second, searchKey],
    async () => {
      let searchParams = '';
      if (!_.isEmpty(searchKey)) {
        searchParams = encodeURIComponent(getComparatorsString('~', 'title', `%${searchKey}%`));
      }
      const { data } = await getHelpList(first, second, searchParams);
      if (data.categories && data.categories.length > 0) {
        if (data.helps && data.helps.length > 0) {
          return {
            categories:
              data.categories.map((item: any) => {
                return {
                  ...item,
                  children: item.children.map((ele: any) => {
                    return { code: ele.code, name: ele.name, count: ele.count };
                  }),
                };
              }) || [],
            helps: data.helps.map((item: any) => {
              return {
                ...item,
                content: item.content || '-',
                title: item.title || '-',
              };
            }),
          };
        } else {
          return {
            categories:
              data.categories.map((item: any) => {
                return {
                  ...item,
                  children: item.children.map((ele: any) => {
                    return { code: ele.code, name: ele.name, count: ele.count };
                  }),
                };
              }) || [],
            helps: [],
          };
        }
      } else {
        return {
          categories: [],
          helps: [],
        };
      }
    },
    {
      onSuccess: (data: any) => {
        setCategories(data.categories);
        setHelps(data.helps);
      },
    }
  );
  return (
    <MainWrapper>
      <Helmet>
        <title>원스토어 광고센터 도움말</title>
      </Helmet>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        onClick={() => location.reload()}
      >
        <img className={'logo'} src={OneStoreLogo} alt={'ONEStore'} width={'130px'} style={{ marginRight: '10px' }} />
        <AppTypography.Text style={{ fontSize: 18, fontWeight: 'bold' }}>광고센터 도움말</AppTypography.Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
        <AppInputGroup style={{ width: 500, border: '2px solid #494949' }} size={'lg'}>
          <AppInputGroup.Addon style={{ cursor: 'pointer' }}>
            <img src={searchIcon} alt={'search'} style={{ width: 16 }} />
          </AppInputGroup.Addon>
          <AppInput
            onPressEnter={(e: any) => {
              getSearchData(e.target.value);
            }}
          />
        </AppInputGroup>
      </div>
      <div style={{ display: 'flex' }}>
        <div className={'category_box'} style={{ width: '20%', marginTop: '70px' }}>
          <div style={{ width: '100%', borderBottom: '1px solid var(--border-line)' }} />
          <Accordion preExpanded={[0]}>
            {categories.map((item: any, idx: number) => (
              <AccordionItem key={idx} uuid={idx}>
                <AccordionItemHeading>
                  <AccordionItemButton style={{ display: 'flex' }}>
                    <div style={{ color: '#222' }}>
                      {item.name} {searchKey !== '' && <>({item.count})</>}
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                {item.children.map((ele: any, idx: number) => (
                  <AccordionItemPanel
                    key={idx}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setFirst(item.code);
                      setSecond(ele.code);
                    }}
                  >
                    <div style={{ color: '#666666' }}>
                      {ele.name} {searchKey !== '' && <>({ele.count})</>}
                    </div>
                  </AccordionItemPanel>
                ))}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className={'contents_box'} style={{ width: '70%', marginLeft: '30px', marginTop: '49px' }}>
          {searchKey !== '' ? (
            <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>검색결과 (총 {helps.length}건)</div>
          ) : (
            <div style={{ marginTop: '20px' }}></div>
          )}
          <div style={{ width: '100%', borderBottom: '1px solid var(--border-line)' }} />
          <div>
            {helps.length < 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                해당 카테고리 내 검색결과가 없습니다.
              </div>
            ) : (
              <div>
                <Accordion allowZeroExpanded>
                  {helps.map((item: any, idx: number) => (
                    <AccordionItem key={idx}>
                      <AccordionItemHeading>
                        <AccordionItemButton>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#222' }}>
                            <span style={{ color: '#ff7c2d', fontWeight: 'bold' }}>Q.</span>
                            {'　'}
                            {item.title}
                          </div>
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel style={{ backgroundColor: '#f4f4f4' }}>
                        <div dangerouslySetInnerHTML={{ __html: item.raw_content }} style={{ color: '#222' }} />
                      </AccordionItemPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainWrapper>
  );
};

export default CustomerServiceHelp;
