import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مِراس | عبايات وفساتين بتفاصيل راقية',
  description: 'مِراس — أزياء نسائية تجمع بين الهدوء، الأناقة، والتفاصيل العربية المعاصرة.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
