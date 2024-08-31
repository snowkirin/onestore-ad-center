import React, { useState } from 'react';
import { DateRangePicker, Table, useToaster } from 'rsuite';
import { AppButton } from '@components/AppButton';
import AppDateRangePicker from '@components/AppDateRangePicker';
import AppCheckboxGroup from '@components/AppCheckbox';
import AppDivider from '@/components/AppDivider';
import { checkReportStatus, createReport, deleteExistingReport, getReportList } from '@apis/report.api';
import TrashIcon from '@assets/images/icons/trashcan/trashcan-big.svg';
import dayjs from 'dayjs';
import _, { isEmpty as _isEmpty } from 'lodash';
import styled from 'styled-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppTable from '@components/AppTable/Table';
import { dateGroup, levelCheckboxGroup } from '@pages/Report/variables';
import { useNavigate } from 'react-router-dom';
import EllipsisPopup from '@components/EllipsisPopup';
import AppPageHeader from '@components/AppPageHeader';
import AlertModal from '@components/AppModal/AlretModal';
import AppTypography from '@components/AppTypography';

interface ReportListProps {}

const { Column, HeaderCell, Cell } = Table;
const { allowedMaxDays } = DateRangePicker;

/* Styled Component */
const NoticeBox = styled.div`
  height: 116px;
  background: var(--disabled-color);
  display: flex;
  align-items: center;
  border-radius: 6px;
  position: relative;
`;
const RequireBox = styled.div`
  .require-box {
    padding: 20px 30px 0 30px;
  }
  .require-box-sub {
    //padding: 0 30px;
    display: flex;
    align-items: center;
    height: 50px;
    &-title {
      flex: 0 0 90px;
    }
    &-content {
      .rs-checkbox-group {
        display: inline-block;
      }
      &-time {
        width: 100%;
        display: flex;
        align-content: space-between;
        justify-content: space-between;
      }
    }
    &-error {
      margin-right: 10px;
      color: var(--primary-color);
    }
  }
`;

