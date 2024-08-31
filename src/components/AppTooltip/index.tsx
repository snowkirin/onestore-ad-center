import React from 'react';
import { Tooltip, Whisper } from 'rsuite';
import { TypeAttributes } from 'rsuite/esm/@types/common';
import { OverlayTriggerType } from 'rsuite/esm/Overlay/OverlayTrigger';
import styled, { css } from 'styled-components';

interface AppTooltipProps {
  trigger?: OverlayTriggerType | OverlayTriggerType[];
  placement?: TypeAttributes.Placement;
  text: React.ReactNode;
  children: React.ReactElement;
  theme?: 'orange' | 'white';
  tooltipStyle?: React.CSSProperties;
}

const StyledTooltip = styled(Tooltip)`
  padding: 10px 13px 18px;
  text-align: left;

  &.placement-top-start {
    &::after {
      left: 30px;
    }
  }
  &.placement-top-end {
    &::after {
      right: 30px;
    }
  }
  ${({ theme }) => {
    switch (theme) {
      case 'orange':
        return css`
          border: 1px solid var(--sub-color02);
          background-color: var(--sub-color02);
          color: var(--w000);

          &.placement-top-start,
          &.placement-top-end {
            &::after {
              border-top-color: var(--sub-color02);
            }
          }
        `;
      case 'white':
        return css`
          background-color: var(--w000);
          color: var(--primary-color);
          border: 1px solid var(--sub-color02);
          &.placement-top-start,
          &.placement-top-end {
            &::before {
              content: ' ';
              display: block;
              position: absolute;
              width: 0;
              height: 0;
              border-style: solid;
              bottom: -5px;
              margin-left: -6px;
              border-width: 6px 6px 0;
              border-top-color: var(--w000);
              right: 30px;
              z-index: 1;
            }
            &::after {
              border-top-color: var(--sub-color02);
            }
            
        `;
    }
  }}
`;
const AppTooltip: React.FC<AppTooltipProps> = ({
  trigger = 'hover',
  placement = 'topStart',
  text,
  children,
  theme = 'orange',
  tooltipStyle,
}) => {
  return (
    <Whisper
      trigger={trigger}
      placement={placement}
      speaker={
        <StyledTooltip theme={theme} style={tooltipStyle}>
          {text}
        </StyledTooltip>
      }
    >
      {children}
    </Whisper>
  );
};

export default AppTooltip;
