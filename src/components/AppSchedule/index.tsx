import React from 'react';
import styled from 'styled-components';
import { Grid, Row, Col } from 'rsuite';
import { range, map, replicate, mapWithIndex } from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/pipeable';

type DaysType = 'su' | 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa';
const DAY_TYPE = {
  mo: '월요일',
  tu: '화요일',
  we: '수요일',
  th: '목요일',
  fr: '금요일',
  sa: '토요일',
  su: '일요일',
};
const Days: DaysType[] = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];

const Cell = styled(Col)`
  background-color: var(--w100);
  height: 32px;
  cursor: pointer;
  border-bottom: 1px solid var(--w500);
  border-right: 1px solid var(--w000);
  &:hover {
    ${({ readOnly }) => `${!readOnly && 'background-color: var(--primary-light01);'}`};
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
    ${({ readOnly }) => `${!readOnly && 'background-color: var(--primary-light01);'}`};
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

type ScheduleProps = {
  style?: any;
  onSelect?: (value: any) => void;
  value?: boolean[][];
  readOnly?: boolean;
};

type ScheduleState = {
  value: boolean[][];
  isDragging: boolean;
};

class Schedule extends React.Component<ScheduleProps> {
  static defaultValue = pipe(
    range(0, 23),
    map(() => false),
    (arr) => replicate(7, arr)
  );

  static getDerivedStateFromProps(props: ScheduleProps, state: ScheduleState) {
    if (props.value !== undefined) {
      return { ...state, value: props.value };
    }
    return null;
  }

  state = {
    value: Schedule.defaultValue,
    isDragging: false,
  };

  handleClickTime = (day: number, time: number) => {
    if (this.props.readOnly) return;
    const newValue = mapWithIndex((index, timeArr: boolean[]) => {
      return index === day ? mapWithIndex((i, t) => (i === time ? !t : t))(timeArr) : timeArr;
    })(this.state.value);

    if (this.props.value !== undefined && this.props.onSelect) {
      this.props.onSelect(newValue);
      return;
    }

    this.setState({
      value: newValue,
    });
  };

  isEveryDayTrue = (time: number) => {
    return this.state.value
      .reduce((acc, timeArr) => {
        return [...acc, timeArr[time]];
      }, [])
      .every((t) => t);
  };

  handleClickAllDay = (time: number, checked: boolean) => {
    if (this.props.readOnly) return;
    const newValue = map((timeArr: boolean[]) => mapWithIndex((i, t) => (i === time ? checked : t))(timeArr))(
      this.state.value
    );

    if (this.props.value !== undefined && this.props.onSelect) {
      this.props.onSelect(newValue);
      return;
    }
    this.setState({
      value: newValue,
    });
  };

  toggleIsDragging = (isDragging: boolean) => {
    if (this.state.isDragging !== isDragging) this.setState({ isDragging });
  };
  handleMouseDown = (day: number, time: number) => {
    if (this.props.readOnly) return;
    this.toggleIsDragging(true);
    this.handleClickTime(day, time);
  };
  handleMouseUp = () => {
    if (this.props.readOnly) return;
    this.toggleIsDragging(false);
  };
  handleMouseEnter = (day: number, time: number) => {
    if (this.props.readOnly) return;
    if (!this.state.isDragging) return;
    this.handleClickTime(day, time);
  };
  handleMouseLeave = () => {
    if (this.props.readOnly) return;
    this.toggleIsDragging(false);
  };

  render() {
    const { value } = this.state;
    const { readOnly } = this.props;
    return (
      <div style={this.props.style}>
        <div style={{ textAlign: 'right', marginBottom: 16, color: 'var(--b700)' }}>
          <span style={{ marginRight: 12 }}>
            <Square />
            노출
          </span>
          <span>
            <Square style={{ borderColor: 'var(--w500)', backgroundColor: 'var(--w100)' }} />
            노출 안함
          </span>
        </div>
        <FlexDiv>
          {Days.map((day: DaysType) => (
            <Label key={day}>{DAY_TYPE[day]}</Label>
          ))}
        </FlexDiv>
        <div
          style={{
            width: 'calc(100% - (3em))',
            display: 'inline-block',
          }}
        >
          <Row style={{ margin: 0 }}>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>00:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>03:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>06:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>09:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>12:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>15:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>18:00</Label>
            </Col>
            <Col xs={3} style={{ padding: 0 }}>
              <Label>21:00</Label>
            </Col>
          </Row>
          <Grid
            fluid
            style={{
              border: `1px solid ${'var(--w500)'}`,
              borderBottom: 'none',
              borderRight: 'none',
            }}
            onMouseLeave={() => this.handleMouseLeave()}
          >
            {Days.map((day, i) => (
              <Row key={day} className="show-grid">
                {range(0, 23).map((time) => (
                  <Cell
                    key={`${day}_${time}`}
                    xs={1}
                    active={value[i][time] ? 'true' : undefined}
                    style={(time + 1) % 3 === 0 ? { borderRightColor: 'var(--w500)' } : undefined}
                    onMouseDown={() => this.handleMouseDown(i, time)}
                    onMouseUp={() => this.handleMouseUp()}
                    onMouseEnter={() => this.handleMouseEnter(i, time)}
                    readOnly={readOnly}
                  />
                ))}
              </Row>
            ))}
          </Grid>
        </div>

        <div style={{ marginTop: 5, position: 'relative' }}>
          <Label style={{ position: 'absolute', marginRight: 14, top: '8px' }}>매일</Label>
          <div
            style={{
              width: 'calc(100% - (3em))',
              display: 'inline-block',
              float: 'right',
            }}
          >
            <Grid
              fluid
              style={{
                border: `1px solid ${'var(--w500)'}`,
              }}
            >
              <Row className="show-grid">
                {range(0, 23).map((time) => (
                  <EveryDayCell
                    key={time}
                    xs={1}
                    active={this.isEveryDayTrue(time) ? 'true' : undefined}
                    onClick={() => {
                      this.handleClickAllDay(time, !this.isEveryDayTrue(time));
                    }}
                    readOnly={readOnly}
                  />
                ))}
              </Row>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

export default Schedule;
