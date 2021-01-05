import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const LinkButton = styled(motion.button)`
  border-radius: var(--border-radius-1);
  width: 44px;
  height: 40px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  transition: 0.4s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;

  > * {
    margin-left: auto;
    margin-right: auto;
  }

  &:focus:not(:focus-visible) {
    outline: 0;
  }

  &:focus-visible {
    outline: 2px solid var(--maximeheckel-colors-brand);
    background-color: var(--maximeheckel-colors-foreground);
  }

  &:hover {
    background-color: var(--maximeheckel-colors-foreground);
  }
`;

export { LinkButton };
