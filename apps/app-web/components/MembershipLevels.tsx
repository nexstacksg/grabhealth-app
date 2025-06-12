'use client';

import React, { useState, useEffect } from 'react';

export default function MembershipLevels() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 h-[500px] animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6 mx-auto"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-[350px] bg-gray-100 rounded-lg"></div>
          <div className="h-[350px] bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">Understanding Our Membership Levels</h2>
      <p className="text-gray-600 text-sm text-center max-w-3xl mx-auto mb-4">
        Our membership system rewards loyalty with increasing benefits. Earn points to progress through levels and unlock exclusive perks.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Points-Based Progression */}
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <div className="flex items-center mb-3">
            <div className="bg-emerald-100 p-1.5 rounded-lg mr-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800">Points-Based Progression</h3>
          </div>
          <p className="text-gray-600 text-sm mb-3">Begin at Level 7 and earn points to advance through levels.</p>
          <div className="space-y-3">
            {[
              { from: 7, to: 6, points: 100 },
              { from: 6, to: 5, points: 200 },
              { from: 5, to: 4, points: 400 },
              { from: 4, to: 3, points: 1000 }
            ].map((level, idx) => (
              <div key={idx} className="flex items-center bg-white p-3 rounded-lg border border-gray-100">
                <span className="w-7 h-7 flex items-center justify-center bg-emerald-100 text-emerald-700 font-medium rounded-full text-sm mr-2">
                  {level.from}
                </span>
                <svg className="w-5 h-5 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="w-7 h-7 flex items-center justify-center bg-emerald-500 text-white font-medium rounded-full text-sm mx-1">
                  {level.to}
                </span>
                <div className="ml-auto text-sm text-gray-600">
                  {level.points} points
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount-Based Tiers */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center mb-3">
            <div className="bg-purple-100 p-1.5 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800">Discount-Based Tiers</h3>
          </div>
          <p className="text-gray-600 text-sm mb-3">Premium levels with exclusive discounts on products and services.</p>
          <div className="space-y-3">
            {[
              { level: 3, discount: '5%', color: 'from-purple-100 to-purple-50', textColor: 'text-purple-800' },
              { level: 2, discount: '10%', color: 'from-purple-200 to-purple-100', textColor: 'text-purple-800' },
              { level: 1, discount: '30%', color: 'from-purple-600 to-purple-400', textColor: 'text-white' }
            ].map((tier, idx) => (
              <div key={idx} className={`bg-gradient-to-r ${tier.color} p-3 rounded-lg flex items-center`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/30 ${tier.textColor} font-bold text-sm mr-3`}>
                  {tier.level}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${idx === 2 ? 'text-white' : 'text-gray-800'}`}>
                    Level {tier.level}
                  </h4>
                  <p className={`text-sm ${idx === 2 ? 'text-purple-100' : 'text-purple-700'}`}>
                    {tier.discount} discount on products
                  </p>
                </div>
                {idx === 0 && (
                  <div className="ml-auto bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Current
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Earning points:</span> 10 points per $100 spent. Automatic upgrades when reaching required points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
