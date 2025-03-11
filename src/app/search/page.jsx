import PostFeed from '@/components/post-feed';
import { SearchBar } from '@/components/search';

import React from 'react';

export default function Page() {

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Qidiruv paneli uchun yuqori qism */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-4 ">
        <SearchBar />
      </header>

      {/* Postlar uchun asosiy qism */}
      <main className="container mx-auto px-4 py-6">
        <PostFeed />
      </main>
    </div>
  );
}