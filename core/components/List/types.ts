export interface UnorderedListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  variant: 'unordered';
}

export interface OrderedListProps
  extends React.OlHTMLAttributes<HTMLOListElement> {
  variant: 'ordered';
}

export type ListProps = OrderedListProps | UnorderedListProps;
