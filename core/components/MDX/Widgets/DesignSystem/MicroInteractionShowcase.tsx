import {
  Card,
  Checkbox,
  Flex,
  Grid,
  Switch,
  Text,
  TextInput,
} from '@maximeheckel/design-system';
import React from 'react';

import CommandCenterButton from '@core/components/Buttons/CommandCenterButton';

const MicroInteractionShowcase = () => {
  const [dummyEmail, setDummyEmail] = React.useState('');
  const [dummyPassword, setDummyPassword] = React.useState('hello 👋');

  return (
    <Flex direction="column" gap="3">
      <Card css={{ width: '100%' }}>
        <Card.Body
          as={Flex}
          alignItems="center"
          css={{ height: '275px', margin: '0 auto', maxWidth: 500 }}
          direction="column"
          justifyContent="space-evenly"
        >
          <Flex
            css={{ width: '100%' }}
            direction="column"
            alignItems="start"
            justifyContent="center"
          >
            <TextInput
              aria-label="email"
              id="email"
              onChange={(event) => setDummyEmail(event.currentTarget.value)}
              type="email"
              value={dummyEmail}
            />
            <Text size="1" weight="3">
              Type a fake email like &quot;hello@test.co&quot;.
            </Text>
          </Flex>
          <Flex
            css={{ width: '100%' }}
            direction="column"
            alignItems="start"
            justifyContent="center"
          >
            <TextInput
              aria-label="Password"
              id="Password"
              onChange={(event) => setDummyPassword(event.currentTarget.value)}
              type="password"
              value={dummyPassword}
            />
            <Text size="1" weight="3">
              Click on the &quot;Reveal Password&quot; button.
            </Text>
          </Flex>
        </Card.Body>
      </Card>
      <Grid css={{ width: '100%' }} gap="3" templateColumns="repeat(2, 1fr)">
        <Card>
          <Card.Body
            as={Flex}
            alignItems="center"
            direction="column"
            justifyContent="space-evenly"
            gap="5"
          >
            <Checkbox
              aria-label="Check me!"
              id="sample-checkbox"
              label="Check me!"
            />
            <Switch
              aria-label="Toggle me!"
              id="sample-toggle"
              label="Toggle me!"
            />
          </Card.Body>
        </Card>
        <Card>
          <Card.Body
            as={Flex}
            alignItems="center"
            css={{ height: '100%' }}
            direction="column"
            justifyContent="center"
            gap="2"
          >
            <CommandCenterButton onClick={() => {}} />
            <Text size="1" weight="3">
              Hover, press and hold!
            </Text>
          </Card.Body>
        </Card>
      </Grid>
    </Flex>
  );
};

export default MicroInteractionShowcase;
