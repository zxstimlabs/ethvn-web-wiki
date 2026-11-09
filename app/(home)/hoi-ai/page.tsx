import type { Metadata } from 'next';
import { AskAi } from '@/components/ask/ask-ai';
import { buildMetadata } from '@/lib/metadata';
import { askDescription, askRoute, askTitle } from '@/lib/shared';

export const metadata: Metadata = buildMetadata({
  title: askTitle,
  description: askDescription,
  path: askRoute,
  image: '/og/hoi-ai/image.png',
});

export default function AskPage() {
  return (
    <section lang="vi" className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 md:pt-12">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{askTitle}</h1>
      <p className="mt-3 text-fd-muted-foreground">
        Gõ câu hỏi, wiki tìm ngay các bài liên quan. Muốn hỏi sâu hơn, mang câu hỏi sang ứng dụng AI bạn quen dùng: câu hỏi
        được gửi kèm đường dẫn tới wiki để AI đọc trước khi trả lời. Miễn phí, không cần đăng ký ở đây.
      </p>
      <AskAi />
    </section>
  );
}
