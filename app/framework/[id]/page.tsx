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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const fw = await getFramework(params.id);
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

export default async function FrameworkPage({ params }: { params: { id: string } }) {
  const framework = await getFramework(params.id);
  if (!framework) notFound();

  return <FrameworkReader framework={framework} />;
}
