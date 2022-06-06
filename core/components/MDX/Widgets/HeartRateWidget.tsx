import LineChart from '@theme/components/Charts/LineChart';
import { ParentSize } from '@visx/responsive';
import { motion } from 'framer-motion';
import { GraphQLClient, gql } from 'graphql-request';
import { styled, Card } from '@maximeheckel/design-system';
import { useQuery } from 'react-query';

const GraphLabel = styled('div', {
  fontSize: '14px',
  fontWeight: '500',
  marginBottom: '0px',
});

const endpoint = 'https://graphql.fauna.com/graphql';
const secret = process.env.NEXT_PUBLIC_FAUNADB_SECRET;

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${secret}`,
  },
});

function useData() {
  return useQuery(
    'data',
    async () => {
      const { allEntriesSortedByDate } = await graphQLClient.request(
        gql`
          query {
            allEntriesSortedByDate(_size: 1) {
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

      return allEntriesSortedByDate.data;
    },
    {
      refetchInterval: 300000,
    }
  );
}

const Heart = ({ bpm }: { bpm: number }) => {
  return (
    <motion.svg
      style={{ marginLeft: '8px', marginBottom: '-4px' }}
      width="20"
      height="20"
      viewBox="0 0 25 24"
      fill="hsl(var(--palette-pink-50))"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.8 }}
      animate={{
        scale: 1.2,
      }}
      transition={{
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'mirror',
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
  const { data: healthData, isFetching } = useData();

  const lastEntry = healthData ? healthData[0] : { heartRate: [] };

  const dataPoints = lastEntry.heartRate.map(
    (entry: { value: number; timestamp: number }) => ({
      y: entry.value,
      x: new Date(entry.timestamp).getTime(),
    })
  );

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Header>
        <GraphLabel>Heart Rate</GraphLabel>
        {dataPoints.length !== 0 ? (
          <GraphLabel>
            Last entry: {dataPoints[0].y} bpm
            <Heart bpm={dataPoints[0].y} />
          </GraphLabel>
        ) : null}
      </Card.Header>
      {isFetching && dataPoints.length === 0 ? null : (
        <ParentSize>
          {({ width }) => (
            <LineChart
              width={width}
              height={220}
              data={dataPoints}
              unit="bpm"
            />
          )}
        </ParentSize>
      )}
    </Card>
  );
};

export default HeartRateWidget;
