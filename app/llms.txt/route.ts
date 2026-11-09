import { llmsIndex } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  // charset spelled out: without it, browsers can decode the Vietnamese as Latin-1
  return new Response(await llmsIndex(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
