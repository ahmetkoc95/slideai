"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Loader2,
  Wand2,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { useDropzone } from "react-dropzone";

export default function NewPresentationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputData, setInputData] = useState({
    text: "",
    images: [] as string[],
    links: [] as string[],
  });
  const [newLink, setNewLink] = useState("");
  const [slideCount, setSlideCount] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    onDrop: async (acceptedFiles) => {
      const base64Images = await Promise.all(
        acceptedFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      setInputData((prev) => ({
        ...prev,
        images: [...prev.images, ...base64Images],
      }));
    },
  });

  const addLink = () => {
    if (newLink && !inputData.links.includes(newLink)) {
      setInputData((prev) => ({
        ...prev,
        links: [...prev.links, newLink],
      }));
      setNewLink("");
    }
  };

  const removeLink = (link: string) => {
    setInputData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l !== link),
    }));
  };

  const removeImage = (index: number) => {
    setInputData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    if (!inputData.text && !inputData.images.length && !inputData.links.length) {
      setError("Please provide some content to generate slides from.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // First create a new presentation
      const createResponse = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Presentation",
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create presentation");
      }

      const presentation = await createResponse.json();

      // Then generate slides with AI
      const generateResponse = await fetch("/api/ai/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentationId: presentation.id,
          userInput: inputData,
          slideCount,
        }),
      });

      if (!generateResponse.ok) {
        throw new Error("Failed to generate slides");
      }

      // Redirect to editor
      router.push(`/editor/${presentation.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate presentation. Please try again.");
      setIsGenerating(false);
    }
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <span className="font-bold">SlideAI</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold">Create New Presentation</h1>
          <p className="mt-2 text-gray-500">
            Add your content and let AI create stunning slides
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= s
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`mx-2 h-1 w-12 rounded ${
                    step > s ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Step 1: Add Content */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Your Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your ideas, notes, bullet points, or any content here. The AI will analyze and structure it into beautiful slides..."
                  className="min-h-[200px]"
                  value={inputData.text}
                  onChange={(e) =>
                    setInputData({ ...inputData, text: e.target.value })
                  }
                />
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  Images (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-gray-500">
                    {isDragActive
                      ? "Drop images here..."
                      : "Drag & drop images, or click to select"}
                  </p>
                </div>

                {inputData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {inputData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${index + 1}`}
                          className="h-20 w-full object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="h-5 w-5 text-blue-500" />
                  Reference Links (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLink()}
                  />
                  <Button onClick={addLink} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {inputData.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {inputData.links.map((link) => (
                      <span
                        key={link}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                      >
                        {new URL(link).hostname}
                        <button
                          onClick={() => removeLink(link)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} size="lg">
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Configure & Generate */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wand2 className="h-5 w-5 text-blue-500" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Slides (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Leave empty to let AI determine the optimal number
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSlideCount((prev) =>
                          prev ? Math.max(3, prev - 1) : 5
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={3}
                      max={20}
                      value={slideCount || ""}
                      onChange={(e) =>
                        setSlideCount(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                      className="w-24 text-center"
                      placeholder="Auto"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSlideCount((prev) =>
                          prev ? Math.min(20, prev + 1) : 6
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h4 className="font-medium mb-2">Content Summary</h4>
                  <ul className="space-y-1 text-sm text-gray-500">
                    <li>
                      Text: {inputData.text ? `${inputData.text.length} characters` : "None"}
                    </li>
                    <li>Images: {inputData.images.length}</li>
                    <li>Links: {inputData.links.length}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Presentation
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
