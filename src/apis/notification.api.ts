import { API_WB } from '@apis/request';

/**
 * [알림 목록]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2911567873}
 * 기본 리스트: filter=readChecked : 'false'
 * 이력보기: filter=createdAt >= '2022-08-15 00:00:00'
 * */

export const getNotificationList = (filter: any) => {
  return API_WB.get(`/v1/notifications?filter=${filter}`);
};

/**
 * [알림 설정 조회]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2911895611}
 * */
export const getNotificationConfig = () => {
  return API_WB.get(`/v1/notification-config`);
};

/**
 * [알림 설정 변경]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2915336207}
 * */
export const updateNotificationConfig = (bodyParams: {
  invoice?: boolean;
  coupon?: boolean;
  question_reply?: boolean;
  question_created?: boolean;
  email: boolean;
}) => {
  return API_WB.put(`/v1/notification-config`, bodyParams);
};

/**
 * [알림 모두 읽음]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2923429889}
 * */
export const updateNotificationReadAll = () => {
  return API_WB.patch(`/v1/notifications/read-all`);
};

/**
 * [알림 읽음]{$link https://wisebirds.atlassian.net/wiki/spaces/MOL/pages/2923429897}
 * */
export const updateNotificationRead = (notificationId: number) => {
  return API_WB.patch(`/v1/notifications/${notificationId}/read`);
};
