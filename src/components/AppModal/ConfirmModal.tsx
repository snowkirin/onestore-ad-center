import React from 'react';
import AppModal from '@components/AppModal/Modal';
import { AppButton } from '@components/AppButton';
import styled, { css } from 'styled-components';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onOk: () => void;
  content: any;
  title: any;
  okText?: string;
  cancelText?: string;
  size?: 'xs' | 'sm';
  backdrop?: string;
}

const StyledConfirmModal = styled(AppModal)<{ size: 'xs' | 'sm' }>`
  ${(props) =>
    props.size === 'xs' &&
    css`
      width: 320px;
      .rs-modal-content {
        padding-left: 20px;
        padding-right: 20px;
        border-radius: 8px;
      }
      .rs-modal-header {
        padding: 15px 0;
        text-align: center;
        .rs-modal-title {
          font-size: 14px;
        }
      }
      .rs-modal-body {
        margin-top: 15px;
        padding: 0;
        text-align: center;
      }
      .rs-modal-footer {
        &::before {
          display: none;
        }
        padding: 30px 0 20px;
      }
    `}

  ${(props) =>
    props.size === 'sm' &&
    css`
      width: 500px;
      .rs-modal-body {
        padding-bottom: 30px;
      }
    `}
`;

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onOk,
  content,
  title,
  okText = '삭제',
  cancelText = '취소',
  size = 'sm',
  backdrop = 'static',
}) => {
  return (
    <StyledConfirmModal open={open} onClose={onClose} size={size} backdrop={backdrop}>
      <StyledConfirmModal.Header closeButton={size !== 'xs'}>
        <StyledConfirmModal.Title>{title}</StyledConfirmModal.Title>
      </StyledConfirmModal.Header>
      <StyledConfirmModal.Body>
        <div>{content}</div>
      </StyledConfirmModal.Body>
      <StyledConfirmModal.Footer>
        <AppButton onClick={onClose} appearance="primary">
          {cancelText}
        </AppButton>
        <AppButton onClick={onOk} theme={'red'}>
          {okText}
        </AppButton>
      </StyledConfirmModal.Footer>
    </StyledConfirmModal>
  );
};

export default ConfirmModal;
