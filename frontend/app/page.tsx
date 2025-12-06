"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await authApi.signup(email, password, name);
        // Auto-login after signup
        const loginResponse = await authApi.login(email, password);
        setToken(loginResponse.token);
        if (loginResponse.user) {
          setUser(loginResponse.user);
        }
        router.push("/dashboard");
      } else {
        const response = await authApi.login(email, password);
        setToken(response.token);
        if (response.user) {
          setUser(response.user);
        }
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center dark-bg relative overflow-hidden">
      {/* Subtle Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-float" style={{ top: '60%', right: '10%', animationDelay: '3s' }}></div>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="relative glass-effect shadow-2xl p-10 rounded-3xl w-[420px] space-y-6 border border-teal-500/30"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-400 via-teal-500 to-gray-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-silver-gradient">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-300">
            {isSignup ? "Start your analytics journey" : "Sign in to your dashboard"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2 backdrop-blur-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {isSignup && (
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-black/50 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
          />
        )}

        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-black/50 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-black/50 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
        />

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 hover:from-teal-500 hover:via-teal-400 hover:to-gray-300 text-black font-bold py-6 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-400/50 transition-all duration-200" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            isSignup ? "Create Account" : "Sign In"
          )}
        </Button>

        <div className="text-center text-sm pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            className="text-teal-400 hover:text-gray-300 font-medium transition-colors"
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </form>
    </div>
  );
}
