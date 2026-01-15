// Slide content types
export interface TextBlock {
  id: string;
  type: "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  color: string;
  textAlign: "left" | "center" | "right";
  animation?: AnimationType;
}

export interface ImageBlock {
  id: string;
  type: "image";
  src: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  animation?: AnimationType;
}

export interface ShapeBlock {
  id: string;
  type: "shape";
  shape: "rectangle" | "circle" | "triangle" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  animation?: AnimationType;
}

export type SlideElement = TextBlock | ImageBlock | ShapeBlock;

export interface SlideContent {
  elements: SlideElement[];
}

// Animation types
export type AnimationType =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "zoomIn"
  | "bounceIn"
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "rotateIn"
  | "flipInX"
  | "flipInY"
  | "none";

export type TransitionType =
  | "fade"
  | "slide"
  | "slideUp"
  | "slideDown"
  | "zoom"
  | "flip"
  | "rotate"
  | "cube"
  | "none";

// Theme types
export interface PresentationTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFontFamily?: string;
}

// AI Processing types
export interface UserInput {
  text?: string;
  images?: string[];
  links?: string[];
  files?: File[];
}

export interface ProcessedContent {
  title: string;
  slides: ProcessedSlide[];
  suggestedTheme?: PresentationTheme;
}

export interface ProcessedSlide {
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  mainContent?: string;
  imagePrompt?: string;
  imageKeywords?: string;
  layout: "title" | "titleAndContent" | "twoColumn" | "imageLeft" | "imageRight" | "fullImage";
}

// API Response types
export interface AIAnalysisResponse {
  success: boolean;
  data?: ProcessedContent;
  error?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Real-time collaboration types
export interface CursorPosition {
  x: number;
  y: number;
  slideId: string;
}

export interface UserPresence {
  id: string;
  name: string;
  email: string;
  image?: string;
  cursor?: CursorPosition;
  activeSlideId?: string;
  color: string;
}

export interface SlideUpdate {
  slideId: string;
  content: SlideContent;
  userId: string;
  timestamp: number;
}

// Export types
export interface ExportOptions {
  format: "pptx" | "pdf" | "html";
  includeNotes: boolean;
  quality: "low" | "medium" | "high";
}

// Template types
export interface TemplateLayout {
  gridTemplate: string;
  gridAreas: string[];
  placeholders: TemplatePlaceholder[];
}

export interface TemplatePlaceholder {
  id: string;
  area: string;
  type: "title" | "subtitle" | "content" | "image" | "list";
  defaultStyles: Partial<TextBlock | ImageBlock>;
}
