export type FrameworkFormFields = {
  id: string;
  title: string;
  subtitle: string;
  sector: string;
  date: string;
  tags: string;
  lite_content: string;
  full_content: string;
};

export type FrameworkImportResult = {
  fields: FrameworkFormFields;
  warnings: string[];
  source: string;
};

export const FRAMEWORK_UPLOAD_ACCEPT = '.md,.markdown,.json,.txt';
export const FRAMEWORK_UPLOAD_HINT =
  'Markdown (.md), JSON (.json), or plain text (.txt). Use the template for best results.';
