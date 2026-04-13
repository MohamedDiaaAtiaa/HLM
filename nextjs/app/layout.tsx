import type { Metadata } from 'next';
import { Cairo, Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ 
  subsets: ['arabic', 'latin'], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-ar',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-heading-en',
});

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-en',
});

export const metadata: Metadata = {
  title: 'HLM Legal | Hassan, Loqman & Mourad — محامون ومستشارون قانونيون',
  description: 'HLM Legal (Hassan, Loqman & Mourad) - Leading law advocates and legal consultants in Egypt and the Gulf. Specialized in corporate law, arbitration, and commercial disputes. H.L.M شريكك القانوني لحماية أعمالك واستثماراتك.',
  keywords: 'HLM Legal, hlm-legal, Hassan Loqman Mourad, H.L.M, حسن ولقمان ومراد, محامي, استشارات قانونية, قانون تجاري, شركات, عقارات, تحكيم, مصر, الخليج, Law firm Cairo',
  openGraph: {
    title: 'HLM Legal | Hassan, Loqman & Mourad — Law Advocates',
    description: 'HLM Legal - Your Legal Partner to Protect Your Business & Investments. Specialized legal consultancy in Egypt & the Gulf.',
    url: 'https://hlm-legal.com',
    siteName: 'HLM Legal',
    images: [{
      url: 'https://hlm-legal.com/images/Logo.png',
      width: 800,
      height: 600,
    }],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HLM Legal | Hassan, Loqman & Mourad',
    description: 'Expert Law Advocates & Legal Consultants in Egypt and the Gulf Region.',
    images: ['https://hlm-legal.com/images/Logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/images/Logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
