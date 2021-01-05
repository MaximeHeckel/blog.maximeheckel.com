import { Layout } from './MainLayout';

export interface LayoutChildrenProps {
  site: {
    siteMetadata: {
      author: string;
      title: string;
      url: string;
    };
  };
}

export default Layout;
