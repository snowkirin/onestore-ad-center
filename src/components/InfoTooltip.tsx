import React from 'react';
import { Whisper } from 'rsuite';
import { TypeAttributes } from 'rsuite/cjs/@types/common';
import warning from '@assets/images/icons/warning/warning-big.svg';
import AppPopover from '@components/AppPopover';

const InfoTooltip = ({
  inner,
  placement = 'bottomStart',
  trigger = 'hover',
  preventOverflow,
  popoverStyle = {},
  onClick,
}: {
  inner: any;
  placement?: TypeAttributes.Placement;
  trigger?: 'click' | 'hover' | 'focus' | 'active';
  preventOverflow?: boolean;
  popoverStyle?: any;
  onClick?: (e: React.SyntheticEvent) => void;
}) => {
  return (
    <Whisper
      trigger={trigger}
      placement={placement}
      preventOverflow={preventOverflow}
      speaker={
        <AppPopover theme={'white'} style={{ ...popoverStyle }}>
          {inner}
        </AppPopover>
      }
    >
      <span style={{ marginLeft: '3px' }} onClick={onClick}>
        <img src={warning} alt={'warning'} style={{ width: 12, height: 12 }} />
      </span>
    </Whisper>
  );
};

export default InfoTooltip;
