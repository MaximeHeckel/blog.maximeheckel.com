import { Flex, Text } from '@maximeheckel/design-system';
import CommandCenterButton from '@theme/components/Button/CommandCenterButton';
import Card from '@theme/components/Card';
import Checkbox from '@theme/components/Checkbox';
import Grid from '@theme/components/Grid';
import Switch from '@theme/components/Switch';
import TextInput from '@theme/components/TextInput';
import React from 'react';

const MicroInteractionShowcase = () => {
  const [dummyEmail, setDummyEmail] = React.useState('');
  const [dummyPassword, setDummyPassword] = React.useState('hello 👋');

  return (
    <Flex css={{ marginBottom: '2.25rem' }} direction="column" gap="3">
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
            <Text css={{ marginBottom: 0 }} size="1" weight="3">
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
            <Text css={{ marginBottom: 0 }} size="1" weight="3">
              Click on the &quot;Reveal Password&quot; button.
            </Text>
          </Flex>
        </Card.Body>
      </Card>
      <Grid css={{ width: '100%' }} columns="2" gap="3">
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
            <Text css={{ marginBottom: 0 }} size="1" weight="3">
              Hover, press and hold!
            </Text>
          </Card.Body>
        </Card>
      </Grid>
    </Flex>
  );
};

export default MicroInteractionShowcase;
