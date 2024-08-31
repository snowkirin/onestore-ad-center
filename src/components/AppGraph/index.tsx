import React, { useEffect, useMemo, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';

const AppGraph = (data: { data: any; colors?: any[] }) => {
  // const dataOption = {
  //   title: {
  //     text: 'Stacked Line',
  //   },
  //   tooltip: {
  //     trigger: 'axis',
  //   },
  //   legend: {
  //     data: [
  //       'Email',
  //       'Union Ads',
  //       'Video Ads',
  //       'Direct',
  //       'Search Engine',
  //       'Baidu',
  //       'Google',
  //       'Bing',
  //       'Others',
  //       'Weibo',
  //       'WeChat',
  //       'QQ',
  //       'Twitter',
  //       'Facebook',
  //       'Youtube',
  //       'Linkedin',
  //       'Instagram',
  //       'Reddit',
  //       'Pinterest',
  //       'Tumblr',
  //       'Snapchat',
  //       'Line',
  //       'WhatsApp',
  //       'Telegram',
  //       'Discord',
  //       'Viber',
  //       'Skype',
  //     ],
  //     top: 'bottom',
  //   },
  //   grid: {
  //     left: '3%',
  //     right: '4%',
  //     bottom: '15%',
  //     containLabel: true,
  //   },
  //   toolbox: {
  //     feature: {
  //       saveAsImage: {},
  //     },
  //   },
  //   xAxis: {
  //     type: 'category',
  //     boundaryGap: false,
  //     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //   },
  //   yAxis: {
  //     type: 'value',
  //   },
  //   series: [
  //     {
  //       name: 'Email',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [120, 132, 101, 134, 90, 230, 210],
  //     },
  //     {
  //       name: 'Union Ads',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [220, 182, 191, 234, 290, 330, 310],
  //     },
  //     {
  //       name: 'Video Ads',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [150, 232, 201, 154, 190, 330, 410],
  //     },
  //     {
  //       name: 'Direct',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [320, 332, 301, 334, 390, 330, 320],
  //     },
  //     {
  //       name: 'Search Engine',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [820, 932, 901, 934, 1290, 1330, 1320],
  //     },
  //     {
  //       name: 'Baidu',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Google',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Bing',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Others',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Weibo',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'WeChat',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'QQ',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Twitter',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Facebook',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Youtube',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Linkedin',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Instagram',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Reddit',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Pinterest',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Tumblr',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Snapchat',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Line',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'WhatsApp',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Telegram',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Discord',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Viber',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //     {
  //       name: 'Skype',
  //       type: 'line',
  //       stack: 'Total',
  //       data: [620, 732, 701, 734, 1090, 1130, 1120],
  //     },
  //   ],
  // };

  let chartRef = useRef<any>();

  const graphOptions = useMemo(() => {
    const graphData = data.data;
    const graphSeries = graphData.series.map((ele: any, idx: number) => {
      return {
        ...ele,
        ...(ele.type === 'line' && {
          lineStyle: {
            width: 1,
          },
        }),
        ...(data.colors &&
          data.colors[idx] !== undefined && {
            color: data.colors[idx],
          }),
      };
    });
    return {
      height: 300,
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 10,
        },
      },
      legend: {
        data: graphData.legends,
        backgroundColor: '#fff',
        top: 'bottom',
        textStyle: {
          fontSize: 10,
        },
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '50%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: graphData.xaxis,
        axisLabel: {
          color: '#9a9a9a',
          fontSize: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            color: '#9a9a9a',
            fontSize: 10,
          },
        },
        {
          type: 'value',
          axisLabel: {
            color: '#9a9a9a',
            fontSize: 10,
          },
        },
      ],
      series: graphSeries,
    };
  }, [data]);

  useEffect(() => {
    const resizeChart = () => {
      if (chartRef !== null) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener('resize', resizeChart);
    // cleanup
    return () => {
      window.removeEventListener('resize', resizeChart);
    };
  }, []);

  return (
    <>
      {Object.keys(graphOptions).length !== 0 ? (
        <ReactEcharts option={graphOptions} notMerge={true} style={{ height: 420 }} ref={chartRef} />
      ) : (
        <div
          style={{
            width: '1000px',
            height: '350px',
            marginTop: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            표시할 데이터가 없습니다.
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(AppGraph, (prevProps, nextProps) => prevProps.data === nextProps.data);
