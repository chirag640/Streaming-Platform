// src/app/dashboard/page.jsx
import { connectToDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

async function getUploadedMedia() {
  const { db } = await connectToDatabase();
  const media = await db.collection('media').find().sort({ uploadDate: -1 }).toArray();
  return media;
}

export default async function DashboardPage() {
  const uploadedMedia = await getUploadedMedia();

  return (
    <div className="min-h-screen pt-16">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">My Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadedMedia.map((media) => (
            <div key={media._id} className="bg-ios-card rounded-ios p-6 shadow-ios hover:shadow-ios-hover transition-shadow">
              <h2 className="text-xl font-semibold mb-3">{media.filename}</h2>
              <p className="text-ios-gray mb-6">
                {new Date(media.uploadDate).toLocaleDateString()}
              </p>
              <Link
                href={`/stream/${media._id}`}
                className="bg-ios-blue text-white w-full py-3 rounded-full font-medium text-center block hover:opacity-90 transition-opacity"
              >
                Watch Stream
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}