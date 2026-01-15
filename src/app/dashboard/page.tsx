"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Clock,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";

interface Presentation {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  updatedAt: string;
  slidesCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPresentations();
    }
  }, [session]);

  const fetchPresentations = async () => {
    try {
      const response = await fetch("/api/presentations");
      if (response.ok) {
        const data = await response.json();
        setPresentations(data);
      }
    } catch (error) {
      console.error("Failed to fetch presentations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    router.push("/editor/new");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this presentation?")) return;

    try {
      const response = await fetch(`/api/presentations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPresentations(presentations.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete presentation:", error);
    }
    setMenuOpen(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/presentations/${id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        fetchPresentations();
      }
    } catch (error) {
      console.error("Failed to duplicate presentation:", error);
    }
    setMenuOpen(null);
  };

  const filteredPresentations = presentations.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return <LoadingPage />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">SlideAI</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setMenuOpen(menuOpen === "user" ? null : "user")}
                className="flex items-center gap-2 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                    {session.user?.name?.[0] || session.user?.email?.[0]}
                  </div>
                )}
              </button>

              {menuOpen === "user" && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium">{session.user?.name}</p>
                    <p className="text-sm text-gray-500">{session.user?.email}</p>
                  </div>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Actions Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Presentations</h1>
            <p className="text-gray-500">
              Create and manage your AI-powered presentations
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search presentations..."
                className="w-64 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Presentation
            </Button>
          </div>
        </div>

        {/* Presentations Grid */}
        {filteredPresentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 dark:border-gray-700">
            <Sparkles className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No presentations yet</h3>
            <p className="mt-2 text-gray-500">
              Create your first AI-powered presentation
            </p>
            <Button onClick={handleCreateNew} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create Presentation
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPresentations.map((presentation, index) => (
              <motion.div
                key={presentation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden">
                  <Link href={`/editor/${presentation.id}`}>
                    <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative">
                      {presentation.thumbnail ? (
                        <img
                          src={presentation.thumbnail}
                          alt={presentation.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Sparkles className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {presentation.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(presentation.updatedAt).toLocaleDateString()}
                          <span className="text-gray-300">•</span>
                          {presentation.slidesCount} slides
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === presentation.id ? null : presentation.id
                            )
                          }
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>

                        {menuOpen === presentation.id && (
                          <div className="absolute right-0 mt-1 w-40 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10 z-10">
                            <Link
                              href={`/editor/${presentation.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDuplicate(presentation.id)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDelete(presentation.id)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
