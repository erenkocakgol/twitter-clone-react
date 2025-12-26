const filters = [
  { id: 'all', label: 'Tümü' },
  { id: 'posts', label: 'Gönderiler' },
  { id: 'users', label: 'Kullanıcılar' },
  { id: 'tags', label: 'Etiketler' }
];

export default function SearchFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="bg-white border-b border-twitter-lightGray sticky top-0 z-10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors relative
              hover:bg-twitter-extraLightGray
              ${activeFilter === filter.id
                ? 'text-twitter-darkGray'
                : 'text-twitter-gray'
              }
            `}
          >
            {filter.label}
            {activeFilter === filter.id && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-twitter-blue rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
