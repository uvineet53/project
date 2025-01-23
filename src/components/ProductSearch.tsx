import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  Highlight,
  Configure,
  connectSearchBox,
} from 'react-instantsearch-dom';
import { Search, X } from 'lucide-react';

// Initialize Algolia client
const searchClient = algoliasearch('EVDERDZZER', '99d42c6d72ee332c07fa1a445cef2e55');
searchClient.initIndex('movies_index');

interface Product {
  name: string;
  price: number;
  description: string;
  image: string;
  id: string;
}

const ProductHit = ({ hit }: { hit: Product }) => (
  <a
    href={`/product/${hit.id}`}
    className="flex items-center gap-4 p-4 transition-all duration-200 hover:bg-gray-50"
  >
    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
      <img
        src={hit.image}
        alt={hit.name}
        className="h-full w-full object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-medium text-gray-900 truncate">
        <Highlight attribute="name" hit={hit} />
      </h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
        <Highlight attribute="description" hit={hit} />
      </p>
      <p className="mt-1 text-sm font-medium text-blue-600">
        ${hit.price.toFixed(2)}
      </p>
    </div>
  </a>
);

const SearchBox = connectSearchBox(({ currentRefinement, refine }: { currentRefinement: string; refine: (value: string) => void }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className={`relative rounded-lg border transition-all duration-200 ${
        isFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'
      }`}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          value={currentRefinement}
          onChange={(e) => refine(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="block w-full rounded-lg border-0 py-3 pl-11 pr-10 text-gray-900 ring-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Search products..."
        />
        {currentRefinement && (
          <button
            onClick={() => refine('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
});

const ProductSearch = () => {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <InstantSearch indexName="movies_index" searchClient={searchClient}>
        <Configure hitsPerPage={5} />
        <div
          onFocus={() => setShowResults(true)}
          onBlur={(e) => {
            // Only hide results if we're not clicking inside them
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setShowResults(false);
            }
          }}
          tabIndex={-1}
        >
          <SearchBox />
          {showResults && (
            <div className="absolute mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              <Hits hitComponent={ProductHit} />
            </div>
          )}
        </div>
      </InstantSearch>
    </div>
  );
};

export default ProductSearch;