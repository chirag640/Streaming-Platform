// src/app/stream/[id]/page.jsx
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import MediaPlayer from '@/components/MediaPlayer';
import VideoCall from '@/components/VideoCall';
import ChatBox from '@/components/ChatBox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareButton from '@/components/ShareButton';

async function getMediaData(id) {
  try {
    const { db } = await connectToDatabase();
    const media = await db.collection('media').findOne({ _id: new ObjectId(id) });
    return media;
  } catch (error) {
    console.error('Error fetching media:', error);
    return null;
  }
}

export default async function StreamPage({ params }) {
  // Wait for the entire params object
  const resolvedParams = await params;
  const pageId = resolvedParams.id;
  
  if (!pageId) {
    return <div>Invalid media ID</div>;
  }

  // Fetch media data
  const media = await getMediaData(pageId);

  if (!media) {
    return <div>Media not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{media.filename}</h1>
          <ShareButton roomId={pageId} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <MediaPlayer fileUrl={media.fileUrl} roomId={pageId} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <VideoCall roomId={pageId} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <ChatBox roomId={pageId} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}