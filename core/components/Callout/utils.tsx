import { AlertIcon, InfoIcon } from '../Icons';
import { CalloutVariant } from './types';

export const getVariantIcon = (variant: CalloutVariant): React.ReactNode => {
  switch (variant) {
    case 'info':
      return <InfoIcon size={5} />;
    case 'danger':
      return <AlertIcon size={5} />;
  }
};
