// src/app/layout.js
import './globals.css'

export const metadata = {
  title: 'StreamSync',
  description: 'Share and watch videos in real-time with friends!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ios-background min-h-screen text-ios-text antialiased">
        {children}
      </body>
    </html>
  )
}