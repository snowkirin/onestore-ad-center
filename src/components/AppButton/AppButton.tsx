import React, { useCallback } from 'react';
import { Button as RsuiteButton, ButtonProps as RsuiteButtonProps } from 'rsuite';
import styled, { css } from 'styled-components';
import { debounce } from 'lodash';

const typeMapper = {
  button: css`
    background-color: var(--w000);
    border: solid 1px var(--primary-color);
    color: var(--primary-color);

    &:hover {
      background-color: var(--w000);
      color: var(--primary-dark);
      border: solid 1px var(--primary-dark);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--w000);
      color: var(--primary-dark);
      border: solid 1px var(--primary-dark);
    }

    &:disabled {
      background-color: var(--w000);
      color: var(--primary-disabled);
      border: 0 none;
      border: solid 1px var(--primary-disabled);
    }
  `,
  reset: css`
    background-color: var(--sub-gray-color-button);
    color: var(--w000);

    &:hover {
      background-color: var(--sub-gray-color-dark);
      color: var(-w000);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--sub-gray-color-dark);
      color: var(-w000);
    }

    &:disabled {
      background-color: var(--sub-gray-color-disabled);
      color: var(-w000);
      //border: solid 1px var(--sub-gray-color-disabled);
    }
  `,
  submit: css`
    background-color: var(--primary-color);
    color: var(-w000);

    &:hover {
      background-color: var(--primary-dark);
      color: var(-w000);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--primary-dark);
      color: var(-w000);
    }

    &:disabled {
      background-color: var(--primary-disabled);
      color: var(-w000);
      //border: solid 1px var(--primary-disabled);
    }
  `,
};

const sizeMapper = {
  lg: css`
    height: 42px;
    //padding: 0 37px;
    font-size: 12px;
    line-height: 42px;
    padding: 0 12px;
  `,
  md: css`
    height: 32px;
    //padding: 0 37px;
    font-size: 12px;
    line-height: 32px;
    padding: 0 12px;
  `,
  sm: css`
    height: 28px;
    //padding: 0 37px;
    font-size: 12px;
    line-height: 28px;
    padding: 0 12px;
  `,
};

const themeMapper = {
  red: css`
    background-color: var(--primary-color);
    color: var(--w000);
    border: 1px solid var(--primary-color);

    &:hover {
      background-color: var(--primary-dark);
      color: var(--w000);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--primary-dark);
      color: var(--w000);
    }

    &:disabled {
      background-color: var(--primary-disabled);
      color: var(--w000);
      border: solid 1px var(--primary-disabled);
    }
  `,
  gray: css`
    background-color: var(--sub-gray-color-button);
    color: var(--w000);
    border: solid 1px var(--w500);

    &:hover {
      background-color: var(--sub-gray-color-dark);
      color: var(--w000);
      border: 1px solid var(--sub-gray-color-dark);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--sub-gray-color-dark);
      color: var(--w000);
      border: 1px solid var(--sub-gray-color-dark);
    }

    &:disabled {
      background-color: var(--sub-gray-color-disabled);
      color: var(--w000);
      border: solid 1px var(--sub-gray-color-disabled);
    }
  `,
  white_red: css`
    border: solid 1px var(--primary-color);
    background-color: var(--w000);
    color: var(--primary-color);

    &:hover {
      background-color: var(--w100);
      color: var(--primary-dark);
      border: solid 1px var(--primary-dark);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--w100);
      color: var(--primary-dark);
      border: solid 1px var(--primary-dark);
    }

    &:disabled {
      background-color: var(--w100);
      color: var(--primary-disabled);
      border: solid 1px var(--primary-disabled);
    }
  `,
  white_gray: css`
    border: solid 1px var(--border-line);
    background-color: var(--w000);
    color: var(--rs-text-primary);

    &:hover {
      background-color: var(--w100);
      color: var(--sub-gray-color-dark);
      border: solid 1px var(--sub-gray-color-dark);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--w100);
      color: var(--sub-gray-color-dark);
      border: solid 1px var(--sub-gray-color-dark);
    }

    &:disabled {
      background-color: var(--w100);
      color: var(--sub-gray-color-disabled);
      border: solid 1px var(--sub-gray-color-disabled);
    }
  `,
  reset: css`
    background-color: var(--primary-color);
    color: var(--w000);
    padding: 0 22.5px;
    border: solid 1px var(--primary-color);

    ::before {
      content: '\\21BA';
      width: 12px;
      height: 12px;
      margin-right: 7px;
    }

    &:hover {
      background-color: var(--primary-dark);
      color: var(--w000);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--primary-dark);
      color: var(--w000);
    }

    &:disabled {
      background-color: var(--primary-disabled);
      color: var(--w000);
      border: solid 1px var(--primary-disabled);
    }
  `,
  create: css`
    background-color: var(--primary-color);
    color: var(--w000);
    padding: 0 22.5px;
    border: solid 1px var(--primary-color);

    ::before {
      content: '\\002B';
      width: 12px;
      height: 12px;
      margin-right: 7px;
    }

    &:hover {
      background-color: var(--primary-dark);
      color: var(--w000);
    }

    &:active,
    &:focus,
    &:active:hover {
      background-color: var(--primary-dark);
      color: var(--w000);
    }

    &:disabled {
      background-color: var(--primary-disabled);
      color: var(--w000);
      border: solid 1px var(--primary-disabled);
    }
  `,
};

