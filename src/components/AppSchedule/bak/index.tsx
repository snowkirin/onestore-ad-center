import React, { useEffect, useState } from 'react';
import { Grid, Row, Col } from 'rsuite';
import { Cell, Label, FlexDiv, EveryDayCell, Square } from './Styled';

interface AppScheduleProps {
  style?: React.CSSProperties;
  onSelect?: (value: any) => void;
  value?: boolean[][];
  readOnly?: boolean;
}

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
const defaultValue = Array(7).fill(Array.from(new Array(24), () => false));

const AppSchedule: React.FC<AppScheduleProps> = ({ style, onSelect, value, readOnly }) => {
  const [scheduleValue, setScheduleValue] = useState<boolean[][]>(defaultValue);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isEveryDayTrue = (time: number) => {
    return scheduleValue
      .reduce((acc, timeArr) => {
        return [...acc, timeArr[time]];
      }, [])
      .every((t) => t);
  };
  const handleClickTime = (day: number, time: number) => {
    if (readOnly) return;
    const newValue = scheduleValue.map((timeArr, index) => {
      return index === day ? timeArr.map((t, i) => (i === time ? !t : t)) : timeArr;
    });
    if (value !== undefined && onSelect) {
      onSelect(newValue);
      return;
    }
    setScheduleValue(newValue);
  };

  const handleClickAllDay = (time: number, checked: boolean) => {
    if (readOnly) return;
    const newValue = scheduleValue.map((timeArr, index) => {
      return timeArr.map((t, i) => (i === time ? checked : t));
    });
    if (value !== undefined && onSelect) {
      onSelect(newValue);
      0;
      return;
    }
    setScheduleValue(newValue);
  };

  const toggleIsDragging = (isDrag: boolean) => {
    if (isDragging !== isDrag) {
      setIsDragging(isDrag);
    }
  };
  const handleMouseDown = (day: number, time: number) => {
    if (readOnly) return;
    toggleIsDragging(true);
    handleClickTime(day, time);
  };
  const handleMouseUp = () => {
    if (readOnly) return;
    toggleIsDragging(false);
  };
  const handleMouseEnter = (day: number, time: number) => {
    if (readOnly) return;
    if (!isDragging) return;
    handleClickTime(day, time);
  };
  const handleMouseLeave = () => {
    if (readOnly) return;
    toggleIsDragging(false);
  };

  useEffect(() => {
    if (value !== undefined) {
      setScheduleValue(value);
    } else {
      setScheduleValue(defaultValue);
    }
  }, []);

  return (
    <div style={style}>
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
          width: 'calc(100% - (3em + 4px))',
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
            border: `1px solid var(--w500)`,
            borderBottom: 'none',
            borderRight: 'none',
          }}
          onMouseLeave={() => handleMouseLeave()}
        >
          {Days.map((day, i) => (
            <Row key={day} className="show-grid">
              {[...Array(24).keys()].map((time) => (
                <Cell
                  key={`${day}_${time}`}
                  xs={1}
                  active={scheduleValue[i][time] ? 'true' : undefined}
                  style={(time + 1) % 3 === 0 ? { borderRightColor: 'var(--w500)' } : undefined}
                  onMouseDown={() => handleMouseDown(i, time)}
                  onMouseUp={() => handleMouseUp()}
                  onMouseEnter={() => handleMouseEnter(i, time)}
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
            width: 'calc(100% - (3em + 4px))',
            display: 'inline-block',
            float: 'right',
          }}
        >
          <Grid
            fluid
            style={{
              border: `1px solid var(--w500)`,
            }}
          >
            <Row className="show-grid">
              {[...Array(24).keys()].map((time) => (
                <EveryDayCell
                  key={time}
                  xs={1}
                  active={isEveryDayTrue(time) ? 'true' : undefined}
                  onClick={() => {
                    handleClickAllDay(time, !isEveryDayTrue(time));
                  }}
                />
              ))}
            </Row>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default AppSchedule;
