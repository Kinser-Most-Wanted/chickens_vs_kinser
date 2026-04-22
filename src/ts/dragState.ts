import type { Chicken } from "./shop.js";

export interface DragState {
  isDragging: boolean;
  chicken: Chicken | null;
  offsetX: number;
  offsetY: number;
}

export const dragState: DragState = {
  isDragging: false,
  chicken: null,
  offsetX: 0,
  offsetY: 0,
};

export function resetDragState(): void {
  dragState.isDragging = false;
  dragState.chicken = null;
  dragState.offsetX = 0;
  dragState.offsetY = 0;
}
