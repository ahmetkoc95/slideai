"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Save,
  Download,
  Play,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Type,
  Image as ImageIcon,
  Square,
  Palette,
  Settings,
  Users,
  Undo,
  Redo,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage, LoadingOverlay } from "@/components/ui/loading";
import { SlidePreview } from "@/components/slides/SlidePreview";
import { SlideEditor } from "@/components/editor/SlideEditor";
import { SlideContent, SlideElement, TransitionType } from "@/types";

interface Slide {
  id: string;
  title: string;
  content: SlideContent;
  notes: string | null;
  backgroundUrl: string | null;
  backgroundColor: string | null;
  order: number;
  transition: string;
}

interface Presentation {
  id: string;
  title: string;
  description: string | null;
  theme: Record<string, string>;
  slides: Slide[];
}

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const presentationId = params.id as string;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch presentation
  useEffect(() => {
    if (session && presentationId) {
      fetchPresentation();
    }
  }, [session, presentationId]);

  const fetchPresentation = async () => {
    try {
      const response = await fetch(`/api/presentations/${presentationId}`);
      if (response.ok) {
        const data = await response.json();
        setPresentation(data);
      } else if (response.status === 404) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch presentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save
  const savePresentation = useCallback(async () => {
    if (!presentation) return;

    setIsSaving(true);
    try {
      // Save presentation metadata
      await fetch(`/api/presentations/${presentationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: presentation.title,
          theme: presentation.theme,
        }),
      });

      // Save slides
      await fetch(`/api/presentations/${presentationId}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: presentation.slides }),
      });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [presentation, presentationId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "s") {
          e.preventDefault();
          savePresentation();
        }
      }

      if (isPresentMode) {
        if (e.key === "Escape") {
          setIsPresentMode(false);
        } else if (e.key === "ArrowRight" || e.key === " ") {
          nextSlide();
        } else if (e.key === "ArrowLeft") {
          prevSlide();
        }
      } else {
        if (e.key === "Delete" && selectedElementId) {
          deleteSelectedElement();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentMode, selectedElementId, savePresentation]);

  const currentSlide = presentation?.slides[currentSlideIndex];

  const nextSlide = () => {
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex((i) => i + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((i) => i - 1);
    }
  };

  const addSlide = () => {
    if (!presentation) return;

    const newSlide: Slide = {
      id: `temp-${Date.now()}`,
      title: "New Slide",
      content: {
        elements: [
          {
            id: `element-${Date.now()}`,
            type: "text",
            content: "Click to edit",
            x: 10,
            y: 40,
            width: 80,
            height: 20,
            fontSize: 32,
            fontWeight: "normal",
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "center",
          },
        ],
      },
      notes: null,
      backgroundUrl: null,
      backgroundColor: presentation.theme?.primaryColor || "#3b82f6",
      order: presentation.slides.length,
      transition: "slide",
    };

    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide],
    });
    setCurrentSlideIndex(presentation.slides.length);
  };

  const deleteSlide = (index: number) => {
    if (!presentation || presentation.slides.length <= 1) return;

    const newSlides = presentation.slides.filter((_, i) => i !== index);
    setPresentation({
      ...presentation,
      slides: newSlides.map((s, i) => ({ ...s, order: i })),
    });

    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const duplicateSlide = (index: number) => {
    if (!presentation) return;

    const slideToDuplicate = presentation.slides[index];
    const newSlide: Slide = {
      ...slideToDuplicate,
      id: `temp-${Date.now()}`,
      title: `${slideToDuplicate.title} (Copy)`,
      content: JSON.parse(JSON.stringify(slideToDuplicate.content)),
      order: index + 1,
    };

    const newSlides = [
      ...presentation.slides.slice(0, index + 1),
      newSlide,
      ...presentation.slides.slice(index + 1).map((s) => ({
        ...s,
        order: s.order + 1,
      })),
    ];

    setPresentation({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(index + 1);
  };

  const updateSlideContent = (content: SlideContent) => {
    if (!presentation || !currentSlide) return;

    const newSlides = presentation.slides.map((s, i) =>
      i === currentSlideIndex ? { ...s, content } : s
    );
    setPresentation({ ...presentation, slides: newSlides });
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    if (!presentation || !currentSlide) return;

    const newElements = currentSlide.content.elements.map((el) =>
      el.id === elementId ? { ...el, ...updates } : el
    ) as SlideElement[];
    updateSlideContent({ elements: newElements });
  };

  const deleteSelectedElement = () => {
    if (!presentation || !currentSlide || !selectedElementId) return;

    const newElements = currentSlide.content.elements.filter(
      (el) => el.id !== selectedElementId
    );
    updateSlideContent({ elements: newElements });
    setSelectedElementId(null);
  };

  const addTextElement = () => {
    if (!currentSlide) return;

    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type: "text",
      content: "New text",
      x: 10,
      y: 50,
      width: 30,
      height: 10,
      fontSize: 24,
      fontWeight: "normal",
      fontFamily: "Inter",
      color: "#ffffff",
      textAlign: "left",
    };

    updateSlideContent({
      elements: [...currentSlide.content.elements, newElement],
    });
    setSelectedElementId(newElement.id);
  };

  const handleExport = async () => {
    // Export to PPTX
    try {
      const response = await fetch(`/api/presentations/${presentationId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "pptx" }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${presentation?.title || "presentation"}.pptx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return <LoadingPage />;
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  if (!presentation) {
    return <LoadingPage />;
  }

  // Presentation Mode
  if (isPresentMode) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentSlide && (
              <SlidePreview
                slide={currentSlide}
                isFullscreen
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-white text-sm">
            {currentSlideIndex + 1} / {presentation.slides.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlideIndex === presentation.slides.length - 1}
            className="text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <button
          onClick={() => setIsPresentMode(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-sm"
        >
          Press ESC to exit
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {isSaving && <LoadingOverlay message="Saving..." />}

      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Input
            value={presentation.title}
            onChange={(e) =>
              setPresentation({ ...presentation, title: e.target.value })
            }
            className="w-64 font-medium border-none bg-transparent focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Redo className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <Button variant="ghost" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={savePresentation}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setIsPresentMode(true)}
          >
            <Play className="h-4 w-4" />
            Present
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Slide Thumbnails */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-all overflow-hidden shrink-0`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Slides</h3>
              <Button variant="ghost" size="icon" onClick={addSlide}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {presentation.slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                    index === currentSlideIndex
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="aspect-video bg-gray-200">
                    <SlidePreview slide={slide} isThumbnail />
                  </div>
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSlide(index);
                      }}
                      className="bg-black/50 text-white p-1 rounded hover:bg-black/70"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="bg-red-500/80 text-white p-1 rounded hover:bg-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-12 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 flex items-center gap-2 px-4 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={addTextElement}
            >
              <Type className="h-4 w-4" />
              Text
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Image
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Square className="h-4 w-4" />
              Shape
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <Button variant="ghost" size="sm" className="gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            {currentSlide && (
              <SlideEditor
                slide={currentSlide}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={updateElement}
                onUpdateContent={updateSlideContent}
              />
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="h-12 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 flex items-center justify-center gap-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-500">
              Slide {currentSlideIndex + 1} of {presentation.slides.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
