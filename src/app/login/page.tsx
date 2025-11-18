// src/app/login/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import gsap from 'gsap';
import { spaceGrotesk } from '@/utils/fonts';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background pattern fade in
      if (patternRef.current) {
        gsap.fromTo(
          patternRef.current,
          { opacity: 0 },
          { opacity: 0.03, duration: 1.5, ease: 'power1.out' }
        );
      }

      // Title slides up with fade
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
      }

      // Subtitle follows
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: 0.15, ease: 'power2.out' }
        );
      }

      // Form container subtle scale + fade
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { scale: 0.96, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, delay: 0.3, ease: 'power2.out' }
        );
      }

      // Inputs stagger in
      inputRefs.current.forEach((input, i) => {
        if (input) {
          gsap.fromTo(
            input,
            { x: -10, opacity: 0 },
            { 
              x: 0, 
              opacity: 1, 
              duration: 0.5, 
              delay: 0.5 + (i * 0.1),
              ease: 'power2.out' 
            }
          );
        }
      });

      // Button last
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.8, ease: 'power2.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { height: 0, opacity: 0, marginBottom: 0 },
        { 
          height: 'auto',
          opacity: 1, 
          marginBottom: 24,
          duration: 0.4,
          ease: 'power2.out'
        }
      );
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      
      // Smooth fade out
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => router.push('/')
        });
      }
    } catch (err) {
      // Subtle shake on error
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: -8,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
          ease: 'power2.inOut'
        });
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Subtle grid pattern background */}
      <div 
        ref={patternRef}
        className="absolute inset-0 opacity-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />

      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            ref={titleRef}
            className={`text-5xl font-bold text-white mb-3 tracking-tight ${spaceGrotesk.className}`}
          >
            vault
          </h1>
          <p 
            ref={subtitleRef}
            className="text-[#666] text-sm tracking-wide"
          >
            SECURE ACCESS PORTAL
          </p>
        </div>

        {/* Form */}
        <div 
          ref={formRef}
          className="relative"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div 
              ref={(el) => { inputRefs.current[0] = el; }}
              className="group"
            >
              <label 
                htmlFor="email" 
                className="block text-[#888] text-xs font-medium mb-2 tracking-wide uppercase"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#222] text-white text-sm focus:outline-none focus:border-[#444] transition-colors duration-300 placeholder:text-[#333]"
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>

            {/* Password */}
            <div 
              ref={(el) => { inputRefs.current[1] = el; }}
              className="group"
            >
              <label 
                htmlFor="password" 
                className="block text-[#888] text-xs font-medium mb-2 tracking-wide uppercase"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#222] text-white text-sm focus:outline-none focus:border-[#444] transition-colors duration-300 placeholder:text-[#333]"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div 
                ref={errorRef}
                className="overflow-hidden"
              >
                <div className="border-l-2 border-[#ff3333] bg-[#ff3333]/5 px-4 py-3">
                  <p className="text-[#ff6666] text-xs font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 bg-white text-black text-sm font-semibold tracking-wide uppercase overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-300"
            >
              <span className="relative z-10">
                {loading ? 'AUTHENTICATING...' : 'ACCESS VAULT'}
              </span>
              <div className="absolute inset-0 bg-[#ddd] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          </form>

          {/* Bottom text */}
          <p className="text-center text-[#444] text-[10px] mt-8 tracking-widest uppercase">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
