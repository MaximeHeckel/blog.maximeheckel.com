import React from 'react';
import { ArrowIcon } from '../Icons';
import { StyledListItem } from './Styles';

const ListItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledListItem {...rest}>
      <span data-list-item>
        <ArrowIcon variant="info" />
      </span>
      <div>{children}</div>
    </StyledListItem>
  );
};

ListItem.displayName = 'ListItem';

export default ListItem;
