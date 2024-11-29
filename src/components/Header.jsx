// src/components/Header.jsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-ios-card/70 backdrop-blur-lg fixed w-full top-0 z-50 shadow-ios">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold text-ios-blue">
          StreamSync
        </Link>
        <nav className="space-x-6">
          <Link href="/upload" className="text-ios-blue hover:opacity-80 transition-opacity">
            Upload
          </Link>
          <Link href="/dashboard" className="text-ios-blue hover:opacity-80 transition-opacity">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}