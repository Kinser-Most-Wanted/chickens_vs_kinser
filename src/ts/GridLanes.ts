import type { CanvasDimensions } from "./types.js";

/**
 * GridLanes Class
 * Intent: Defines the logical boundaries and subdivisions of the playable area.
 * Separates the abstract grid state from the visual canvas resolution,
 * ensuring entities can snap consistently to lanes and cells regardless of screen size.
 */
export interface GridMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export class GridLanes {
  private lanes: number;
  private cells: number;
  private width: number;
  private height: number;
  private cellWidth: number;
  private cellHeight: number;
  private xOffset: number;
  private yOffset: number;

  constructor(
    lanes: number,
    cells: number,
    dimensions: CanvasDimensions,
    margins: GridMargins = { top: 0, bottom: 0, left: 0, right: 0 }
  ) {
    this.lanes = lanes;
    this.cells = cells;
    
    // Calculate available grid dimensions after margins
    this.width = dimensions.width - margins.left - margins.right;
    this.height = dimensions.height - margins.top - margins.bottom;
    
    // Set offsets
    this.xOffset = margins.left;
    this.yOffset = margins.top;

    // Calculate cell dimensions to fill the grid area
    this.cellWidth = this.width / this.cells;
    this.cellHeight = this.height / this.lanes;
  }

  /**
   * Draws the underlying playable area and subdivision lines.
   * Intent: Visually separates the lanes and cells to provide feedback 
   * to the player regarding valid placement boundaries.
   * @param renderingContext - The 2D context of the main game canvas.
   */
  public render(renderingContext: CanvasRenderingContext2D, coordX?: number, coordY?: number): void {
    renderingContext.save();
    
    // Draw grid background 
    renderingContext.fillStyle = "#2e7d32"; 
    renderingContext.fillRect(this.xOffset, this.yOffset, this.cells * this.cellWidth, this.lanes * this.cellHeight);

    // Draw grid lines
    renderingContext.strokeStyle = "rgba(255, 255, 255, 0.2)";
    renderingContext.lineWidth = 1;

    // Draw horizontal lines (lanes)
    for (let laneIndex = 0; laneIndex <= this.lanes; laneIndex++) {
      const pixelY = this.yOffset + laneIndex * this.cellHeight;
      renderingContext.beginPath();
      renderingContext.moveTo(this.xOffset, pixelY);
      renderingContext.lineTo(this.xOffset + this.cells * this.cellWidth, pixelY);
      renderingContext.stroke();
    }

    // Draw vertical lines (cells)
    for (let cellIndex = 0; cellIndex <= this.cells; cellIndex++) {
      const pixelX = this.xOffset + cellIndex * this.cellWidth;
      renderingContext.beginPath();
      renderingContext.moveTo(pixelX, this.yOffset);
      renderingContext.lineTo(pixelX, this.yOffset + this.lanes * this.cellHeight);
      renderingContext.stroke();
    }

    // Draw highlighter if mouse is over the grid
    if (coordX !== undefined && coordY !== undefined) {
      const coords = this.getGridCoordinates(coordX, coordY);
      if (coords) {
        renderingContext.fillStyle = "rgba(255, 255, 255, 0.3)";
        renderingContext.fillRect(
          this.xOffset + coords.cell * this.cellWidth,
          this.yOffset + coords.lane * this.cellHeight,
          this.cellWidth,
          this.cellHeight
        );
      }
    }

    renderingContext.restore();
  }

  /**
   * Maps raw canvas inputs (like mouse clicks or touch events) to a logical grid location.
   * Edge case handling: If the user interacts with the canvas padding/margins outside 
   * the active grid bounds, this explicitly returns null to prevent out-of-bounds entity placement.
   * @param pixelX - The raw X coordinate from the input event.
   * @param pixelY - The raw Y coordinate from the input event.
   * @returns The corresponding grid indices, or null if outside the playable bounds.
   */
  public getGridCoordinates(pixelX: number, pixelY: number): { lane: number; cell: number } | null {
    if (
      pixelX < this.xOffset || 
      pixelX >= this.xOffset + this.cells * this.cellWidth ||
      pixelY < this.yOffset || 
      pixelY >= this.yOffset + this.lanes * this.cellHeight
    ) {
      return null;
    }

    const lane = Math.floor((pixelY - this.yOffset) / this.cellHeight);
    const cell = Math.floor((pixelX - this.xOffset) / this.cellWidth);

    return { lane, cell };
  }

  /**
   * Calculates the exact visual center of a given cell.
   * Intent: This is required to draw entities (like placed units) perfectly centered
   * within their assigned grid block, rather than aligned to the top-left corner.
   * @param lane - The logical row index.
   * @param cell - The logical column index.
   * @returns The absolute canvas coordinates for rendering.
   */
  public getPixelCoordinates(lane: number, cell: number): { pixelX: number; pixelY: number } {
    return {
      pixelX: this.xOffset + cell * this.cellWidth + this.cellWidth / 2,
      pixelY: this.yOffset + lane * this.cellHeight + this.cellHeight / 2,
    };
  }

}
