import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { sectionTab } from '@/lib/sections';

export default function Layout({ children }: LayoutProps<'/tai-lieu'>) {
  return (
    <DocsLayout tree={source.getPageTree()} tabs={{ transform: sectionTab }} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
