import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  Highlight,
  Configure,
  connectSearchBox,
} from 'react-instantsearch-dom';

// Initialize Algolia client
const searchClient = algoliasearch('EVDERDZZER', '99d42c6d72ee332c07fa1a445cef2e55');
searchClient.initIndex('movies_index');
searchClient.search
// Component to render individual search hits
interface Product {
  name: string;
  price: number;
  description: string;
  image: string;
  id: string;
}

const ProductHit = ({ hit }: { hit: Product }) => (
  <a
    href={`/product/${hit.id}`} // Link to the product page
    className="border border-gray-200 rounded-lg p-4 shadow-md bg-white/70 backdrop-blur-sm flex gap-5 items-center hover:shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
  >
    <img
      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
      src={hit.image}
      alt={hit.name}
    />
    <div>
      <h3 className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200">
        <Highlight attribute="name" hit={hit} />
      </h3>
      <p className="text-sm text-gray-600">
        Price: <span className="font-semibold">${hit.price}</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">
        <Highlight attribute="description" hit={hit} />
      </p>
    </div>
  </a>
);

// Custom Search Box Component
const CustomSearchBox = ({ currentRefinement, refine }: { currentRefinement: string; refine: (value: string) => void }) => {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        value={currentRefinement}
        onChange={(e) => refine(e.target.value)}
        className="w-full rounded-full border border-gray-300 px-6 py-3 pl-12 text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search for products..."
      />
      {/* Custom Search Icon */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M16.65 11A5.65 5.65 0 1111 5.35 5.65 5.65 0 0116.65 11z"
          />
        </svg>
      </div>
    </div>
  );
};

// Connect custom search box to Algolia
const SearchBox = connectSearchBox(CustomSearchBox);

const ProductSearch = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Search Products</h1>
      <InstantSearch indexName="movies_index" searchClient={searchClient}>
      <Configure hitsPerPage={2} />
        <SearchBox
         
        />
        <Hits hitComponent={ProductHit} />
      </InstantSearch>
    </div>
  );
};


export default ProductSearch;
