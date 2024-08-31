import { Col } from "rsuite";
import styled from "styled-components";

const Cell = styled(Col)`
  background-color: var(--w100);
  height: 32px;
  cursor: pointer;
  border-bottom: 1px solid var(--w500);
  border-right: 1px solid var(--w000);
  &:hover {
    background-color: var(--primary-light01);
  }
  ${({ active }) => `
  ${active && `background-color: var(--primary-color);`}
`};
`;
const Label = styled.span`
  font-size: 12px;
  color: var(--b700);
`;
const FlexDiv = styled.div`
  height: 225px;
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
  margin-right: 4px;
  margin-top: 17px;
  justify-content: space-around;
`;
const EveryDayCell = styled(Col)`
  height: 32px;
  border-right: 1px solid var(--w500);
  background-color: var(--w000);
  cursor: pointer;

  &:last-child {
    border-right: none;
  }
  &:hover {
    background-color: var(--primary-light01);
  }

  ${({ active }) => `
  ${active && `background-color: var(--primary-color);`}
`};
`;
const Square = styled.span`
  width: 9px;
  height: 9px;
  border: 1px solid var(--primary-color);
  background-color: var(--primary-color);
  display: inline-block;
  line-height: 12px;
  margin-right: 5px;
`;

export { Cell, Label, FlexDiv, EveryDayCell, Square };
