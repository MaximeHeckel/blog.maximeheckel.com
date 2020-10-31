import { motion } from 'framer-motion';
import { useTheme } from 'gatsby-theme-maximeheckel/src/context/ThemeContext';
import styled from 'gatsby-theme-maximeheckel/src/utils/styled';
import { GraphQLClient, gql } from 'graphql-request';
import React from 'react';
import {
  AreaChart,
  XAxis,
  YAxis,
  Area,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useQuery } from 'react-query';

const GraphTitle = styled('p')`
  font-size: 14px;
  margin-bottom: 0px;
  color: #949699;
  font-weight: 500;
`;

const GraphtHeader = styled('div')`
  @media (max-width: 500px) {
    border-radius: 0px;
    padding: 0px 8px;
  }

  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  min-height: 45px;
  padding: 15px 14px;
  margin-bottom: 30px;
`;

const GraphWidget = styled('div')`
  font-size: 14px;
  margin-bottom: 0px;
  color: #949699;
  font-weight: 500;
`;

const GraphWrapper = styled('div')`
  @media (max-width: 700px) {
    // padding: 40px 30px;
  }

  width: 100%;
  min-height: 300px;
  height: 300px;
  background: ${p => p.theme.colors.prism.plain.backgroundColor};
  border-radius: 10px;
  padding: 0px 0px 10px 0px;
  overflow: hidden;

  .recharts-wrapper .recharts-cartesian-grid-horizontal line:nth-last-child(2),
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:last-child {
    display: none;
  }
`;

const endpoint = 'https://graphql.fauna.com/graphql';
const { GATSBY_FAUNADB_SECRET: secret } = process.env;

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${secret}`,
  },
});

function useData() {
  return useQuery(
    'data',
    async () => {
      const { allEntries } = await graphQLClient.request(
        gql`
          query {
            allEntries {
              data {
                date
                heartRate {
                  value
                  timestamp
                }
                steps {
                  value
                  timestamp
                }
              }
            }
          }
        `
      );

      return allEntries.data;
    },
    {
      refetchInterval: 300000,
    }
  );
}

const TooltipWrapper = styled('div')`
  padding: 10px;
  width: 200px;
  height: 75px;
  font-size: 14px;
  background-color: #ffffff;
  color: black;
  border-radius: 5px;
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <TooltipWrapper>
        <div>{`Time: ${new Date(label).getHours()}:${(new Date(
          label
        ).getMinutes() < 10
          ? '0'
          : '') + new Date(label).getMinutes()}`}</div>
        <div>{`Impressions: ${payload[0].value}`}</div>
      </TooltipWrapper>
    );
  }

  return null;
};

const Heart = ({ bpm }: { bpm: number }) => {
  return (
    <motion.svg
      style={{ marginLeft: '8px', marginBottom: '-4px' }}
      width="20"
      height="20"
      viewBox="0 0 25 24"
      fill="#ff008c"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.8 }}
      animate={{
        scale: 1.2,
      }}
      transition={{
        ease: 'easeInOut',
        yoyo: Infinity,
        duration: 60 / bpm / 2,
      }}
    >
      <path
        d="M21.4551 4.60999C20.9443 4.099 20.3379 3.69364 19.6704 3.41708C19.003 3.14052 18.2876 2.99817 17.5651 2.99817C16.8426 2.99817 16.1272 3.14052 15.4597 3.41708C14.7923 3.69364 14.1858 4.099 13.6751 4.60999L12.6151 5.66999L11.5551 4.60999C10.5234 3.5783 9.12411 2.9987 7.66508 2.9987C6.20605 2.9987 4.80677 3.5783 3.77508 4.60999C2.74339 5.64169 2.16379 7.04096 2.16379 8.49999C2.16379 9.95903 2.74339 11.3583 3.77508 12.39L4.83508 13.45L12.6151 21.23L20.3951 13.45L21.4551 12.39C21.9661 11.8792 22.3714 11.2728 22.648 10.6053C22.9246 9.93789 23.0669 9.22248 23.0669 8.49999C23.0669 7.77751 22.9246 7.0621 22.648 6.39464C22.3714 5.72718 21.9661 5.12075 21.4551 4.60999V4.60999Z"
        stroke="#ff008c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
};

const HeartRateWidget = () => {
  const { status, data: healthData, error, isFetching } = useData();
  const { dark } = useTheme();

  const lastEntry = healthData
    ? healthData[healthData.length - 1]
    : { heartRate: [] };

  const dataPoints = lastEntry.heartRate.map(entry => ({
    value: entry.value,
    timestamp: new Date(entry.timestamp).getTime(),
  }));

  return (
    <GraphWrapper>
      <GraphtHeader
        css={{
          borderBottom: `1px solid ${dark ? '#151617' : '#dce6f3'}`,
        }}
      >
        <GraphTitle>Heart Rate</GraphTitle>
        {dataPoints.length !== 0 ? (
          <GraphWidget>
            Last entry: {dataPoints[0].value} bpm
            <Heart bpm={dataPoints[0].value} />
          </GraphWidget>
        ) : null}
      </GraphtHeader>
      {isFetching && dataPoints.length === 0 ? null : (
        <ResponsiveContainer width="101%" height="75%">
          <AreaChart data={dataPoints}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={dark ? '#151617' : '#dce6f3'}
              vertical={false}
            />
            <defs>
              <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="20%" stopColor="#ff008c" stopOpacity={0.6} />
                <stop offset="99%" stopColor="#ff008c" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              hide={true}
              dataKey="timestamp"
              domain={['dataMin', 'dataMax']}
              type="number"
              // interval="preserveEnd"
              // stroke="#949699"
              // tickFormatter={date =>
              //   `${new Date(date).getHours()}:${(new Date(
              //     date
              //   ).getMinutes() < 10
              //     ? '0'
              //     : '') + new Date(date).getMinutes()}`
              // }
            />
            <Area
              dot={false}
              dataKey="value"
              fillOpacity={1}
              fill="url(#hr)"
              stroke="#ff008c"
              strokeWidth={2}
            />
            <YAxis
              padding={{ top: 20, bottom: 0 }}
              width={40}
              domain={['dataMin-5', 'dataMax + 5']}
              stroke="rgb(148, 150, 153, 0.7)"
              tickLine={{ stroke: dark ? '#151617' : '#dce6f3' }}
              tickMargin={10}
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GraphWrapper>
  );
};

export { HeartRateWidget };
