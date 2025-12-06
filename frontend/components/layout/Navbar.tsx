"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { removeToken, getUser, type User } from "@/lib/auth";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load user data on mount and whenever storage changes
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        let userData: User | null = null;
        
        if (userStr) {
          try {
            userData = JSON.parse(userStr);
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
        
        setUser(userData);
      } catch (error) {
        console.error("Error in loadUser:", error);
      }
    };

    // Initial load
    loadUser();

    // Listen for custom event (when user logs in)
    const handleUserUpdate = () => {
      setTimeout(loadUser, 100);
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-black via-teal-900/30 to-black sticky top-0 z-10 border-b border-teal-500/30 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-gray-400 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
          <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-silver-gradient">Nexus Analytics</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative user-dropdown">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-400/50 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-gray-400 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 font-bold text-black text-sm">
                {getInitials(user.name)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-teal-300">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-black/95 border border-teal-500/30 rounded-xl shadow-2xl shadow-teal-500/20 backdrop-blur-xl overflow-hidden z-50">
                <div className="p-4 border-b border-teal-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-gray-400 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 font-bold text-black">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-teal-300">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-teal-500/20 backdrop-blur-sm border-teal-400/50 text-teal-300 hover:bg-teal-500/30 hover:text-white hover:border-teal-300 transition-all"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
