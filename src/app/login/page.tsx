'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import gsap from 'gsap';
import { spaceGrotesk } from '@/utils/fonts';

// HARCODED EMAIL FOR SINGLE USER MODE
const USER_EMAIL = 'heysreelal@gmail.com';

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);

  // Scramble Text Effect Util
  const scrambleText = (element: HTMLElement, finalText: string, duration: number = 1) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    const tl = gsap.timeline();

    tl.to(element, {
      duration: duration,
      onUpdate: function () {
        const progress = this.progress();
        const scrambled = finalText.split('').map((char, index) => {
          if (progress > (index / finalText.length)) {
            return char;
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        element.innerText = scrambled;
      },
      onComplete: () => {
        element.innerText = finalText;
      }
    });

    return tl;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Matrix/Cyber Pattern Background
      if (patternRef.current) {
        gsap.fromTo(
          patternRef.current,
          { opacity: 0, scale: 1.1 },
          { opacity: 0.05, scale: 1, duration: 2, ease: 'power2.out' }
        );
      }

      // 2. Title Scramble
      if (titleRef.current) {
        gsap.set(titleRef.current, { opacity: 1 });
        scrambleText(titleRef.current, 'VAULT', 1.5);
      }

      // 3. Subtitle Fade In
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 10, opacity: 0, letterSpacing: '0.1em' },
          { y: 0, opacity: 0.6, letterSpacing: '0.3em', duration: 1, delay: 0.8, ease: 'power2.out' }
        );
      }

      // 4. Form Container Reveal
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'back.out(1.7)' }
        );
      }

      // 5. Input Reveal
      if (inputRef.current) {
        gsap.fromTo(
          inputRef.current,
          { overflow: 'hidden', width: 0, opacity: 0 },
          { width: '100%', opacity: 1, duration: 0.8, delay: 1.0, ease: 'power3.inOut' }
        );
      }

      // 6. Button Reveal
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, delay: 1.4, ease: 'back.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Error Animation
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { height: 0, opacity: 0, marginTop: 0 },
        {
          height: 'auto',
          opacity: 1,
          marginTop: 20,
          duration: 0.4,
          ease: 'power2.out'
        }
      );

      // Shake form on error
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: -10,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          ease: 'power2.inOut'
        });
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(USER_EMAIL, passphrase);

      // Success Exit Animation
      const tl = gsap.timeline({
        onComplete: () => router.push('/')
      });

      // Shrink and fade everything
      tl.to(formRef.current, { scale: 0.9, opacity: 0, duration: 0.3 })
        .to([titleRef.current, subtitleRef.current], { y: -20, opacity: 0, duration: 0.3 }, "<")
        .to(patternRef.current, { opacity: 0, duration: 0.5 }, "<");

    } catch (err) {
      // Error is handled by useEffect
      setPassphrase(''); // Clear wrong passphrase
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Dynamic Cyber Pattern */}
      <div
        ref={patternRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 100, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 100, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />

      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/[0.03] rounded-full blur-[100px]" />

      <div className="relative w-full max-w-sm z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            ref={titleRef}
            className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2 tracking-tighter ${spaceGrotesk.className}`}
            style={{ fontFamily: 'monospace' }} // Fallback/Style choice
          >
            VAULT
          </h1>
          <p
            ref={subtitleRef}
            className="text-green-500/60 text-[10px] tracking-[0.3em] font-mono uppercase"
          >
            Restricted Access
          </p>
        </div>

        {/* Form */}
        <div
          ref={formRef}
          className="w-full relative"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Secret Passphrase Input */}
            <div
              ref={inputRef}
              className="relative group w-full"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-white/10 to-green-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>

              <input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="relative block w-full px-4 py-4 bg-[#0a0a0a] border border-[#222] rounded-lg text-center text-white text-lg tracking-[0.5em] focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all duration-300 placeholder:text-[#222] placeholder:tracking-normal placeholder:text-sm"
                placeholder="ENTER SECRET PHRASE"
                autoComplete="off"
                autoFocus
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                ref={errorRef}
                className="overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-2 text-center">
                  <p className="text-red-400 text-xs font-mono">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              className="w-full group relative px-6 py-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 w-0 bg-white/5 transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
              <span className="relative text-xs font-mono tracking-widest text-gray-400 group-hover:text-white transition-colors">
                {loading ? 'DECRYPTING...' : 'INITIATE_SEQUENCE'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
