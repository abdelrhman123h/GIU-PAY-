import '../src/styles/globals.css';

export const metadata = {
  title: 'E-Wallet',
  description: 'Modern animated e-wallet UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-white font-sans min-h-screen animate-gradientBG">
        {children}
      </body>
    </html>
  );
}
