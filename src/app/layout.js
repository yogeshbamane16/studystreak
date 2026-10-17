import './globals.css';

export const metadata = {
  title: 'StudyStreak - Tactical AI Study Companion',
  description: 'Mobile-first AI Study Companion for competitive exam aspirants (JEE, NEET, UPSC, GATE, CAT, SSC, Banking) powered by BharatCode AI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StudyStreak',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#101416',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark bg-[#0b0f11]">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.removeItem('studystreak_theme');
                document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0b0f11] text-slate-100 antialiased selection:bg-brand-500 selection:text-black">
        {children}

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) {
                      console.log('StudyStreak Service Worker registered with scope: ', reg.scope);
                    },
                    function(err) {
                      console.log('StudyStreak Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
