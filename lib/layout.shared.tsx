import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { MessageCircleQuestionMark } from 'lucide-react';
import { appName, askRoute, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    // in the home header, and in the wiki's sidebar
    links: [{ text: 'Hỏi AI', url: askRoute, icon: <MessageCircleQuestionMark /> }],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
