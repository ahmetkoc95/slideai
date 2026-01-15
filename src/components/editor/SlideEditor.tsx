"use client";

import { useState, useRef, useEffect } from "react";
import { SlideContent, SlideElement } from "@/types";

interface Slide {
  id: string;
  title: string;
  content: SlideContent;
  backgroundUrl: string | null;
  backgroundColor: string | null;
  transition: string;
}

interface SlideEditorProps {
  slide: Slide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onUpdateContent: (content: SlideContent) => void;
}

export function SlideEditor({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onUpdateContent,
}: SlideEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onSelectElement(null);
        setEditingTextId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSelectElement]);

  const handleElementMouseDown = (
    e: React.MouseEvent,
    element: SlideElement
  ) => {
    e.stopPropagation();
    onSelectElement(element.id);

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (element.x / 100) * rect.width,
      y: e.clientY - (element.y / 100) * rect.height,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const newY = ((e.clientY - dragStart.y) / rect.height) * 100;

    // Constrain to slide bounds
    const constrainedX = Math.max(0, Math.min(100 - 10, newX));
    const constrainedY = Math.max(0, Math.min(100 - 10, newY));

    onUpdateElement(selectedElementId, {
      x: constrainedX,
      y: constrainedY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (element: SlideElement) => {
    if (element.type === "text") {
      setEditingTextId(element.id);
    }
  };

  const handleTextChange = (elementId: string, newContent: string) => {
    onUpdateElement(elementId, { content: newContent });
  };

  const handleTextBlur = () => {
    setEditingTextId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onSelectElement(null);
      setEditingTextId(null);
    }
  };

  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElementId === element.id;
    const isEditing = editingTextId === element.id;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      cursor: isDragging ? "grabbing" : "grab",
      outline: isSelected ? "2px solid #3b82f6" : undefined,
      outlineOffset: "2px",
    };

    if (element.type === "text") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            display: "flex",
            alignItems: "center",
            justifyContent:
              element.textAlign === "center"
                ? "center"
                : element.textAlign === "right"
                ? "flex-end"
                : "flex-start",
            lineHeight: 1.2,
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
          onDoubleClick={() => handleDoubleClick(element)}
        >
          {isEditing ? (
            <textarea
              value={element.content}
              onChange={(e) => handleTextChange(element.id, e.target.value)}
              onBlur={handleTextBlur}
              autoFocus
              className="w-full h-full bg-transparent resize-none outline-none"
              style={{
                fontSize: "inherit",
                fontWeight: "inherit",
                fontFamily: "inherit",
                color: "inherit",
                textAlign: element.textAlign,
              }}
            />
          ) : (
            element.content
          )}

          {/* Resize handles */}
          {isSelected && !isEditing && (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize" />
            </>
          )}
        </div>
      );
    }

    if (element.type === "image") {
      return (
        <div
          key={element.id}
          style={baseStyle}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          <img
            src={element.src}
            alt={element.alt}
            className="w-full h-full object-cover"
            style={{
              borderRadius: element.borderRadius
                ? `${element.borderRadius}px`
                : undefined,
            }}
            draggable={false}
          />
          {isSelected && (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize" />
            </>
          )}
        </div>
      );
    }

    if (element.type === "shape") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            backgroundColor: element.fill,
            border: element.stroke
              ? `${element.strokeWidth || 1}px solid ${element.stroke}`
              : undefined,
            borderRadius:
              element.shape === "circle"
                ? "50%"
                : element.shape === "rectangle"
                ? "8px"
                : undefined,
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          {isSelected && (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize" />
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl aspect-video shadow-2xl rounded-lg overflow-hidden"
      style={{
        backgroundColor: slide.backgroundColor || "#1e40af",
        backgroundImage: slide.backgroundUrl
          ? `url(${slide.backgroundUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Overlay for better visibility */}
      {slide.backgroundUrl && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}

      {/* Grid overlay (optional, for alignment) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-10 transition"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "10% 10%",
        }}
      />

      {/* Render all elements */}
      {slide.content?.elements?.map((element) => renderElement(element))}

      {/* Click instruction */}
      {!slide.content?.elements?.length && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          Add elements using the toolbar above
        </div>
      )}
    </div>
  );
}
