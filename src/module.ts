import { PanelPlugin } from '@grafana/data';
import { PivotTablePanel } from './components/PivotTablePanel';
import { PanelOptions } from './types';

// Main entry point for the Pivot Table Panel plugin
export const plugin = new PanelPlugin<PanelOptions>(PivotTablePanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'showHeader',
      name: 'Show Header',
      description: 'Display column headers',
      defaultValue: true,
    })
    .addNumberInput({
      path: 'fontSize',
      name: 'Font Size',
      description: 'Font size in pixels',
      defaultValue: 14,
      settings: {
        min: 8,
        max: 32,
      },
    })
    .addBooleanSwitch({
      path: 'enablePagination',
      name: 'Enable Pagination',
      description: 'Enable pagination for large datasets',
      defaultValue: false,
    })
    .addNumberInput({
      path: 'rowsPerPage',
      name: 'Rows Per Page',
      description: 'Number of rows to display per page',
      defaultValue: 50,
      showIf: (options) => options.enablePagination,
      settings: {
        min: 10,
        max: 1000,
      },
    })
    .addBooleanSwitch({
      path: 'pinLeftColumn',
      name: 'Pin Left Column',
      description: 'Keep the leftmost column fixed while scrolling horizontally',
      defaultValue: true,
    })
    .addSelect({
      path: 'columnSortOrder',
      name: 'Column Sort Order',
      description: 'How to sort the columns in the table',
      defaultValue: 'chronological',
      settings: {
        options: [
          { label: 'Chronological (oldest to newest)', value: 'chronological' },
          { label: 'Reverse Chronological (newest to oldest)', value: 'reverse-chronological' },
          { label: 'Alphabetical', value: 'alphabetical' },
          { label: 'None (original order)', value: 'none' },
        ],
      },
    })
    .addSelect({
      path: 'rowSortOrder',
      name: 'Row Sort Order',
      description: 'How to sort the rows in the table',
      defaultValue: 'chronological',
      settings: {
        options: [
          { label: 'Chronological (oldest to newest)', value: 'chronological' },
          { label: 'Reverse Chronological (newest to oldest)', value: 'reverse-chronological' },
          { label: 'Alphabetical', value: 'alphabetical' },
          { label: 'None (original order)', value: 'none' },
        ],
      },
    })
    .addBooleanSwitch({
      path: 'highlightCurrentMonth',
      name: 'Highlight Current Month',
      description: 'Highlight the current month column with a distinct background color',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'scrollToCurrentMonth',
      name: 'Scroll to Current Month',
      description: 'Automatically scroll to center the current month column when the panel loads',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showScrollArrows',
      name: 'Show Scroll Arrows',
      description: 'Display arrow buttons to scroll left/right when the table has horizontal overflow',
      defaultValue: true,
    });
});
