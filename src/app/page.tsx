"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Zap,
  Users,
  Download,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">SlideAI</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-300 transition hover:text-white"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 ring-1 ring-blue-500/20">
              AI-Powered Presentations
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Transform Your Ideas Into{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Stunning Slides
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto"
          >
            Just add your raw ideas, data, and content. Our AI analyzes, enhances,
            and transforms everything into professionally designed presentations
            with beautiful graphics and animations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={session ? "/dashboard" : "/auth/register"}>
              <Button size="lg" className="gap-2 text-lg px-8">
                Start Creating <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 text-lg px-8 border-white/20 text-white hover:bg-white/10"
            >
              <Play className="h-5 w-5" /> Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Preview Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 ring-1 ring-white/10">
            <div className="h-full rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
              <div className="text-center">
                <Layers className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Interactive Preview Coming Soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Powerful features to create amazing presentations in minutes
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl bg-slate-800/50 p-6 ring-1 ring-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-800/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Three simple steps to create stunning presentations
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Create Amazing Presentations?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Join thousands of users who are creating stunning slides with AI
          </p>
          <Link href={session ? "/dashboard" : "/auth/register"}>
            <Button size="lg" className="mt-8 gap-2 text-lg px-8">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-white">SlideAI</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SlideAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Content",
    description:
      "Our AI analyzes your raw input and transforms it into polished, professional content.",
  },
  {
    icon: Layers,
    title: "Beautiful Templates",
    description:
      "Choose from dozens of professionally designed templates or let AI pick the best one.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description:
      "Generate complete presentations in seconds, not hours. Focus on your ideas, not design.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Work together with your team in real-time. See changes as they happen.",
  },
  {
    icon: Download,
    title: "Export to PowerPoint",
    description:
      "Download your presentations as PPTX files for easy sharing and editing.",
  },
  {
    icon: Layers,
    title: "Custom Animations",
    description:
      "Add beautiful animations and transitions to make your slides come alive.",
  },
];

const steps = [
  {
    title: "Add Your Content",
    description:
      "Type or paste your ideas, upload images, add links, or import data from any source.",
  },
  {
    title: "AI Enhancement",
    description:
      "Our AI analyzes your content, structures it logically, and generates stunning visuals.",
  },
  {
    title: "Customize & Export",
    description:
      "Fine-tune your slides, collaborate with others, and export to your preferred format.",
  },
];
