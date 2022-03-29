import { Icon } from '@maximeheckel/design-system';
import React from 'react';
import { StyledListItem } from './Styles';

const ListItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledListItem {...rest}>
      <span data-list-item>
        <Icon.Arrow variant="info" />
      </span>
      <div>{children}</div>
    </StyledListItem>
  );
};

ListItem.displayName = 'ListItem';

export default ListItem;
