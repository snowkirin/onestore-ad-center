import React, { Component } from 'react';
import { Whisper } from 'rsuite';
import AppPopover from '@components/AppPopover';
import withDefaults from '../utils/helper/withDefaults';

interface IProps {
  text: string | React.ReactNode;
  type?: 'table' | 'text'; // 아직은 알수없지만 table에서 사용하는것과 일반적으로 사용했을때 차이가 있을때를 대비.
  theme?: 'black' | 'white';
  style?: React.CSSProperties;
}
interface IState {
  parentWidth: number | null;
  parentPadding: number | null;
  childWidth: number | null;
}

const defaultProps = {
  type: 'table',
  theme: 'black',
};

class EllipsisPopup extends Component<IProps, IState> {
  private spanElement: React.RefObject<HTMLSpanElement>;
  constructor(props: any) {
    super(props);
    this.spanElement = React.createRef();
    this.state = {
      parentWidth: 0,
      parentPadding: 0,
      childWidth: 0,
    };
  }

  handleNormalSpanHover = (e: any) => {
    const { props } = this;
    const { parentWidth, parentPadding, childWidth } = this.state;
    const spanEle = e.currentTarget;
    const parentEle: HTMLElement | null = spanEle
      ? spanEle.closest(props.type === 'table' ? '.rs-table-cell-content' : '.ellipsis')
      : null;
    const parentWidthVal: any = parentEle ? parentEle.getBoundingClientRect().width : null;
    const parentPaddingVal = parentEle
      ? parseInt(window.getComputedStyle(parentEle, null).getPropertyValue('padding-left')) * 2
      : null;
    const childWidthVal = spanEle ? spanEle.getBoundingClientRect().width : null;

    if (parentWidth !== parentWidthVal) {
      this.setState({ parentWidth: parentWidthVal });
    }

    if (parentPadding !== parentPaddingVal) {
      this.setState({ parentPadding: parentPaddingVal });
    }

    if (childWidth !== childWidthVal) {
      this.setState({ childWidth: childWidthVal });
    }
  };

  render() {
    const { props, state } = this;

    if (
      state.parentWidth !== null &&
      state.parentPadding !== null &&
      state.childWidth !== null &&
      state.childWidth > state.parentWidth - state.parentPadding
    ) {
      return (
        <Whisper
          trigger={'hover'}
          placement={'bottomStart'}
          speaker={
            <AppPopover theme={props.theme} size={'sm'} style={props.style}>
              {props.text}
            </AppPopover>
          }
        >
          <span ref={this.spanElement} onMouseOver={this.handleNormalSpanHover}>
            {props.text}
          </span>
        </Whisper>
      );
    } else {
      return (
        <span ref={this.spanElement} onMouseOver={this.handleNormalSpanHover}>
          {props.text}
        </span>
      );
    }
  }
}

export default withDefaults(defaultProps)(EllipsisPopup);
