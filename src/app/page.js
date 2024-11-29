// src/app/page.js
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen pt-16">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-ios-blue to-purple-500 text-transparent bg-clip-text">
            Welcome to StreamSync
          </h1>
          <p className="text-xl text-ios-gray">
            Share and watch videos in real-time with friends!
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/upload" 
              className="bg-ios-blue text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Upload Media
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-ios-card text-ios-blue px-8 py-3 rounded-full font-medium border border-ios-blue hover:bg-ios-blue/5 transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}