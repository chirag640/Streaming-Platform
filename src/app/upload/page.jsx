// src/app/upload/page.jsx
import UploadForm from '@/components/UploadForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UploadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Upload Media</h1>
        <UploadForm />
      </main>
      <Footer />
    </div>
  );
}