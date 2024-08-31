import React from 'react';
import { Modal as RsuiteModal } from 'rsuite';
import styled, { css } from 'styled-components';

interface AppModalProps {
  role?: 'dialog' | 'popup';
}

const StyledModal = styled(RsuiteModal)<AppModalProps>`
  ${({ width }) =>
    width
      ? `
    width: ${width}px !important;
  `
      : ''}

  .rs-modal-content {
    padding: 0;
  }
  .rs-modal-header {
  }
  .rs-modal-title {
    font-weight: 700;
  }
  ${({ size = 'lg' }) => {
    switch (size) {
      case 'sm':
        return css`
          width: 320px;
        `;
      case 'lg':
        return css`
          width: 850px;
        `;
      default:
        return css`
          .rs-modal-lg {
            width: 850px;
          }
        `;
    }
  }}
  ${({ role = 'dialog' }) => {
    switch (role) {
      case 'dialog':
        return css`
          text-align: left;
          .rs-modal-content {
            border-radius: 0;
          }
          .rs-modal-header {
            padding: 20px 45px 12px 30px;
            position: relative;
            .rs-modal-title {
              font-size: 18px;
              line-height: 28px;
            }
            .rs-modal-header-close {
              top: 24px;
              right: 22px;
              width: 24px;
              font-size: 16px;
              line-height: 1;
            }
            &::after {
              content: '';
              display: block;
              border-bottom: 1px solid #e2e2e2;
              position: absolute;
              left: 0;
              bottom: 0;
              width: calc(100%);
            }
          }
          .rs-modal-body {
            margin-top: 30px;
            padding-bottom: 50px;
            padding-left: 50px;
            padding-right: 50px;
            font-size: 11px;
            line-height: 17px;
          }
          .rs-modal-footer {
            text-align: center;
            padding: 30px 0;
            position: relative;
            &::before {
              content: '';
              display: block;
              border-bottom: 1px solid #e2e2e2;
              position: absolute;
              left: 0;
              top: 0;
              width: calc(100%);
            }
          }
        `;
      case 'popup':
        return css`
          text-align: center;
          .rs-modal-content {
            border-radius: 8px;
          }
          .rs-modal-header {
            padding: 15px 20px;
            position: relative;
            &::after {
              content: '';
              display: block;
              position: absolute;
              left: 20px;
              bottom: 0;
              width: calc(100% - 40px);
              border-bottom: 1px solid #e2e2e2;
            }
            .rs-modal-title {
              font-size: 14px;
              line-height: 22px;
            }
            .rs-modal-header-close {
              display: none;
            }
          }
          .rs-modal-body {
            margin-top: 15px;
            padding-bottom: 30px;
            font-size: 12px;
            line-height: 19px;
          }
          .rs-modal-footer {
            text-align: center;
            padding-bottom: 20px;
          }
        `;
    }
  }}
`;

export default StyledModal;