const ReportList: React.FC<ReportListProps> = () => {
  const selectedAdAccount = localStorage.getItem('selectedAdAccount') || '';
  const navigate = useNavigate();
  const toaster = useToaster();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<[Date, Date] | null>([
    dayjs().subtract(1, 'days').toDate(),
    dayjs().subtract(1, 'days').toDate(),
  ]);
  const [levelData, setLevelData] = useState<string[]>(['CAMPAIGN']);
  const [timeData, setTimeData] = useState<string[]>([]);
  const [openRequirement, setOpenRequirement] = useState<string>('close');
  const [error, setError] = useState<string>('');

  const [isOpenAlertModal, setIsOpenAlertModal] = useState(false);

  const [isOpenSecondAlertModal, setIsOpenSecondAlertModal] = useState(false);
  const [isOpenThirdAlertModal, setIsOpenThirdAlertModal] = useState(false);

  // 광고 리포트 조회
  const goReportDetail = (id: string, dateRange: string, date: string, level: string) => {
    // 상태 체크 후 가능하면 페이지 이동
    checkReportStatus(id).then((res: any) => {
      const { data } = res;
      let notOnlyDate = true;
      if (date === 'Date' && level === 'DATE') {
        notOnlyDate = false;
      }
      if (data.status === 'READY') {
        navigate(`/report/detail/${id}/${dateRange}/${notOnlyDate}`);
      } else if (data.status === 'FAILED') {
        //alert('리포트 생성을 실패했습니다. 조회 범위를 줄여서 다시 요청해주세요.');
        setIsOpenSecondAlertModal(true);
      } else {
        setIsOpenThirdAlertModal(true);
        //alert('리포트가 업데이트되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  };

  // 리포트 삭제
  const deleteReport = (id: string) => {
    if (confirm('리포트를 삭제합니다. 계속하시겠습니까?')) {
      deleteExistingReport(id).then((res: any) => {
        if (res.status === 200) {
          queryClient.invalidateQueries(['fetchReportList']);
        }
      });
    }
  };

  // 조회 셀
  const ViewCell: React.FC<any> = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props} className="link-group">
        <div style={{ marginTop: '-4px' }}>
          <AppButton
            theme={'white_gray'}
            style={{ height: '28px', width: '50px', textAlign: 'center', padding: 0 }}
            onClick={() => goReportDetail(rowData[dataKey], rowData['dateRange'], rowData['date'], rowData['level'])}
          >
            조회
          </AppButton>
        </div>
      </Cell>
    );
  };

  //레벨 셀
  const ViewEllipsis: React.FC<any> = ({ rowData, dataKey, ...props }) => {
    return (
      <AppTable.Cell {...props}>
        <EllipsisPopup text={rowData.dimensions.join()} />
      </AppTable.Cell>
    );
  };

  // 삭제 셀
  const DeleteCell: React.FC<any> = ({ rowData, dataKey, ...props }) => {
    return (
      <Cell {...props}>
        <div style={{ cursor: 'pointer' }} onClick={() => deleteReport(rowData[dataKey])}>
          <img src={TrashIcon} alt={'delete'} />
        </div>
      </Cell>
    );
  };

  const fetchReportList = useQuery(
    ['fetchReportList', selectedAdAccount],
    async () => {
      const response = await getReportList({
        ad_account_id: selectedAdAccount,
      });

      if (response.status === 200) {
        if (!_isEmpty(response.data.reports)) {
          return _.sortBy(
            response.data.reports.map((item: any) => {
              return {
                ...item,
                dateRange: item.date_range.start + ' ~ ' + item.date_range.end,
                level: item.dimensions.join(', '),
                date: item.dimensions.indexOf('DATE') > -1 ? 'Date' : '-',
                updated_at: dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss'),
                created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
              };
            }),
            'created_at'
          ).reverse();
        } else {
          return [];
        }
      }
      return response.data;
    },
    {
      enabled: !_isEmpty(selectedAdAccount),
    }
  );

  const makeReport = () => {
    let dimensionData = levelData.concat(timeData);
    if (dimensionData.length === 0) {
      setError('레벨, 시간 중 최소 1개 이상 선택하세요.');
      return;
    } else {
      setError('');
      setOpenRequirement('close');
      const queryParams = {
        ad_account_id: selectedAdAccount,
      };
      const bodyParams = {
        ad_account_id: selectedAdAccount,
        date_range: {
          start: date !== null ? dayjs(date[0]).format('YYYY-MM-DD') : '',
          end: date !== null ? dayjs(date[1]).format('YYYY-MM-DD') : '',
        },
        dimensions: dimensionData,
      };
      createReport(queryParams, bodyParams)
        .then((res: any) => {
          if (res.status === 202) {
            queryClient.invalidateQueries(['fetchReportList']);
          }
        })
        .catch((err: any) => {
          if (err.response.status == 429) {
            setIsOpenAlertModal(true);
          }
        });
    }
  };

  return (
    <>
      <div>
        <AppPageHeader title={'광고리포트'} />
        <div style={{ paddingLeft: 30, paddingRight: 30 }}>
          <NoticeBox>
            <ul style={{ marginTop: '10px' }}>
              <li>
                광고계정 단위로 선택한 조건에 해당하는 리포트를 조회 및 다운로드 할 수 있습니다.(실시간이 아닙니다)
              </li>
              <li>리포트 생성 요청은 최초 요청 후 24시간 이내에 최대 5회까지 가능합니다.</li>
              <li>
                결과값이 2백만행을 초과할 경우 리포트 생성이 불가합니다. 리스트에서 조회 및 다운로드가 불가할 경우, 기간
                등을 단축하여 재요청하세요.
              </li>
              <li>최근 31일 이내 요청한 리포트까지만 조회 및 다운로드 가능합니다.</li>
            </ul>
            <AppButton
              theme={'create'}
              style={{ position: 'absolute', right: '30px', width: 135, height: 32 }}
              onClick={() => {
                setOpenRequirement('open');
              }}
            >
              리포트 생성요청
            </AppButton>
          </NoticeBox>
        </div>
        {openRequirement === 'open' && (
          <RequireBox>
            <div className={'require-box'}>
              <div className={'require-box-sub'}>
                <div className={'require-box-sub-title'}>기간</div>
                <div className={'require-box-sub-content'}>
                  <AppDateRangePicker
                    style={{ width: '240px', marginLeft: 8 }}
                    value={date}
                    onChange={(value) => {
                      setDate(value);
                    }}
                    cleanable={false}
                    disabledDate={allowedMaxDays?.(31)}
                  />
                </div>
              </div>
              <div className={'require-box-sub'}>
                <div className={'require-box-sub-title'}>레벨</div>
                <div className={'require-box-sub-content'}>
                  <AppCheckboxGroup
                    defaultValue={levelData}
                    onChange={(value: string[]) => setLevelData(value)}
                    data={levelCheckboxGroup}
                  />
                </div>
              </div>
              <div className={'require-box-sub'}>
                <div className={'require-box-sub-title'}>시간</div>
                <div className={'require-box-sub-content-time'}>
                  <div>
                    <AppCheckboxGroup onChange={(value: any) => setTimeData(value)} value={timeData} data={dateGroup} />
                  </div>
                  <div className={'require-box-sub-error'}>{error}</div>
                </div>
              </div>
            </div>
            <AppDivider style={{ marginTop: 9, marginBottom: 15 }} />
            <div style={{ textAlign: 'right', position: 'relative', marginRight: 30 }}>
              <AppButton
                size={'md'}
                style={{ width: 100 }}
                onClick={() => {
                  setOpenRequirement('close');
                }}
              >
                취소
              </AppButton>
              <AppButton
                size={'md'}
                type={'submit'}
                theme={'red'}
                onClick={makeReport}
                style={{ width: 100, marginLeft: 15 }}
              >
                요청
              </AppButton>
            </div>
          </RequireBox>
        )}
        <div className={'table-box'} style={{ marginTop: 14 }}>
          <AppTable
            loading={fetchReportList.isLoading}
            data={fetchReportList.data}
            className={'asset-table'}
            height={800}
          >
            <Column flexGrow={0.5} minWidth={160}>
              <HeaderCell align={'left'} style={{ paddingLeft: 30 }}>
                리포트ID
              </HeaderCell>
              <Cell dataKey={'id'} style={{ paddingLeft: 30 }} />
            </Column>
            <Column flexGrow={0.5} minWidth={160}>
              <HeaderCell>기간</HeaderCell>
              <Cell dataKey={'dateRange'} />
            </Column>
            <Column flexGrow={1} minWidth={250}>
              <HeaderCell>레벨</HeaderCell>
              <ViewEllipsis align={'left'} dataKey={'level'} />
            </Column>
            <Column flexGrow={0.3} minWidth={50}>
              <HeaderCell>시간</HeaderCell>
              <Cell dataKey={'date' || '-'} />
            </Column>
            <Column flexGrow={0.5} minWidth={130}>
              <HeaderCell>요청일</HeaderCell>
              <Cell dataKey={'created_at'} />
            </Column>
            <Column width={60}>
              <HeaderCell align={'center'}>조회</HeaderCell>
              <ViewCell align={'center'} dataKey={'id'} />
            </Column>
            <Column width={150}>
              <HeaderCell align={'center'}>삭제</HeaderCell>
              <DeleteCell align={'center'} dataKey={'id'} />
            </Column>
          </AppTable>
        </div>
      </div>
      <AlertModal
        open={isOpenAlertModal}
        onOk={() => setIsOpenAlertModal(false)}
        content={
          <AppTypography.Text>
            리포트 생성 요청 한도를 초과하였습니다.
            <br />
            24시간 이후 시도해주세요.
          </AppTypography.Text>
        }
        title={'한도 초과'}
      />
      <AlertModal
        open={isOpenSecondAlertModal}
        onOk={() => setIsOpenSecondAlertModal(false)}
        content={
          <AppTypography.Text>
            리포트 생성을 실패했습니다.
            <br />
            조회 범위를 줄여서 다시 요청해주세요.
          </AppTypography.Text>
        }
        title={'알림'}
      />
      <AlertModal
        open={isOpenThirdAlertModal}
        onOk={() => setIsOpenThirdAlertModal(false)}
        content={
          <AppTypography.Text>
            리포트가 업데이트되지 않았습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </AppTypography.Text>
        }
        title={'알림'}
      />
    </>
  );
};

export default ReportList;
