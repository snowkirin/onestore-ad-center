import React, { useEffect } from 'react';

interface CountDownProps {
  style?: React.CSSProperties;
}

const CountDown: React.FC<CountDownProps> = ({ style }) => {
  const [time, setTime] = React.useState(600);
  useEffect(() => {
    let interval: any = null;
    interval = setInterval(() => {
      setTime((time) => time - 1);
    }, 1000);

    if (time === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [time]);

  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  return (
    <div style={style}>
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

export default CountDown;
