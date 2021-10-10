import React from 'react';
import { EnterArrowIcon } from '../Icons';
import { StyledListItem } from './Styles';

const ListItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledListItem {...rest}>
      <span data-list-item>
        <EnterArrowIcon stroke="var(--maximeheckel-colors-brand)" />
      </span>
      <div>{children}</div>
    </StyledListItem>
  );
};

ListItem.displayName = 'ListItem';

export default ListItem;
