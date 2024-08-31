import styled from 'styled-components';

const StyledDashboardWrapper = styled.div`
  /* 공통*/
  .header {
    padding-left: 30px;
    padding-right: 30px;
    border-bottom: 1px solid #e2e2e2;
    padding-bottom: 7px;
    &__download {
      display: flex;
      align-items: center;
      margin-top: 15px;
      justify-content: space-between;
      .btn__wrapper {
        display: flex;
      }
    }
  }
  .text--point {
    font-size: 18px;
    color: #e15656;
    font-weight: 700;
  }
  .dashboard__inner {
    padding: 20px 30px;
  }

  /* 매출 요약 */
  .sales-summary {
    display: flex;
    border: 2px solid #9a9a9a;
    border-radius: 8px;
    &__item {
      flex: 1 0 auto;
      font-size: 13px;
      line-height: 20px;
      font-weight: 700;
      &:first-child {
        .sales-summary__header,
        .sales-summary__body {
          border-left: 0 none;
        }
      }
    }
    &__header {
      border-bottom: 1px solid #e3e3e3;
      padding-top: 12px;
      padding-bottom: 8px;
    }
    &__body {
      padding-top: 8px;
      padding-bottom: 11px;
    }
    &__header,
    &__body {
      border-left: 1px solid #e3e3e3;
      padding-left: 20px;
      padding-right: 20px;
    }
  }

  /* CS 문의 현황 */
  .cs-summary {
    display: flex;
    margin-top: 25px;
    &__item {
      display: flex;
      align-items: center;
      flex: 1 0 auto;
      justify-content: center;
    }
    &__title,
    &__unit {
      font-size: 14px;
      font-weight: 700;
    }
    &__title {
      width: 80px;
    }
    &__count {
      font-size: 18px;
      color: #e15656;
      font-weight: 700;
      margin-left: 38px;
    }
    &__unit {
      margin-left: 7px;
    }
  }
`;

export { StyledDashboardWrapper };
