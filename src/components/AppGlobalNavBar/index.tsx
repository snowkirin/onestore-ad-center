import React, { useContext, useEffect, useRef, useState } from 'react';
import { Badge, Checkbox, Popover, Table, Whisper } from 'rsuite';
import AppSelectPicker from '@components/AppPicker/AppSelectPicker';
import OneStoreLogo from '@assets/images/onestore_logo.svg';
import AlarmIcon from '@assets/images/icons/alarm/alarm-big.svg';
import AlarmIconRed from '@assets/images/icons/alarm/alarm-red.svg';
import AppTypography from '@components/AppTypography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signOut } from '@apis/auth.api';
import { useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import {
  getNotificationConfig,
  getNotificationList,
  updateNotificationConfig,
  updateNotificationRead,
  updateNotificationReadAll,
} from '@apis/notification.api';
import { getComparatorsString } from '@utils/filter/dynamicFilter';
import IconSetting from '@assets/images/icons/setting/setting-small.svg';
import styled from 'styled-components';
import AppModal from '@components/AppModal';
import { AppButton } from '@components/AppButton';
import dayjs from 'dayjs';
// import { OverlayTriggerInstance } from 'rsuite/Picker';
import _ from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { initSessionStorage } from '@utils/functions';
import CloseIcon from '@rsuite/icons/Close';
import { CampaignCreateCancelModalContext } from '@utils/context/CampaignCreateCancelModalContext';
import AppPopover from '@components/AppPopover';

interface AppGlobalNavBarProps {}

const translateNotificationConfig: {
  [key: string]: string;
} = {
  invoice: '정산',
  coupon: '쿠폰',
  question_reply: '문의',
  question_created: '문의 등록',
  email: '이메일 받기',
};

const StyledGNB = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding-left: 30px;
  padding-right: 30px;
  border-bottom: 1px solid #d8d8d8;
  .left-side {
    display: flex;
    align-items: center;
    .logo {
      .logo__title {
        display: flex;
      }
      .logo__image {
        width: 115px;
      }
      .logo__text {
        margin-left: 10px;
      }
    }
  }
  .right-side {
    display: flex;
    align-items: center;
    .ad-account__list {
      margin-right: 30px;
    }
    .alarm {
      margin-right: 20px;
      cursor: pointer;
    }
    .user {
      color: #e15656;
      margin-right: 30px;
      cursor: pointer;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .logout {
      cursor: pointer;
    }
  }
`;
const StyledPopover = styled(Popover)`
  width: 250px;
  padding: 0;

  .rs-popover-title {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    align-items: center;
  }

  .title {
    font-size: var(--lg-font-size);
    line-height: var(--lg-line-height);
    font-weight: 700;
  }

  .body {
    border-top: 1px solid #9a9a9a;
    border-bottom: 1px solid #9a9a9a;
    max-height: 200px;
    overflow-y: auto;

    ::-webkit-scrollbar {
      width: 6px; /* 스크롤바의 너비 */
    }

    ::-webkit-scrollbar-thumb {
      height: 30%; /* 스크롤바의 길이 */
      background-color: var(--primary-color);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-track {
      background-color: #e3e3e3;
    }

    .item {
      position: relative;
      padding: 5px 20px;
      border-bottom: 1px solid #e2e2e2;
      cursor: pointer;

      &:last-child {
        border-bottom: 0 none;
      }
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;

    .link {
      cursor: pointer;
      color: #267c97;
      font-size: 13px;
      line-height: 20px;
      font-weight: 700;
    }
  }
`;
/* 알림 이력 모달 */
const StyledHistoryModal = styled(AppModal)`
  width: 480px;

  .rs-modal-header {
    padding: 20px 0 0;

    .rs-modal-title {
      font-size: 14px;
      line-height: 22px;
      text-align: center;
    }

    &:after {
      display: none;
    }
  }

  .rs-modal-body {
    margin: 0;
    padding: 0;

    .text-wrapper {
      text-align: center;
    }

    .table-wrapper {
      padding: 0 20px;
      margin-top: 15px;
      font-size: 12px;
    }
  }

  .rs-modal-footer {
    padding: 15px 0;

    &:before {
      display: none;
    }
  }
`;
const StyledHistoryTable = styled(Table)`
  border: 1px solid #222;

  .rs-table-header-row-wrapper {
    color: #666;

    .rs-table-cell {
      border-bottom: 1px solid #222;
    }
  }

  .rs-table-body-row-wrapper {
    color: #666;

    .rs-table-cell {
      border-bottom: 1px solid #e1e1e1;
    }
  }

  .rs-table-cell {
    border-right: 1px solid #222;
  }

  .rs-table-cell-content {
    padding: 5px 8px;
  }

  .rs-table-row-header {
    .rs-table-cell-header {
      .rs-table-cell-content {
        font-size: 12px;

        background-color: #e3e3e3;
        padding: 6px 0 3px;
      }
    }
  }
`;
const StyledReceiveSettingModal = styled(AppModal)`
  width: 186px;

  .rs-modal-content {
    border-radius: 4px;
  }

  .rs-modal-header {
    padding: 9px 0;

    &:after {
      border-bottom: 1px solid #9a9a9a;
    }

    .rs-modal-title {
      font-size: 14px;
      line-height: 22px;
      text-align: center;
    }
  }

  .rs-modal-body {
    margin-top: 12px;
    padding-bottom: 12px;
    padding-left: 23px;
    padding-right: 23px;

    .noti-config__wrapper {
      .input-top {
        .title {
          margin-bottom: 15px;
        }

        .input {
          margin-bottom: 30px;
          margin-left: -15px;
          margin-top: -18px;
        }
      }
    }
  }

  .rs-modal-footer {
    padding: 8px 0;

    &:before {
      display: none;
    }
  }
`;
const StyledUserInfoLayer = styled(AppPopover)`
  color: #222;

  .rs-popover-content {
    text-align: center;

    .sub-content {
      display: flex;
      margin-top: 10px;

      .advertiser {
        margin-right: 4px;
      }
    }
  }
`;

const notificationFilter = getComparatorsString(':', 'readChecked', 'false');

const AppGlobalNavBar: React.FC<AppGlobalNavBarProps> = () => {
  const adAccountList: any = useRouteLoaderData('layout');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const notificationRef = useRef<any>(null);
  const isEmptyAdAccount = localStorage.getItem('isEmptyAdAccount') === 'true';

  const { handleSubmit, control, reset } = useForm();

  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [notificationHistoryList, setNotificationHistoryList] = useState<any[]>([]);
  const [isOpenReceiveSettingModal, setIsOpenReceiveSettingModal] = useState(false);
  const { setCancelModalOpen, setOnOk } = useContext(CampaignCreateCancelModalContext);

  const fetchNotificationList = useQuery(['fetchNotificationList', notificationFilter], async () => {
    const { data } = await getNotificationList(notificationFilter);
    return data;
  });
  const readNotificationMutation = useMutation(updateNotificationRead, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['fetchNotificationList']);
    },
  });
  const readAllNotificationMutation = useMutation(updateNotificationReadAll, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['fetchNotificationList']);
    },
  });
  const fetchNotificationConfig = useQuery(
    ['fetchNotificationConfig'],
    async () => {
      const { data } = await getNotificationConfig();
      return data;
    },
    {
      enabled: isOpenReceiveSettingModal,
    }
  );
  const handleNotificationMove = (notification: any) => {
    switch (notification.type) {
      case 'INVOICE':
        window.open(`/invoice`, '_blank');
        break;
      case 'COUPON':
        window.open(`/coupon`, '_blank');
        break;
      case 'QUESTION_REPLY':
        window.open(`/customer-service/inquiry`, '_blank');
        break;
      // 어드민
      case 'QUESTION':
        window.open(`/admin/customer-service/inquiry`, '_blank');
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = (notification: any) => {
    readNotificationMutation.mutate(notification.id);
    handleNotificationMove(notification);
  };

  const onLogout = () => {
    const logout = () => {
      signOut().then(() => {
        initSessionStorage();
        navigate('/');
      });
    };

    if (location.pathname === '/campaigns/campaign/create') {
      setCancelModalOpen(true);
      setOnOk(() => logout);
      return;
    }

    logout();
  };
  const handleAdAccountChange = (value: any) => {
    const title = adAccountList.find((item: any) => item.id === value).title;
    localStorage.setItem('selectedAdAccount', value);
    localStorage.setItem('selectedAdAccount.title', title);
    navigate('/campaigns/campaign');
  };

  const handleNotificationReadAllClick = () => {
    readAllNotificationMutation.mutate();
  };
  const handleShowHistoryClick = () => {
    notificationRef.current?.close();
    setIsOpenHistoryModal(true);
  };

  /* 알림 이력 */
  const handleEnteredHistoryModal = async () => {
    let date = dayjs().subtract(30, 'day').format('YYYY-MM-DD 00:00:00');
    const filter = getComparatorsString('>:', 'createdAt', date);
    const result = await getNotificationList(filter);
    setNotificationHistoryList(result.data || []);
  };
  const handleHideHistoryModal = () => {
    setIsOpenHistoryModal(false);
    setNotificationHistoryList([]);
  };

  /* 수신 설정 함수들 */
  const handleReceiveSettingClick = () => {
    notificationRef.current?.close();
    setIsOpenReceiveSettingModal(true);
  };
  const handleOkReceiveSetting = (data: any) => {
    updateNotificationConfig(data).then(() => {
      setIsOpenReceiveSettingModal(false);
    });
  };
  const handleCancelReceiveSetting = () => {
    setIsOpenReceiveSettingModal(false);
  };

  useEffect(() => {
    if (isOpenReceiveSettingModal) {
      reset();
    }
  }, [isOpenReceiveSettingModal]);

  return (
    <>
      <StyledGNB>
        <div className={'left-side'}>
          {(location.pathname === '/campaigns/campaign/create' ||
            location.pathname.includes('/campaigns/campaign/edit')) && (
            <div>
              <CloseIcon
                style={{
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginRight: 10,
                }}
                onClick={() => {
                  if (location.pathname === '/campaigns/campaign/create') {
                    setCancelModalOpen(true);
                    setOnOk(() => () => {
                      navigate('/campaigns/campaign');
                    });
                  } else {
                    navigate('/campaigns/campaign');
                  }
                }}
              />
            </div>
          )}
          <div className={'logo'}>
            <AppTypography.SubTitle level={1} className={'logo__title'}>
              <img className={'logo__image'} src={OneStoreLogo} alt={'ONEStore'} />
              <span className={'logo__text'}>
                {import.meta.env.VITE_MODE === 'CLIENT' ? '광고센터' : '관리자 어드민'}
              </span>
            </AppTypography.SubTitle>
          </div>
        </div>

        <div className={'right-side'}>
          {/* 광고 계정 */}
          {import.meta.env.VITE_MODE === 'CLIENT' && (
            <div className={'ad-account__list'}>
              <label>광고계정</label>
              <AdAccountSelectPicker
                searchable={false}
                cleanable={false}
                size={'sm'}
                style={{ width: 200, marginLeft: 15 }}
                data={adAccountList || []}
                placeholder={isEmptyAdAccount ? '광고계정 없음' : '선택해 주세요.'}
                labelKey={'title'}
                valueKey={'id'}
                value={localStorage.getItem('selectedAdAccount')}
                onChange={handleAdAccountChange}
              />
            </div>
          )}

          {/* 알림 */}
          {sessionStorage.getItem('role') !== 'REPORT_VIEWER' && sessionStorage.getItem('role') !== 'ADMIN_FINANCE' && (
            <Whisper
              ref={notificationRef}
              trigger={'click'}
              placement="bottomEnd"
              speaker={
                <StyledPopover
                  title={
                    <>
                      <div className={'title'}>
                        <span>알림</span>
                        <Badge content={fetchNotificationList.data?.length} />
                      </div>
                      <div>
                        <Whisper
                          trigger={'hover'}
                          placement={'bottom'}
                          speaker={<AppPopover theme={'white'} title={'수신 설정'}></AppPopover>}
                        >
                          <img
                            style={{ cursor: 'pointer' }}
                            src={IconSetting}
                            alt={'setting'}
                            onClick={handleReceiveSettingClick}
                          />
                        </Whisper>
                      </div>
                    </>
                  }
                >
                  <div className={'content'}>
                    <div className={'body'}>
                      {fetchNotificationList.data?.map((item: any) => {
                        return (
                          <div key={item.id} className={'item'} onClick={() => handleNotificationClick(item)}>
                            <AppTypography.Text>
                              [{item.type_string}] {item.content}
                            </AppTypography.Text>
                            <AppTypography.Text type={'sub'} style={{ color: '#9a9a9a' }}>
                              {item.date}
                            </AppTypography.Text>
                          </div>
                        );
                      })}
                    </div>
                    <div className={'footer'}>
                      <AppTypography.Text className={'link'} onClick={handleShowHistoryClick}>
                        이력보기
                      </AppTypography.Text>
                      <AppTypography.Text className={'link'} onClick={handleNotificationReadAllClick}>
                        모두읽음
                      </AppTypography.Text>
                    </div>
                  </div>
                </StyledPopover>
              }
            >
              <div className={'alarm'}>
                <img src={fetchNotificationList.data?.length !== 0 ? AlarmIconRed : AlarmIcon} alt={'alarm'} />
              </div>
            </Whisper>
          )}

          {/* 유저 */}
          <Whisper
            trigger="click"
            placement="bottom"
            enterable
            speaker={
              <StyledUserInfoLayer theme={'white'}>
                <div className={'rs-popover-content'}>
                  {import.meta.env.VITE_MODE === 'CLIENT' && (
                    <AppTypography.Link
                      onClick={() => navigate(`/account/advertiser/detail/${sessionStorage.getItem('advertiser_id')}`)}
                    >
                      {sessionStorage.getItem('advertiser_name')}
                    </AppTypography.Link>
                  )}
                  <div className={'sub-content'}>
                    <div className={'advertiser'}>{sessionStorage.getItem('role_name')}</div>
                    <AppTypography.Link
                      onClick={() =>
                        import.meta.env.VITE_MODE === 'CLIENT'
                          ? navigate(`/account/member/update/${sessionStorage.getItem('id')}`)
                          : navigate(`/admin/account/manager/update/${sessionStorage.getItem('id')}`)
                      }
                    >
                      {sessionStorage.getItem('name')}({sessionStorage.getItem('signin_id')})
                    </AppTypography.Link>
                  </div>
                </div>
              </StyledUserInfoLayer>
            }
          >
            <div className={'user'}>{sessionStorage.getItem('signin_id')}</div>
          </Whisper>

          <div className={'logout'} onClick={onLogout}>
            로그아웃
          </div>
        </div>
      </StyledGNB>

      <StyledHistoryModal
        open={isOpenHistoryModal}
        size={'sm'}
        onClose={() => setIsOpenHistoryModal(false)}
        onEntered={handleEnteredHistoryModal}
      >
        <StyledHistoryModal.Header closeButton={false} onClose={handleHideHistoryModal}>
          <StyledHistoryModal.Title>알림 이력</StyledHistoryModal.Title>
        </StyledHistoryModal.Header>
        <StyledHistoryModal.Body>
          <div className={'text-wrapper'}>
            <AppTypography.Text>최근 30일 이내의 알림이 조회됩니다.</AppTypography.Text>
          </div>
          <div className={'table-wrapper'}>
            <StyledHistoryTable headerHeight={28} data={notificationHistoryList} height={142} rowHeight={28}>
              <StyledHistoryTable.Column width={62} align={'center'}>
                <StyledHistoryTable.HeaderCell>알림</StyledHistoryTable.HeaderCell>
                <StyledHistoryTable.Cell dataKey={'type_string'} />
              </StyledHistoryTable.Column>
              <StyledHistoryTable.Column width={257}>
                <StyledHistoryTable.HeaderCell align={'center'}>내용</StyledHistoryTable.HeaderCell>
                <StyledHistoryTable.Cell dataKey={'content'}>
                  {(rowData) => <span onClick={() => handleNotificationMove(rowData)}>{rowData['content']}</span>}
                </StyledHistoryTable.Cell>
              </StyledHistoryTable.Column>
              <StyledHistoryTable.Column width={120} align={'center'}>
                <StyledHistoryTable.HeaderCell>알림일시</StyledHistoryTable.HeaderCell>
                <StyledHistoryTable.Cell dataKey={'date'}>
                  {(rowData) => dayjs(rowData.created_at).format('YYYY-MM-DD HH:mm')}
                </StyledHistoryTable.Cell>
              </StyledHistoryTable.Column>
            </StyledHistoryTable>
          </div>
        </StyledHistoryModal.Body>
        <StyledHistoryModal.Footer>
          <AppButton theme={'red'} onClick={handleHideHistoryModal}>
            확인
          </AppButton>
        </StyledHistoryModal.Footer>
      </StyledHistoryModal>

      {/* 수신 설정 모달 */}
      <StyledReceiveSettingModal open={isOpenReceiveSettingModal} size={'sm'} onClose={handleCancelReceiveSetting}>
        <StyledReceiveSettingModal.Header closeButton={false}>
          <StyledReceiveSettingModal.Title>수신 설정</StyledReceiveSettingModal.Title>
        </StyledReceiveSettingModal.Header>
        <StyledReceiveSettingModal.Body>
          {fetchNotificationConfig.fetchStatus === 'idle' && (
            <div className={'noti-config__wrapper'}>
              <div className={'input-top'}>
                <div className={'title'}>
                  <AppTypography.Label>알림설정</AppTypography.Label>
                </div>
                <div className={'input'}>
                  {_.chain(fetchNotificationConfig.data)
                    .omit(['email'])
                    .keys()
                    .map((value, idx) => {
                      return (
                        <Controller
                          key={idx}
                          name={value}
                          control={control}
                          defaultValue={fetchNotificationConfig.data[value]}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onChange={(value, checked) => field.onChange(checked)}
                              style={{
                                marginLeft: 30,
                                marginTop: 15,
                              }}
                            >
                              {translateNotificationConfig[value]}
                            </Checkbox>
                          )}
                        />
                      );
                    })
                    .value()}
                </div>
              </div>
              <div className={'input-bottom'}>
                <Controller
                  name={'email'}
                  control={control}
                  defaultValue={fetchNotificationConfig.data?.email}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(value, checked) => field.onChange(checked)}
                      style={{ marginLeft: 14 }}
                    >
                      {translateNotificationConfig['email']}
                    </Checkbox>
                  )}
                />
              </div>
            </div>
          )}
        </StyledReceiveSettingModal.Body>
        <StyledReceiveSettingModal.Footer>
          <AppButton style={{ width: 50, padding: 0, textAlign: 'center' }} onClick={handleCancelReceiveSetting}>
            취소
          </AppButton>
          <AppButton
            theme={'red'}
            size={'sm'}
            style={{ width: 50, padding: 0 }}
            onClick={handleSubmit(handleOkReceiveSetting)}
          >
            저장
          </AppButton>
        </StyledReceiveSettingModal.Footer>
      </StyledReceiveSettingModal>
    </>
  );
};

export default AppGlobalNavBar;

const AdAccountSelectPicker = styled(AppSelectPicker)`
  &.rs-picker-default .rs-picker-toggle {
    border-color: var(--sub-gray-color-button);
    .rs-picker-toggle-clean {
      color: var(--sub-gray-color-button);
      top: 4px !important;
    }
    .rs-picker-toggle-caret {
      top: 4px !important;
      color: var(--sub-gray-color-button);
    }
  }
  .rs-picker-toggle.rs-btn-sm {
    font-size: 12px;
  }
  &.rs-picker-default .rs-picker-toggle.rs-btn {
    padding-top: 3px;
    padding-bottom: 3px;
  }
`;
