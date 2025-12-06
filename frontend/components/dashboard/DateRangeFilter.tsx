"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  onRangeChange: (days: number) => void;
  currentRange: number;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export function DateRangeFilter({ onRangeChange, currentRange, onDateRangeChange }: DateRangeFilterProps) {
  const [showCustomDays, setShowCustomDays] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ranges = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
    { label: "1 Year", value: 365 },
  ];

  const isPresetRange = ranges.some(r => r.value === currentRange);

  const handleCustomDaysSubmit = () => {
    const days = parseInt(customDays);
    if (days > 0 && days <= 3650) {
      onRangeChange(days);
      setShowCustomDays(false);
      setShowDatePicker(false);
      setCustomDays("");
    }
  };

  const handleDateRangeSubmit = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (onDateRangeChange) {
        onDateRangeChange(startDate, endDate);
      }
      onRangeChange(diffDays);
      setShowDatePicker(false);
      setShowCustomDays(false);
    }
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return null;
  };

  return (
    <div className="glass-effect rounded-2xl shadow-2xl border border-teal-500/50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-gray-400/5"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold text-teal-300">Time Range</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                onRangeChange(range.value);
                setShowCustomDays(false);
                setShowDatePicker(false);
                setStartDate("");
                setEndDate("");
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentRange === range.value && !startDate && !endDate
                  ? "bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 text-black shadow-lg shadow-teal-500/50"
                  : "bg-black/50 text-gray-300 border border-teal-500/30 hover:border-teal-400/50 hover:bg-teal-500/10"
              }`}
            >
              {range.label}
            </button>
          ))}
          
          {!showCustomDays && !showDatePicker ? (
            <>
              <button
                onClick={() => {
                  setShowCustomDays(true);
                  setShowDatePicker(false);
                }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isPresetRange && !startDate
                    ? "bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 text-black shadow-lg shadow-teal-500/50"
                    : "bg-black/50 text-gray-300 border border-teal-500/30 hover:border-teal-400/50 hover:bg-teal-500/10"
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {!isPresetRange && !startDate ? `${currentRange} Days` : "Custom Days"}
              </button>
              <button
                onClick={() => {
                  setShowDatePicker(true);
                  setShowCustomDays(false);
                }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  startDate && endDate
                    ? "bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 text-black shadow-lg shadow-teal-500/50"
                    : "bg-black/50 text-gray-300 border border-teal-500/30 hover:border-teal-400/50 hover:bg-teal-500/10"
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {startDate && endDate ? formatDateRange() : "Date Range"}
              </button>
            </>
          ) : showCustomDays ? (
            <div className="flex items-center gap-2 bg-black/50 border border-teal-500/30 rounded-lg px-3 py-1">
              <Input
                type="number"
                min="1"
                max="3650"
                placeholder="Days"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomDaysSubmit()}
                className="w-20 h-8 bg-transparent border-none text-teal-300 text-sm focus:ring-0 p-1"
                autoFocus
              />
              <button
                onClick={handleCustomDaysSubmit}
                disabled={!customDays || parseInt(customDays) <= 0}
                className="p-1 text-teal-400 hover:text-teal-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowCustomDays(false);
                  setCustomDays("");
                }}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/50 border border-teal-500/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">From:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                  className="w-36 h-8 bg-transparent border border-teal-500/30 text-teal-300 text-sm focus:ring-1 focus:ring-teal-400 rounded px-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">To:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="w-36 h-8 bg-transparent border border-teal-500/30 text-teal-300 text-sm focus:ring-1 focus:ring-teal-400 rounded px-2"
                />
              </div>
              <button
                onClick={handleDateRangeSubmit}
                disabled={!startDate || !endDate}
                className="p-1 text-teal-400 hover:text-teal-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setStartDate("");
                  setEndDate("");
                }}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {!isPresetRange && !showCustomDays && !showDatePicker && !startDate && (
          <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Showing data for the last {currentRange} days
          </div>
        )}
        {startDate && endDate && !showDatePicker && (
          <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
