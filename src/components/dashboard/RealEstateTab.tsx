import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { Loader2, MapPin, Bed, Bath, Square, ExternalLink } from 'lucide-react';

interface RealEstateListing {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  image_url: string;
  listing_url: string;
  source_website: string;
}

export default function RealEstateTab() {
  const [sortBy, setSortBy] = useState<'price' | 'date'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'houses' | 'condos'>('all');

  const { data: listings, isLoading } = useQuery<RealEstateListing[]>(
    ['real-estate-listings', sortBy, filterBy],
    async () => {
      let query = supabase
        .from('real_estate_listings')
        .select('*');

      // Apply filters
      if (filterBy === 'houses') {
        query = query.ilike('title', '%house%');
      } else if (filterBy === 'condos') {
        query = query.ilike('title', '%condo%');
      }

      // Apply sorting
      if (sortBy === 'price') {
        query = query.order('price', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'date')}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="date">Newest First</option>
            <option value="price">Price: Low to High</option>
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as 'all' | 'houses' | 'condos')}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Properties</option>
            <option value="houses">Houses</option>
            <option value="condos">Condos</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings?.map((listing) => (
          <div
            key={listing.id}
            className="bg-white/5 rounded-lg overflow-hidden border border-white/10"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {listing.title}
              </h3>
              <p className="text-2xl font-bold text-blue-400 mb-4">
                ${listing.price.toLocaleString()}
              </p>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{listing.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{listing.bathrooms} baths</span>
                  </div>
                  {listing.square_feet && (
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>{listing.square_feet} sqft</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition-colors"
                >
                  View Listing
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 