import ListItem from './Item';
import { StyledList } from './Styles';
import { ListProps } from './types';

const List = (props: ListProps) => {
  const { variant = 'unordered', children, ...rest } = props;

  const Component = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <StyledList as={Component} variant={variant} {...rest}>
      {children}
    </StyledList>
  );
};

List.Item = ListItem;

export default List;
