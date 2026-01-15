"use client";

import { motion, TargetAndTransition } from "framer-motion";
import { SlideContent, SlideElement, AnimationType } from "@/types";

interface Slide {
  id: string;
  title: string;
  content: SlideContent;
  backgroundUrl: string | null;
  backgroundColor: string | null;
  transition: string;
}

interface SlidePreviewProps {
  slide: Slide;
  isThumbnail?: boolean;
  isFullscreen?: boolean;
}

interface AnimationVariant {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
}

const animationVariants: Record<AnimationType, AnimationVariant> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
  },
  slideInDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
  },
  flipInX: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
  },
  flipInY: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
  },
  none: {
    initial: {},
    animate: {},
  },
};

const emptyAnimation: TargetAndTransition = {};

export function SlidePreview({
  slide,
  isThumbnail = false,
  isFullscreen = false,
}: SlidePreviewProps) {
  const renderElement = (element: SlideElement, index: number) => {
    const animation = element.animation || "none";
    const variants = animationVariants[animation] || animationVariants.none;

    const baseStyle = {
      position: "absolute" as const,
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
    };

    if (element.type === "text") {
      return (
        <motion.div
          key={element.id}
          style={{
            ...baseStyle,
            fontSize: isThumbnail
              ? `${element.fontSize * 0.15}px`
              : isFullscreen
              ? `${element.fontSize * 1.5}px`
              : `${element.fontSize}px`,
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
            overflow: "hidden",
            lineHeight: 1.2,
          }}
          initial={isThumbnail ? emptyAnimation : variants.initial}
          animate={isThumbnail ? emptyAnimation : variants.animate}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {element.content}
        </motion.div>
      );
    }

    if (element.type === "image") {
      return (
        <motion.img
          key={element.id}
          src={element.src}
          alt={element.alt}
          style={{
            ...baseStyle,
            objectFit: "cover",
            borderRadius: element.borderRadius
              ? `${element.borderRadius}px`
              : undefined,
          }}
          initial={isThumbnail ? emptyAnimation : variants.initial}
          animate={isThumbnail ? emptyAnimation : variants.animate}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      );
    }

    if (element.type === "shape") {
      const shapeStyle = {
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
      };

      return (
        <motion.div
          key={element.id}
          style={shapeStyle}
          initial={isThumbnail ? emptyAnimation : variants.initial}
          animate={isThumbnail ? emptyAnimation : variants.animate}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      );
    }

    return null;
  };

  return (
    <div
      className={`relative ${
        isFullscreen ? "w-full h-full" : "w-full aspect-video"
      }`}
      style={{
        backgroundColor: slide.backgroundColor || "#1e40af",
        backgroundImage: slide.backgroundUrl
          ? `url(${slide.backgroundUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text visibility if background image exists */}
      {slide.backgroundUrl && (
        <div className="absolute inset-0 bg-black/30" />
      )}

      {/* Render all elements */}
      <div className="absolute inset-0">
        {slide.content?.elements?.map((element, index) =>
          renderElement(element, index)
        )}
      </div>
    </div>
  );
}
