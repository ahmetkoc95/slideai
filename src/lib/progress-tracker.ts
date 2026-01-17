export interface ProgressState {
  step: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  error?: string;
  totalSlides?: number;
  currentSlide?: number;
  percentage?: number;
  timestamp: number;
  completedAt?: number;
}

export interface ProgressStep {
  step: number;
  message: string;
}

export const PROGRESS_STEPS: ProgressStep[] = [
  { step: 1, message: "Analyzing your content..." },
  { step: 2, message: "AI is generating slide structure..." },
  { step: 3, message: "Creating visual elements..." },
  { step: 4, message: "Fetching images for each slide..." },
  { step: 5, message: "Saving slides to database..." },
  { step: 6, message: "Presentation ready!" },
];

const progressMap = new Map<string, ProgressState>();
const CLEANUP_DELAY = 5 * 60 * 1000;

function calculatePercentage(state: ProgressState): number {
  if (state.step < 1) return 0;
  if (state.step === 4 && state.totalSlides) {
    return Math.floor(((state.currentSlide || 0) / state.totalSlides) * 100);
  }
  if (state.step === 6) return 100;
  return Math.floor((state.step / 6) * 100);
}

export function startProgress(presentationId: string): void {
  const state: ProgressState = {
    step: 1,
    status: 'processing',
    message: PROGRESS_STEPS[0].message,
    timestamp: Date.now(),
    percentage: 0,
  };
  progressMap.set(presentationId, state);
}

export function updateProgress(
  presentationId: string,
  step: number,
  message: string,
  details?: { currentSlide?: number; totalSlides?: number }
): void {
  const state = progressMap.get(presentationId);
  if (!state) return;

  state.step = step;
  state.status = 'processing';
  state.message = message;
  
  if (details) {
    state.currentSlide = details.currentSlide;
    state.totalSlides = details.totalSlides;
  }
  
  state.percentage = calculatePercentage(state);
  state.timestamp = Date.now();
  
  progressMap.set(presentationId, state);
}

export function completeProgress(presentationId: string): void {
  const state = progressMap.get(presentationId);
  if (!state) return;

  state.step = 6;
  state.status = 'completed';
  state.message = PROGRESS_STEPS[5].message;
  state.percentage = 100;
  state.completedAt = Date.now();
  state.timestamp = Date.now();
  
  progressMap.set(presentationId, state);
  
  setTimeout(() => {
    cleanup(presentationId);
  }, CLEANUP_DELAY);
}

export function failProgress(presentationId: string, error: string): void {
  const state = progressMap.get(presentationId);
  if (!state) return;

  state.status = 'failed';
  state.error = error;
  state.completedAt = Date.now();
  state.timestamp = Date.now();
  
  progressMap.set(presentationId, state);
  
  setTimeout(() => {
    cleanup(presentationId);
  }, CLEANUP_DELAY);
}

export function getProgress(presentationId: string): ProgressState | null {
  return progressMap.get(presentationId) || null;
}

export function cleanup(presentationId: string): void {
  progressMap.delete(presentationId);
}

export function getAllProgress(): Record<string, ProgressState> {
  return Object.fromEntries(progressMap);
}
