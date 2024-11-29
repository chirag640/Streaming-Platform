// src/app/page.js
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">Welcome to StreamSync</h1>
        <p className="text-xl mb-8 text-center">Share and watch videos in real-time with friends!</p>
        <div className="flex justify-center space-x-4">
          <Link href="/upload" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Upload Media
          </Link>
          <Link href="/dashboard" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            My Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}