import styled from 'styled-components';
import React, { FC } from 'react';
import { useInject } from '@ts-di/react';
import { LOGGER } from '../../tokens/_logger';

const Button = styled.button`
  background-color: aquamarine;
  border-radius: 16px;
  padding: 8px 16px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

interface LoggerButtonProps {
  onClick: () => any;
}

export const LoggerButton: FC<LoggerButtonProps> = props => {
  const logger = useInject(LOGGER);
  const onClick = evt => {
    const result = props.onClick();
    logger(result, 'event', evt);
  };

  return <Button onClick={onClick}>{props.children}</Button>;
};
