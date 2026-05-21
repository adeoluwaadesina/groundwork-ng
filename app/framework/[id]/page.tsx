import { notFound } from 'next/navigation';
import { getFrameworkById } from '@/lib/db/frameworks';
import { FrameworkReader } from './FrameworkReader';
import type { Framework } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 30;

async function getFramework(id: string): Promise<Framework | null> {
  try {
    return await getFrameworkById(id);
  } catch (error) {
    console.error('Error loading framework:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const fw = await getFramework(id);
  if (!fw) return { title: 'Not found · Ground Work' };
  return {
    title: `${fw.title} · ${fw.id} · Ground Work`,
    description: fw.subtitle || fw.lite_content?.slice(0, 160),
    openGraph: {
      title: fw.title,
      description: fw.subtitle,
      type: 'article',
      authors: ['Adeoluwa Adesina'],
    },
  };
}

export default async function FrameworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const framework = await getFramework(id);
  if (!framework) notFound();

  return <FrameworkReader framework={framework} />;
}
