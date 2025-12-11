"use client"

import { useState } from "react"
import { Check, Copy, TrendingUp, Zap, BookOpen, Lock } from "lucide-react"

export default function StyleGuidePage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(label)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const colors = [
    {
      name: "Background",
      value: "#0B1E32",
      variable: "background",
      description: "Primary background color - deep navy blue",
      usage: "Page backgrounds, main containers"
    },
    {
      name: "Foreground",
      value: "#F0F0F0",
      variable: "foreground",
      description: "Primary text color - light gray",
      usage: "Body text, headings"
    },
    {
      name: "LED Green",
      value: "#00FF88",
      variable: "ledGreen",
      description: "Accent color for positive states and CTAs",
      usage: "Buttons, links, positive indicators, glows"
    },
    {
      name: "LED Red",
      value: "#FF3366",
      variable: "ledRed",
      description: "Accent color for negative states",
      usage: "Error states, negative indicators"
    },
    {
      name: "Card Background",
      value: "#1a3a52",
      variable: "N/A",
      description: "Secondary background for cards and borders",
      usage: "Cards, borders, elevated surfaces"
    },
    {
      name: "Gray 300",
      value: "#D1D5DB",
      variable: "gray-300",
      description: "Secondary text color",
      usage: "Descriptions, supporting text"
    },
    {
      name: "Gray 400",
      value: "#9CA3AF",
      variable: "gray-400",
      description: "Tertiary text color",
      usage: "Metadata, captions"
    }
  ]

  const typography = [
    {
      family: "Inter",
      weights: ["400", "500", "600", "700"],
      usage: "Primary font for all UI text, headings, and body copy",
      variable: "font-sans",
      example: "The quick brown fox jumps over the lazy dog"
    },
    {
      family: "Space Mono",
      weights: ["400", "700"],
      usage: "Monospace font for technical text, tickers, and LED-style displays",
      variable: "font-mono",
      example: "AAPL $150.25 +2.5%"
    }
  ]

  const spacing = [
    { name: "xs", value: "0.25rem", pixels: "4px" },
    { name: "sm", value: "0.5rem", pixels: "8px" },
    { name: "md", value: "1rem", pixels: "16px" },
    { name: "lg", value: "1.5rem", pixels: "24px" },
    { name: "xl", value: "2rem", pixels: "32px" },
    { name: "2xl", value: "3rem", pixels: "48px" },
    { name: "3xl", value: "4rem", pixels: "64px" }
  ]

  const animations = [
    {
      name: "scroll",
      duration: "30s",
      description: "Horizontal scrolling animation for ticker tape",
      usage: "Stock ticker carousel"
    },
    {
      name: "ping",
      duration: "1s",
      description: "Expanding ring pulse effect",
      usage: "Live indicators, attention grabbers"
    },
    {
      name: "pulse",
      duration: "2s",
      description: "Opacity fade in/out",
      usage: "Loading states, breathing effects"
    },
    {
      name: "spin",
      duration: "1s",
      description: "360° rotation",
      usage: "Loading spinners"
    },
    {
      name: "border-beam",
      duration: "calc(var(--duration)*1s)",
      description: "Animated border effect",
      usage: "Premium card borders"
    }
  ]

  return (
    <div className="min-h-screen bg-[#0B1E32] text-foreground">
      {/* Header */}
      <header className="border-b border-[#1a3a52] bg-[#0B1E32]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Daily Ticker Style Guide</h1>
              <p className="text-gray-400">Design system documentation for developers and designers</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-sm text-[#00ff88]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
              </span>
              v1.0.0
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Table of Contents */}
        <nav className="mb-16 p-6 bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Table of Contents</h2>
          <ul className="grid md:grid-cols-3 gap-3 text-gray-300">
            <li><a href="#colors" className="hover:text-[#00ff88] transition-colors">Colors</a></li>
            <li><a href="#typography" className="hover:text-[#00ff88] transition-colors">Typography</a></li>
            <li><a href="#spacing" className="hover:text-[#00ff88] transition-colors">Spacing</a></li>
            <li><a href="#buttons" className="hover:text-[#00ff88] transition-colors">Buttons</a></li>
            <li><a href="#forms" className="hover:text-[#00ff88] transition-colors">Forms</a></li>
            <li><a href="#cards" className="hover:text-[#00ff88] transition-colors">Cards</a></li>
            <li><a href="#badges" className="hover:text-[#00ff88] transition-colors">Badges</a></li>
            <li><a href="#animations" className="hover:text-[#00ff88] transition-colors">Animations</a></li>
            <li><a href="#effects" className="hover:text-[#00ff88] transition-colors">Effects</a></li>
          </ul>
        </nav>

        {/* Colors Section */}
        <section id="colors" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Colors</h2>
          <p className="text-gray-300 mb-8">
            Daily Ticker uses a carefully selected color palette optimized for financial data visualization
            and readability in dark mode interfaces.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {colors.map((color) => (
              <div
                key={color.name}
                className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{color.name}</h3>
                    <p className="text-sm text-gray-400">{color.description}</p>
                  </div>
                  <div
                    className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg flex-shrink-0"
                    style={{ backgroundColor: color.value }}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Hex:</span>
                    <button
                      onClick={() => copyToClipboard(color.value, color.name)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1E32] rounded-md hover:bg-[#0B1E32]/80 transition-colors font-mono text-white"
                    >
                      {color.value}
                      {copiedColor === color.name ? (
                        <Check className="h-4 w-4 text-[#00ff88]" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {color.variable !== "N/A" && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tailwind:</span>
                      <code className="px-3 py-1.5 bg-[#0B1E32] rounded-md font-mono text-white">
                        {color.variable}
                      </code>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#1a3a52]">
                    <span className="text-gray-400 block mb-1">Usage:</span>
                    <span className="text-gray-300 text-xs">{color.usage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Typography</h2>
          <p className="text-gray-300 mb-8">
            Our typography system uses two high-quality typefaces for optimal readability and brand consistency.
          </p>
          <div className="space-y-6">
            {typography.map((font) => (
              <div
                key={font.family}
                className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{font.family}</h3>
                  <p className="text-gray-400 mb-2">{font.usage}</p>
                  <code className="text-sm px-3 py-1.5 bg-[#0B1E32] rounded-md font-mono text-[#00ff88]">
                    {font.variable}
                  </code>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-400 block mb-2">Available Weights:</span>
                    <div className="flex gap-2 flex-wrap">
                      {font.weights.map((weight) => (
                        <span
                          key={weight}
                          className="px-3 py-1.5 bg-[#0B1E32] rounded-md text-white font-mono text-sm"
                        >
                          {weight}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#1a3a52]">
                    <span className="text-sm text-gray-400 block mb-3">Example:</span>
                    <p
                      className={`text-2xl ${
                        font.family === "Space Mono" ? "font-mono" : "font-sans"
                      } text-white`}
                    >
                      {font.example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Text Scale Examples */}
          <div className="mt-8 bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Text Scale</h3>
            <div className="space-y-4">
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-7xl font-bold text-white mb-2">Heading 1</p>
                <code className="text-sm text-gray-400">text-7xl font-bold</code>
              </div>
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-5xl font-bold text-white mb-2">Heading 2</p>
                <code className="text-sm text-gray-400">text-5xl font-bold</code>
              </div>
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-3xl font-bold text-white mb-2">Heading 3</p>
                <code className="text-sm text-gray-400">text-3xl font-bold</code>
              </div>
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-2xl font-bold text-white mb-2">Heading 4</p>
                <code className="text-sm text-gray-400">text-2xl font-bold</code>
              </div>
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-xl font-semibold text-white mb-2">Heading 5</p>
                <code className="text-sm text-gray-400">text-xl font-semibold</code>
              </div>
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-lg text-gray-300 mb-2">Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <code className="text-sm text-gray-400">text-lg text-gray-300</code>
              </div>
              <div className="border-b border-[#1a3a52] pb-4">
                <p className="text-base text-gray-300 mb-2">Body Regular - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <code className="text-sm text-gray-400">text-base text-gray-300</code>
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-400 mb-2">Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <code className="text-sm text-gray-400">text-sm text-gray-400</code>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section id="spacing" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Spacing</h2>
          <p className="text-gray-300 mb-8">
            Consistent spacing creates visual hierarchy and improves readability. We use Tailwind's default spacing scale.
          </p>
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
            <div className="space-y-4">
              {spacing.map((space) => (
                <div key={space.name} className="flex items-center gap-6">
                  <div className="w-20 text-gray-400 text-sm font-mono">{space.name}</div>
                  <div className="flex-1 flex items-center gap-4">
                    <div
                      className="h-8 bg-[#00ff88]/30 border border-[#00ff88]/50 rounded"
                      style={{ width: space.value }}
                    />
                    <span className="text-gray-300 font-mono text-sm">{space.value}</span>
                    <span className="text-gray-400 text-sm">({space.pixels})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section id="buttons" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Buttons</h2>
          <p className="text-gray-300 mb-8">
            Button components for various actions and states across the application.
          </p>
          <div className="space-y-8">
            {/* Primary Buttons */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Primary (CTA)</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <button className="px-6 py-3 bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77] transition-colors shadow-lg shadow-[#00ff88]/30">
                  Get Started
                </button>
                <button className="px-6 py-2 bg-[#00ff88] text-[#0B1E32] font-semibold rounded-lg hover:bg-[#00dd77] transition-colors">
                  Medium
                </button>
                <button className="px-4 py-1.5 bg-[#00ff88] text-[#0B1E32] font-semibold rounded-md hover:bg-[#00dd77] transition-colors text-sm">
                  Small
                </button>
              </div>
              <code className="text-sm text-gray-400 block">
                bg-[#00ff88] text-[#0B1E32] font-bold rounded-lg hover:bg-[#00dd77]
              </code>
            </div>

            {/* Secondary Buttons */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Secondary</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <button className="px-6 py-3 bg-[#1a3a52] text-white font-semibold rounded-lg hover:bg-[#244a62] transition-colors border border-[#00ff88]/20">
                  Learn More
                </button>
                <button className="px-6 py-2 bg-[#1a3a52] text-white font-semibold rounded-lg hover:bg-[#244a62] transition-colors border border-[#00ff88]/20">
                  Medium
                </button>
                <button className="px-4 py-1.5 bg-[#1a3a52] text-white font-semibold rounded-md hover:bg-[#244a62] transition-colors border border-[#00ff88]/20 text-sm">
                  Small
                </button>
              </div>
              <code className="text-sm text-gray-400 block">
                bg-[#1a3a52] text-white font-semibold rounded-lg hover:bg-[#244a62] border border-[#00ff88]/20
              </code>
            </div>

            {/* Outline Buttons */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Outline</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <button className="px-6 py-3 bg-transparent text-[#00ff88] font-semibold rounded-lg border-2 border-[#00ff88] hover:bg-[#00ff88]/10 transition-colors">
                  Outline Large
                </button>
                <button className="px-6 py-2 bg-transparent text-[#00ff88] font-semibold rounded-lg border-2 border-[#00ff88] hover:bg-[#00ff88]/10 transition-colors">
                  Outline Medium
                </button>
              </div>
              <code className="text-sm text-gray-400 block">
                bg-transparent text-[#00ff88] border-2 border-[#00ff88] hover:bg-[#00ff88]/10
              </code>
            </div>

            {/* Ghost Buttons */}
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Ghost</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <button className="px-6 py-3 bg-transparent text-gray-300 font-semibold rounded-lg hover:bg-[#1a3a52] transition-colors">
                  Ghost Button
                </button>
              </div>
              <code className="text-sm text-gray-400 block">
                bg-transparent text-gray-300 hover:bg-[#1a3a52]
              </code>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section id="forms" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Forms</h2>
          <p className="text-gray-300 mb-8">Form elements for user input with consistent styling.</p>
          <div className="space-y-6">
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Text Input</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-[#0B1E32] border border-[#1a3a52] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-colors"
                  />
                </div>
                <code className="text-sm text-gray-400 block">
                  bg-[#0B1E32] border border-[#1a3a52] focus:ring-2 focus:ring-[#00ff88]/50
                </code>
              </div>
            </div>

            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Toggle Switch</h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="relative inline-flex h-7 w-14 items-center rounded-full bg-[#00ff88] transition-colors"
                >
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-8" />
                </button>
                <span className="text-gray-300">Enabled</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  className="relative inline-flex h-7 w-14 items-center rounded-full bg-[#1a3a52] transition-colors"
                >
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
                <span className="text-gray-300">Disabled</span>
              </div>
              <code className="text-sm text-gray-400 block mt-4">
                bg-[#00ff88] (active) | bg-[#1a3a52] (inactive)
              </code>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Cards</h2>
          <p className="text-gray-300 mb-8">Card components for grouping related content.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-bold text-white">Standard Card</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                This is a standard card component used throughout the application for grouping related information.
              </p>
              <code className="text-xs text-gray-400 block pt-2">
                bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6
              </code>
            </div>

            <div className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-lg p-6 space-y-3 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-[#00ff88] text-[#0B1E32] text-xs font-bold rounded-full">
                  Featured
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Premium Card</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Featured card with gradient background and accent border for highlighting important content.
              </p>
              <code className="text-xs text-gray-400 block pt-2">
                bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40
              </code>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section id="badges" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Badges</h2>
          <p className="text-gray-300 mb-8">Badge components for status indicators and labels.</p>
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-sm text-[#00ff88]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                </span>
                Live
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-md text-yellow-400 text-sm">
                <Lock className="h-3 w-3" />
                <span className="font-semibold">Pro</span>
              </span>

              <span className="inline-flex items-center px-4 py-2 bg-[#00ff88] text-[#0B1E32] text-sm font-bold rounded-full">
                Most Popular
              </span>

              <span className="inline-flex items-center px-4 py-2 bg-[#1a3a52] text-gray-300 text-sm font-semibold rounded-full border border-[#00ff88]/20">
                New
              </span>

              <span className="inline-flex items-center px-3 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-md text-sm font-semibold text-[#00ff88]">
                Save 20%
              </span>
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section id="animations" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Animations</h2>
          <p className="text-gray-300 mb-8">Pre-configured animations for interactive elements.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {animations.map((animation) => (
              <div
                key={animation.name}
                className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{animation.name}</h3>
                    <p className="text-sm text-gray-400">{animation.description}</p>
                  </div>
                  {animation.name === 'ping' && (
                    <div className="relative flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-[#00ff88]"></span>
                    </div>
                  )}
                  {animation.name === 'pulse' && (
                    <div className="h-6 w-6 rounded-full bg-[#00ff88] animate-pulse"></div>
                  )}
                  {animation.name === 'spin' && (
                    <div className="h-6 w-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <code className="text-[#00ff88]">{animation.duration}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Usage:</span>
                    <span className="text-gray-300 text-xs">{animation.usage}</span>
                  </div>
                  <div className="pt-2 border-t border-[#1a3a52]">
                    <code className="text-xs text-gray-400">animate-{animation.name}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Effects Section */}
        <section id="effects" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Effects</h2>
          <p className="text-gray-300 mb-8">Special visual effects and utilities.</p>
          <div className="space-y-6">
            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">LED Text Glow</h3>
              <p className="text-3xl font-mono text-[#00ff88] led-text mb-4">
                AAPL $150.25 +2.5%
              </p>
              <code className="text-sm text-gray-400 block">
                text-[#00ff88] font-mono led-text (text-shadow: 0 0 10px currentColor)
              </code>
            </div>

            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Box Glow</h3>
              <div className="inline-block px-6 py-3 bg-[#0B1E32] border border-[#00ff88]/50 rounded-lg ticker-glow">
                <span className="text-[#00ff88] font-mono">Glowing Container</span>
              </div>
              <code className="text-sm text-gray-400 block mt-4">
                ticker-glow (box-shadow: 0 0 20px rgba(0, 255, 136, 0.3))
              </code>
            </div>

            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Gradient Text</h3>
              <p className="text-4xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00dd77] bg-clip-text text-transparent mb-4">
                Daily Ticker Pro
              </p>
              <code className="text-sm text-gray-400 block">
                bg-gradient-to-r from-[#00ff88] to-[#00dd77] bg-clip-text text-transparent
              </code>
            </div>

            <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Backdrop Blur</h3>
              <div className="relative h-32 bg-gradient-to-r from-[#00ff88]/20 to-[#00dd77]/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1E32]/80 backdrop-blur-sm">
                  <span className="text-white font-semibold">Blurred Background</span>
                </div>
              </div>
              <code className="text-sm text-gray-400 block mt-4">
                bg-[#0B1E32]/80 backdrop-blur-sm
              </code>
            </div>
          </div>
        </section>

        {/* Component Icons */}
        <section id="icons" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Icons</h2>
          <p className="text-gray-300 mb-8">
            We use Lucide React icons throughout the application. Common icons include:
          </p>
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="h-8 w-8 text-[#00ff88]" />
                <span className="text-sm text-gray-400">TrendingUp</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-8 w-8 text-[#00ff88]" />
                <span className="text-sm text-gray-400">Zap</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-8 w-8 text-[#00ff88]" />
                <span className="text-sm text-gray-400">BookOpen</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Lock className="h-8 w-8 text-[#00ff88]" />
                <span className="text-sm text-gray-400">Lock</span>
              </div>
            </div>
            <code className="text-sm text-gray-400 block mt-6">
              import {`{ TrendingUp, Zap, BookOpen, Lock }`} from &quot;lucide-react&quot;
            </code>
          </div>
        </section>

        {/* Responsive Breakpoints */}
        <section id="breakpoints" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Responsive Breakpoints</h2>
          <p className="text-gray-300 mb-8">
            Tailwind's default breakpoints for responsive design.
          </p>
          <div className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-[#00ff88]">sm</code>
                <span className="text-gray-400">640px and up</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-[#00ff88]">md</code>
                <span className="text-gray-400">768px and up</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-[#00ff88]">lg</code>
                <span className="text-gray-400">1024px and up</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-[#00ff88]">xl</code>
                <span className="text-gray-400">1280px and up</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-[#00ff88]">2xl</code>
                <span className="text-gray-400">1536px and up</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a3a52] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Daily Ticker Style Guide &middot; Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  )
}
