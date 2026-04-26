import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { FrameworkReader } from './FrameworkReader';
import type { Framework } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 30;

async function getFramework(id: string): Promise<Framework | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('frameworks')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Framework;
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