interface ButtonProps extends RsuiteButtonProps {
  type: 'button' | 'reset' | 'submit';
  size: 'lg' | 'md' | 'sm';
  theme: 'red' | 'gray' | 'white_red' | 'white_gray';
  disabled: boolean;
}

const ButtonCSS = css`
  border-radius: 4px;
  &:focus-visible {
    outline: none;
  }
  & > span.anticon {
    line-height: 1;
    margin-right: 5px;
  }

  ${({ size = 'sm' }: ButtonProps) => sizeMapper[size]}
  ${({ type = 'button' }: ButtonProps) => typeMapper[type]}
  ${({ theme = 'red', type = 'button' }: ButtonProps) => (type === 'button' ? themeMapper[theme] : '')}
  ${({ theme = 'red' }: ButtonProps) => themeMapper[theme]}
`;

const FakeDisabledButton = styled.div`
  display: inline-block;
  border-radius: 4px;
  cursor: not-allowed;
  font-weight: bold;
  text-align: center;
  vertical-align: middle;

  & > span.anticon {
    line-height: 1;
    margin-right: 5px;
  }

  ${({ size = 'sm' }: ButtonProps) => sizeMapper[size]}
  ${({ type = 'button' }: ButtonProps) => typeMapper[type]}
  &,
  &:hover,
  &:active,
  &:focus,
  &:active:hover {
    border: solid 1px var(--w500);
    background-color: var(--w100);
    color: var(--b100);
    transition: none;
    box-shadow: none;
  }
`;
const StyledButton = styled(RsuiteButton)`
  ${ButtonCSS};
`;

const AppButton = ({ ...props }) => {
  const { onClick, interval, delayClick = true, ...restProps } = props;
  const delayTime = interval ? interval : 1000;
  const delayedOnClick = useCallback(
    debounce(
      (e: React.SyntheticEvent<EventTarget>) => {
        e.persist();
        if (onClick) onClick(e);
      },
      delayTime,
      // maxWait를 넣으면 해당 시간이 지난후 클릭하면 함수 실행 가능.
      { leading: true, trailing: false, maxWait: delayTime }
    ),
    [onClick, interval]
  );

  const handleClick = useCallback(
    (e: React.SyntheticEvent<EventTarget>) => {
      if (delayClick) {
        delayedOnClick(e);
      } else {
        if (onClick) onClick(e);
      }
    },
    [delayClick, delayedOnClick, onClick]
  );

  return (
    <>
      <StyledButton {...restProps} onClick={handleClick} />
    </>
  );
};

export default AppButton;
export { FakeDisabledButton, ButtonCSS };
