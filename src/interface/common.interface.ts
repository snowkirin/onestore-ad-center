// 타입 덮어쓰기
export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

// 셀렉트박스 타입
export interface ListItem {
  label: string;
  value: string | number;
}

/*
 * 목적:  년-월-일 / 시:분이 따로 있는 useState에 쓰일 타입
 * 사용처 : 소재그룹에서 시작일/종료일에서 사용중
 * */
export interface ScheduleDate {
  YYYY_MM_DD: Date | null;
  HH_mm: Date | null;
}

/*
 * 목적: 소재들의 타입
 * 사용처: 소재, 소재그룹에서 주로 탭에 사용중.
 * */

export type CreativeType = 'IMAGE' | 'NATIVE' | 'VIDEO';

/*
 * 목적: 유저정보
 * */

export interface MyInfo {
  advertiser_id: null | number;
  advertiser_name: null | string;
  email: string;
  id: number;
  name: string;
  role_name: string; // ex) 관리자, 광고주
  role: string; // ex) ADMIN, ADVERTISER
  signin_id: string;
}

export type DaysType = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su';
export type ScheduleValueType = {
  mo: number[];
  tu: number[];
  we: number[];
  th: number[];
  fr: number[];
  sa: number[];
  su: number[];
};
