import React, { useState } from 'react';
import { DateRangePicker, Whisper } from 'rsuite';
import AppPagination from '@components/AppPagination';
import AppPageHeader from '@components/AppPageHeader';
import { AppButton } from '@components/AppButton';
import dayjs from 'dayjs';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import Download from '@assets/images/icons/download/download-big.svg';
import AppPopover from '@components/AppPopover';
import warning from '@assets/images/icons/warning/warning-big.svg';
import { getSalesList } from '@apis/Sales/list.api';
import { getSalesExcel } from '@apis/Sales/excel.api';
import { useQuery } from '@tanstack/react-query';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppTable from '@components/AppTable';
import styled from 'styled-components';
import _ from 'lodash';
import numberWithCommas from '@utils/common';
import Search from '@components/Search';
import AppCheckPicker from '@components/AppPicker/AppCheckPicker';
import EllipsisPopup from '@components/EllipsisPopup';
import TextCell from '@components/Common/TextCell';
import { CommaCell, SpendCell } from '@components/Common/NumberCell';
import AppRowsPicker from '@components/AppPicker/AppRowsPicker';

const { allowedMaxDays } = DateRangePicker;

interface SalesListProps {}

const SalesReport: React.FC<SalesListProps> = () => {
  const [date, setDate] = useState<any>([dayjs().subtract(2, 'days').toDate(), dayjs().subtract(2, 'days').toDate()]);
  const [dateLevel, setDateLevel] = useState('DAILY');
  const [level, setLevel] = useState('AD_ACCOUNT');
  const [main, setMain] = useState(['true', 'false']);

  const [tmpSearchValue, setTmpSearchValue] = useState('');
  const [tmpSearchType, setTmpSearchType] = useState('AD_ACCOUNT');

  const [searchType, setSearchType] = useState(level);
  const [searchValue, setSearchValue] = useState('');

  const [tmpDate, setTmpDate] = useState<any>([
    dayjs().subtract(2, 'days').toDate(),
    dayjs().subtract(2, 'days').toDate(),
  ]);
  const [tmpDateLevel, setTmpDateLevel] = useState('DAILY');
  const [tmpLevel, setTmpLevel] = useState('AD_ACCOUNT');
  const [tmpMain, seTmpMain] = useState(['true', 'false']);

  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalNum, setTotalNum] = useState(0);

  const [salesData, setSalesData] = useState<any[]>([]);

  const NoticeBox = styled.div`
    height: 72px;
    background: var(--disabled-color);
    display: flex;
    align-items: center;
    border-radius: 6px;
    position: relative;
    margin-bottom: 30px;
  `;

  const handleChangeLimit = (dataKey: any) => {
    setPageSize(dataKey);
    setPageNum(1);
  };

  const setSelectedData = () => {
    setPageNum(1);
    setDate(tmpDate);
    setDateLevel(tmpDateLevel);
    setLevel(tmpLevel);
    setMain(tmpMain);
    setSearchType(tmpLevel);
  };

  const fetchSalesList = useQuery(
    ['fetchSalesList', date, dateLevel, level, main, searchValue, pageNum, pageSize],
    async () => {
      const params = {
        date_level: dateLevel,
        level: level,
        main: main,
        start_date: dayjs(date[0]).format('YYYY-MM-DD'),
        end_date: dayjs(date[1]).format('YYYY-MM-DD'),
      };
      let searchParams = '';
      if (searchValue !== '') {
        searchParams = '&search_type=' + searchType + '&search_keyword=' + searchValue;
      }
      const { data } = await getSalesList(params, searchParams, pageNum, pageSize);
      setSalesData(data.content);
      setTotalNum(data.total_elements);
      if (data.content && data.content.length !== 0) {
        return data.content.map((item: any) => {
          return {
            ...item,
            date: item.date || '-',
            ad_account: item.ad_account || '-',
            app: item.app || '-',
            campaign_id: item.campaign_id || '-',
            campaign_name: item.campaign_name || '-',
            ae: item.main || '-',
            impression: item.impression || '0',
            click: item.click || '0',
            install: item.install || '0',
            spend: item.spend || '0',
            currency: item.currency || '-',
          };
        });
      } else {
        return [];
      }
    },
    {
      onSuccess: (data: any) => {
        setSalesData(data);
      },
    }
  );

  const fetchSalesExcel = () => {
    const params = {
      date_level: dateLevel,
      level: level,
      main: main,
      start_date: dayjs(date[0]).format('YYYY-MM-DD'),
      end_date: dayjs(date[1]).format('YYYY-MM-DD'),
    };
    let searchParams = '';
    if (searchValue !== '') {
      searchParams = '&search_type=' + searchType + '&search_keyword=' + searchValue;
    }
    getSalesExcel(params, searchParams, pageNum, pageSize).then((res: any) => {
      const { data } = res;
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([data], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `sales report_${dayjs(date[0]).format('YYYYMMDD')}_${dayjs(date[1]).format('YYYYMMDD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const ValueCell: React.FC<any> = ({ dataKey, rowData, ...props }) => {
    return (
      <AppTable.Cell align={'right'} {...props}>
        <EllipsisPopup text={numberWithCommas(rowData[dataKey])} />
      </AppTable.Cell>
    );
  };

  const handleFilterParamsApply = () => {
    setPageNum(1);
    setSearchType(tmpSearchType);
    setSearchValue(tmpSearchValue);
  };

  const ViewEllipsis: React.FC<any> = ({ rowData, dataKey, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <EllipsisPopup text={rowData[dataKey]} />
      </AppTable.Cell>
    );
  };

  return (
    <div>
      <AppPageHeader title={'매출 리포트'} />
      <div style={{ paddingLeft: 30, paddingRight: 30 }}>
        <NoticeBox>
          <ul style={{ marginTop: '10px' }}>
            <li>
              매출 리포트는 실시간이 아니며, 가장 최신 데이터는 ‘2일 전’입니다. 매일 AM 6시에 데이터가 업데이트됩니다.
            </li>
            <li>기간 범위는 최대 31일까지 선택 가능합니다.</li>
          </ul>
        </NoticeBox>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 30,
          paddingRight: 30,
          borderBottom: '1px solid var(--guide-line)',
          paddingBottom: 14,
        }}
      >
        <div style={{ marginRight: '10px' }}>
          <AppDateRangePicker
            cleanable={false}
            style={{ width: '240px' }}
            value={tmpDate}
            onChange={setTmpDate}
            disabledDate={allowedMaxDays?.(31)}
          />
        </div>
        <div>
          <AppSelectPicker
            placeholder={'일별'}
            size={'md'}
            cleanable={false}
            searchable={false}
            style={{ width: '150px', marginRight: '10px' }}
            value={tmpDateLevel}
            data={[
              { label: '일별', value: 'DAILY' },
              { label: '총합', value: 'TOTAL' },
            ]}
            onChange={(value: any) => {
              setTmpDateLevel(value);
            }}
            renderValue={(value, item: any) => {
              return (
                <span>
                  <span style={{ marginRight: 5 }}>시간:</span>
                  {item?.label}
                </span>
              );
            }}
          />
        </div>
        <div>
          <AppSelectPicker
            placeholder={'광고계정'}
            size={'md'}
            cleanable={false}
            searchable={false}
            style={{ width: '150px', marginRight: '10px' }}
            value={tmpLevel}
            data={[
              { label: '광고계정', value: 'AD_ACCOUNT' },
              { label: '앱 이름', value: 'APP' },
              { label: '캠페인', value: 'CAMPAIGN' },
            ]}
            onChange={(value: any) => setTmpLevel(value)}
            renderValue={(value, item: any) => {
              return (
                <span>
                  <span style={{ marginRight: 5 }}>레벨:</span>
                  {item?.label}
                </span>
              );
            }}
          />
        </div>
        <div>
          <AppCheckPicker
            data={[
              { label: 'main', value: 'true' },
              { label: 'shadow', value: 'false' },
            ]}
            value={tmpMain}
            onChange={(value: any) => seTmpMain(value)}
            searchable={false}
            cleanable={false}
            placeholder={'선택해 주세요.'}
            style={{ width: 120 }}
            renderValue={(value, item: any) => {
              return (
                <span>
                  <span style={{ marginRight: 5 }}>AE:</span>
                  {value.length === 2
                    ? '전체'
                    : _.find(item, (obj) => {
                        return obj.value === value[0];
                      }).label}
                </span>
              );
            }}
          />
        </div>
        <div style={{ marginLeft: '10px' }}>
          <AppButton size={'md'} theme={'gray'} type={'submit'} onClick={setSelectedData} style={{ padding: '0 30px' }}>
            조회
          </AppButton>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 14,
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        <Search
          data={[
            { label: '광고계정', value: 'AD_ACCOUNT' },
            { label: '앱 이름', value: 'APP' },
            { label: '캠페인명', value: 'CAMPAIGN' },
          ].filter((item) =>
            level === 'AD_ACCOUNT'
              ? item.value === 'AD_ACCOUNT'
              : level === 'APP'
              ? item.value === 'AD_ACCOUNT' || item.value === 'APP'
              : true
          )}
          searchKey={tmpSearchType}
          onSearchKeyChange={(value) => setTmpSearchType(value)}
          searchValue={tmpSearchValue}
          onSearchValueChange={(value) => setTmpSearchValue(value)}
          onSearch={handleFilterParamsApply}
        />
        <div>
          <AppButton
            type={'button'}
            size={'md'}
            theme={'white_gray'}
            style={{ marginLeft: '10px', padding: '0 16px', display: 'flex', alignItems: 'center' }}
            onClick={fetchSalesExcel}
          >
            <div style={{ marginRight: '8px' }}>
              <img src={Download} alt="download" style={{ width: 12, height: 12 }} />
            </div>
            <div>다운로드</div>
          </AppButton>
        </div>
      </div>
      <div style={{ marginTop: '15px' }}>
        <AppTable data={salesData} className={'asset-table'} height={550}>
          {dateLevel === 'DAILY' && (
            <AppTable.Column width={130}>
              <AppTable.HeaderCell style={{ paddingLeft: 30 }}>Date</AppTable.HeaderCell>
              <AppTable.Cell style={{ paddingLeft: 30 }} dataKey={'date'} />
            </AppTable.Column>
          )}
          <AppTable.Column flexGrow={1}>
            <AppTable.HeaderCell>광고계정</AppTable.HeaderCell>
            <TextCell dataKey={'ad_account'} />
          </AppTable.Column>
          {(level === 'APP' || level === 'CAMPAIGN') && (
            <AppTable.Column flexGrow={1}>
              <AppTable.HeaderCell>앱 이름</AppTable.HeaderCell>
              <TextCell dataKey={'app'} />
            </AppTable.Column>
          )}
          {level === 'CAMPAIGN' && (
            <>
              <AppTable.Column flexGrow={1}>
                <AppTable.HeaderCell>
                  캠페인명
                  <Whisper
                    trigger="hover"
                    placement="bottomStart"
                    enterable
                    speaker={
                      <AppPopover theme={'white'}>
                        데이터 저장 시점의 캠페인명이 표기되므로, 현재 캠페인명과 다를 수 있습니다
                      </AppPopover>
                    }
                  >
                    <span style={{ marginLeft: '3px' }}>
                      <img src={warning} alt={'warning'} />
                    </span>
                  </Whisper>
                </AppTable.HeaderCell>
                <TextCell dataKey={'campaign_name'} />
              </AppTable.Column>
              <AppTable.Column flexGrow={1}>
                <AppTable.HeaderCell>캠페인ID</AppTable.HeaderCell>
                <TextCell dataKey={'campaign_id'} />
              </AppTable.Column>
              <AppTable.Column width={60}>
                <AppTable.HeaderCell>
                  AE
                  <Whisper
                    trigger="hover"
                    placement="bottomStart"
                    enterable
                    speaker={
                      <AppPopover theme={'white'}>
                        Audience Extension 구분값
                        <br />
                        main: 원스토어 내부 지면 캠페인
                        <br />
                        shadow: 원스토어 외부 지면 캠페인
                      </AppPopover>
                    }
                  >
                    <span style={{ marginLeft: '3px' }}>
                      <img src={warning} alt={'warning'} />
                    </span>
                  </Whisper>
                </AppTable.HeaderCell>
                <TextCell dataKey={'ae'} />
              </AppTable.Column>
            </>
          )}
          <AppTable.Column flexGrow={1} align={'right'}>
            <AppTable.HeaderCell>impression</AppTable.HeaderCell>
            <CommaCell dataKey={'impression'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'}>
            <AppTable.HeaderCell>Click</AppTable.HeaderCell>
            <CommaCell dataKey={'click'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'}>
            <AppTable.HeaderCell>Install</AppTable.HeaderCell>
            <CommaCell dataKey={'install'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'}>
            <AppTable.HeaderCell>Spend</AppTable.HeaderCell>
            <SpendCell currencyKey={'currency'} dataKey={'spend'} />
          </AppTable.Column>
          <AppTable.Column flexGrow={1} align={'right'}>
            <AppTable.HeaderCell style={{ paddingRight: 30 }}>Currency</AppTable.HeaderCell>
            <TextCell dataKey={'currency'} style={{ paddingRight: 30 }} />
          </AppTable.Column>
        </AppTable>
        <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <AppPagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              maxButtons={5}
              size="md"
              total={totalNum}
              limit={pageSize}
              activePage={pageNum}
              onChangePage={setPageNum}
              onChangeLimit={handleChangeLimit}
            />
          </div>
          <div style={{ marginRight: '10px' }}>표시할 행 수</div>
          <div>
            <AppRowsPicker
              placement={'topStart'}
              value={pageSize}
              onChange={(value: any) => handleChangeLimit(value)}
              cleanable={false}
              searchable={false}
              data={[10, 25, 50, 75, 100].map((key) => ({ value: key, label: key }))}
              style={{ width: 70 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
