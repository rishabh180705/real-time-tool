import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, PencilRuler, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-gray-900 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold tracking-wide">CollabSuite</h1>
          <nav className="space-x-6 text-sm font-medium">
            <Link to="/Auth" className="hover:text-blue-400 transition">Login</Link>
            <Link to="/Auth" className="hover:text-blue-400 transition">Signup</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-100 to-purple-200 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-gray-800">Create. Collaborate. Code.</h2>
          <p className="text-lg text-gray-700 mb-10">All-in-one platform for team collaboration with an editor, whiteboard, voice chat & screen sharing.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/editor" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              <Code2 size={20} /> Use Editor
            </Link>
            <Link to="/whiteboard" className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
              <PencilRuler size={20} /> Use Whiteboard
            </Link>
            <Link to="/workspace" className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
              <LayoutDashboard size={20} /> Use Both
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 shadow-lg rounded-xl bg-gray-50 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">Team Collaboration</h3>
            <p className="text-gray-700">Create and manage teams with real-time role-based collaboration.</p>
          </div>
          <div className="p-6 shadow-lg rounded-xl bg-gray-50 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2 text-green-600">Voice Meetings</h3>
            <p className="text-gray-700">Integrated high-quality voice calls for smooth communication.</p>
          </div>
          <div className="p-6 shadow-lg rounded-xl bg-gray-50 hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2 text-purple-600">Screen Sharing</h3>
            <p className="text-gray-700">Effortlessly share your screen with your team in real-time.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6 mt-auto">
        <p className="text-sm">&copy; 2025 CollabSuite. All rights reserved.</p>
      </footer>
    </div>
  );
}
