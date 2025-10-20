// Defines the user-configurable options for the Pivot Table Panel
export interface PanelOptions {
  showHeader: boolean;
  fontSize: number;
  enablePagination: boolean;
  rowsPerPage: number;
  pinLeftColumn: boolean;
  columnSortOrder: 'chronological' | 'reverse-chronological' | 'alphabetical' | 'none';
  rowSortOrder: 'chronological' | 'reverse-chronological' | 'alphabetical' | 'none';
  highlightCurrentMonth: boolean;
  scrollToCurrentMonth: boolean;
  showScrollArrows: boolean;
}
