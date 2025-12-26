import { useState } from 'react';

const tabs = [
  { id: 'posts', label: 'Gönderiler' },
  { id: 'reposts', label: 'Repostlar' },
  { id: 'stars', label: 'Yıldızlananlar' }
];

export default function ProfileTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="bg-white border-b border-twitter-lightGray">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 px-4 py-4 text-sm font-medium transition-colors relative
              hover:bg-twitter-extraLightGray
              ${activeTab === tab.id
                ? 'text-twitter-darkGray'
                : 'text-twitter-gray'
              }
            `}
          >
            {tab.label}
            {counts[tab.id] !== undefined && (
              <span className="ml-1 text-twitter-gray">
                ({counts[tab.id]})
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-twitter-blue rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
