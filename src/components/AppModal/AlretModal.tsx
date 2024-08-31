import React from 'react';
import AppModal from '@components/AppModal/Modal';
import { AppButton } from '@components/AppButton';
import styled from 'styled-components';

const StyledAlertModal = styled(AppModal)`
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
`;

const AlertModal = ({
  open,
  onOk,
  content,
  title,
  okText = '확인',
}: {
  open: boolean;
  onOk: () => void;
  content: any;
  title: any;
  okText?: string;
}) => {
  return (
    <StyledAlertModal open={open} size={'sm'}>
      <StyledAlertModal.Header closeButton={false}>
        <StyledAlertModal.Title>{title}</StyledAlertModal.Title>
      </StyledAlertModal.Header>
      <StyledAlertModal.Body>
        <div>{content}</div>
      </StyledAlertModal.Body>
      <StyledAlertModal.Footer>
        <AppButton theme={'red'} style={{ width: 60 }} onClick={onOk}>
          {okText}
        </AppButton>
      </StyledAlertModal.Footer>
    </StyledAlertModal>
  );
};
export default AlertModal;
