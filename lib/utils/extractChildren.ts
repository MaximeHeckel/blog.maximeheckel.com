import React from 'react';

export const extractChildren = (
  children: React.ReactNode,
  predicate: (child: React.ReactNode) => boolean
) => {
  const match: React.ReactNode[] = [];
  const rest: React.ReactNode[] = [];
  React.Children.toArray(children).forEach((child) => {
    if (predicate(child)) {
      match.push(child);
    } else {
      rest.push(child);
    }
  });

  return { match, rest };
};
