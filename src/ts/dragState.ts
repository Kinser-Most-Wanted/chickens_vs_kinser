import type { Chicken } from "./shop.js";

export type ActiveTool = "place" | "net";
export const DRAG_STATE_CHANGE_EVENT = "drag-state-change";

export interface DragState {
  isDragging: boolean;
  chicken: Chicken | null;
  offsetX: number;
  offsetY: number;
  activeTool: ActiveTool;
}

export const dragState: DragState = {
  isDragging: false,
  chicken: null,
  offsetX: 0,
  offsetY: 0,
  activeTool: "place",
};

export function notifyDragStateChanged(): void {
  window.dispatchEvent(new CustomEvent(DRAG_STATE_CHANGE_EVENT));
}

export function resetDragState(): void {
  dragState.isDragging = false;
  dragState.chicken = null;
  dragState.offsetX = 0;
  dragState.offsetY = 0;
  if (dragState.activeTool !== "net") {
    dragState.activeTool = "place";
  }
  notifyDragStateChanged();
}
