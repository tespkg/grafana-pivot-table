# API Integration Guide

This guide explains how to integrate your API data with the Pivot Table Panel plugin.

## API Data Format

Your API should return data in the standard Grafana JSON format with optional cell styling:

```json
[
  {
    "columns": [
      {
        "text": "Month",
        "type": "string"
      },
      {
        "text": "01-Apr-2024",
        "type": "number"
      },
      {
        "text": "01-Dec-2023",
        "type": "number"
      }
    ],
    "rows": [
      ["01-Sep-2023", "A", 10],
      ["01-Oct-2023", "B", 20],
      ["01-Nov-2023", "C", 15]
    ],
    "meta": {
      "custom": {
        "cellStyles": {
          "0_1": {
            "backgroundColor": "#ff0000",
            "textColor": "#ffffff"
          },
          "1_2": {
            "backgroundColor": "#00ff00",
            "textColor": "#000000"
          }
        }
      }
    }
  }
]
```

### Format Specification

**Columns Array:**
- `text`: The column header name
- `type`: Data type (`string`, `number`, `time`)

**Rows Array:**
- Each row is an array of values
- Values must match the order of columns
- String values for `string` type columns
- Numeric values for `number` type columns

**Meta Object (Optional):**
- `meta.custom.cellStyles`: Object containing cell-specific styling
- **Key format**: `"rowIndex_columnIndex"` (e.g., `"0_1"` for row 0, column 1)
- **Row/Column indices are 0-based**
- **Value**: Object with optional properties:
  - `backgroundColor`: CSS color value (hex, rgb, rgba, named colors)
  - `textColor`: CSS color value for text
- If a cell has no style defined, default theme colors are used

**Cell Color Examples:**
```json
"cellStyles": {
  "0_1": { "backgroundColor": "#ff0000", "textColor": "#ffffff" },  // Red background, white text
  "0_2": { "backgroundColor": "rgb(0, 255, 0)" },                    // Green background, default text
  "1_0": { "textColor": "#0000ff" },                                 // Default background, blue text
  "2_3": { "backgroundColor": "rgba(255, 165, 0, 0.5)" }            // Orange with 50% opacity
}
```

## Setting Up Grafana Data Source

### Option 1: JSON API Data Source (Recommended)

1. Install the JSON API plugin in Grafana:
   ```bash
   grafana-cli plugins install marcusolsson-json-datasource
   ```

2. In Grafana UI:
   - Go to **Configuration** > **Data Sources**
   - Click **Add data source**
   - Search for "JSON API"
   - Configure your API endpoint URL
   - Save & Test

3. Create a new dashboard panel:
   - Add panel
   - Select "JSON API" as data source
   - Configure your query/endpoint
   - Under **Visualization**, select "Pivot Table Panel"

### Option 2: Infinity Data Source

1. Install Infinity plugin:
   ```bash
   grafana-cli plugins install yesoreyeram-infinity-datasource
   ```

2. Configure similar to JSON API above

### Option 3: Custom Backend Data Source Plugin

If you need more control, create a backend data source plugin that:
- Fetches data from your API
- Returns data in Grafana DataFrame format
- Handles authentication, caching, etc.

## How Data is Transformed

When your API returns the JSON format above, Grafana automatically transforms it:

```
API Response → Grafana DataFrame → Pivot Table Panel
```

**Transformation Example:**

Your API returns:
```json
{
  "columns": [
    {"text": "Name", "type": "string"},
    {"text": "Value", "type": "number"}
  ],
  "rows": [
    ["Alice", 100],
    ["Bob", 200]
  ]
}
```

Grafana creates a DataFrame:
```javascript
{
  fields: [
    {
      name: "Name",
      type: "string",
      values: ["Alice", "Bob"]
    },
    {
      name: "Value",
      type: "number",
      values: [100, 200]
    }
  ],
  length: 2
}
```

The Pivot Table Panel renders:
```
| Name  | Value |
|-------|-------|
| Alice | 100   |
| Bob   | 200   |
```

## Testing Your Integration

### 1. Test with Mock Data

Create a test endpoint that returns sample data:

```json
[
  {
    "columns": [
      {"text": "Month", "type": "string"},
      {"text": "Sales", "type": "number"},
      {"text": "Revenue", "type": "number"}
    ],
    "rows": [
      ["January", 150, 5000],
      ["February", 200, 6500],
      ["March", 180, 6000]
    ]
  }
]
```

### 2. Verify in Grafana

- Add the Pivot Table Panel to your dashboard
- Point it to your test API
- Check that:
  - All columns appear as headers
  - All rows display correctly
  - Numbers are formatted properly
  - Pagination works if enabled

### 3. Configure Panel Options

In the panel editor, configure:
- **Show Header**: Toggle column headers
- **Font Size**: Adjust readability (8-32px)
- **Enable Pagination**: For datasets with many rows
- **Rows Per Page**: Set page size (10-1000)

## Troubleshooting

### No data appears
- Check API endpoint is accessible
- Verify JSON format matches specification
- Check browser console for errors
- Test data source connection in Grafana

### Columns missing or incorrect
- Ensure `columns` array has correct `text` and `type` fields
- Verify row values match column count
- Check data types are consistent

### Formatting issues
- Use `type: "number"` for numeric values
- Use `type: "time"` for timestamps (milliseconds since epoch)
- Use `type: "string"` for text

### Performance with large datasets
- Enable pagination in panel options
- Consider server-side pagination
- Add caching to your API
- Limit initial query results

## Example API Endpoint (Node.js/Express)

### Basic Example (No Colors)
```javascript
app.get('/api/table-data', (req, res) => {
  res.json([
    {
      columns: [
        { text: 'Month', type: 'string' },
        { text: 'Sales', type: 'number' },
        { text: 'Revenue', type: 'number' }
      ],
      rows: [
        ['January', 150, 5000],
        ['February', 200, 6500],
        ['March', 180, 6000]
      ]
    }
  ]);
});
```

### Advanced Example (With Cell Colors)
```javascript
app.get('/api/table-data-colored', (req, res) => {
  res.json([
    {
      columns: [
        { text: 'Month', type: 'string' },
        { text: 'Sales', type: 'number' },
        { text: 'Revenue', type: 'number' },
        { text: 'Status', type: 'string' }
      ],
      rows: [
        ['January', 150, 5000, 'Good'],
        ['February', 200, 6500, 'Excellent'],
        ['March', 80, 2000, 'Poor'],
        ['April', 180, 6000, 'Good']
      ],
      meta: {
        custom: {
          cellStyles: {
            // Highlight excellent sales (row 1, column 1)
            '1_1': { backgroundColor: '#4caf50', textColor: '#ffffff' },

            // Highlight excellent revenue (row 1, column 2)
            '1_2': { backgroundColor: '#4caf50', textColor: '#ffffff' },

            // Highlight poor sales (row 2, column 1)
            '2_1': { backgroundColor: '#f44336', textColor: '#ffffff' },

            // Highlight poor revenue (row 2, column 2)
            '2_2': { backgroundColor: '#f44336', textColor: '#ffffff' },

            // Color code status column
            '1_3': { backgroundColor: '#4caf50', textColor: '#ffffff' }, // Excellent
            '2_3': { backgroundColor: '#f44336', textColor: '#ffffff' }, // Poor
            '0_3': { backgroundColor: '#2196f3', textColor: '#ffffff' }, // Good
            '3_3': { backgroundColor: '#2196f3', textColor: '#ffffff' }  // Good
          }
        }
      }
    }
  ]);
});
```

### Dynamic Color Logic Example
```javascript
app.get('/api/table-data-dynamic', (req, res) => {
  const data = {
    columns: [
      { text: 'Product', type: 'string' },
      { text: 'Stock', type: 'number' },
      { text: 'Price', type: 'number' }
    ],
    rows: [
      ['Widget A', 5, 29.99],
      ['Widget B', 150, 39.99],
      ['Widget C', 25, 19.99],
      ['Widget D', 0, 49.99]
    ],
    meta: {
      custom: {
        cellStyles: {}
      }
    }
  };

  // Apply colors based on stock levels
  data.rows.forEach((row, rowIndex) => {
    const stock = row[1]; // Stock is in column index 1

    if (stock === 0) {
      // Out of stock - red
      data.meta.custom.cellStyles[`${rowIndex}_1`] = {
        backgroundColor: '#f44336',
        textColor: '#ffffff'
      };
    } else if (stock < 20) {
      // Low stock - orange
      data.meta.custom.cellStyles[`${rowIndex}_1`] = {
        backgroundColor: '#ff9800',
        textColor: '#ffffff'
      };
    } else {
      // Good stock - green
      data.meta.custom.cellStyles[`${rowIndex}_1`] = {
        backgroundColor: '#4caf50',
        textColor: '#ffffff'
      };
    }
  });

  res.json([data]);
});
```

## Best Practices

1. **Consistent Data Types**: Ensure all values in a column match the declared type
2. **Error Handling**: Return empty arrays if no data (don't return null)
3. **Performance**: Limit rows for initial load, implement pagination on server
4. **Headers**: Use clear, descriptive column names
5. **Formatting**: Pre-format dates/times as needed or use appropriate types

### Color Best Practices

1. **Accessibility**: Ensure sufficient contrast between background and text colors
   - Use tools like WebAIM Contrast Checker
   - Minimum ratio 4.5:1 for normal text, 3:1 for large text

2. **Consistent Color Scheme**: Define a standard palette for your application
   ```javascript
   const COLORS = {
     success: { bg: '#4caf50', text: '#ffffff' },
     warning: { bg: '#ff9800', text: '#ffffff' },
     error: { bg: '#f44336', text: '#ffffff' },
     info: { bg: '#2196f3', text: '#ffffff' }
   };
   ```

3. **Conditional Colors**: Only add colors when they provide meaningful information
   - Don't color every cell
   - Use colors to highlight important data (thresholds, alerts, status)

4. **Theme Compatibility**: Consider both light and dark Grafana themes
   - Test your colors in both themes
   - Use semi-transparent colors for better theme integration

5. **Performance**: Only send color data for cells that need custom styling
   - Don't send empty color objects
   - Minimize the size of the `cellStyles` object

6. **Color Meaning**: Use consistent color meanings across your application
   - Green = Good/Success/High
   - Red = Bad/Error/Low
   - Orange/Yellow = Warning/Medium
   - Blue = Info/Neutral

## Additional Resources

- [Grafana JSON Data Source Documentation](https://grafana.com/grafana/plugins/marcusolsson-json-datasource/)
- [Grafana DataFrame Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/data-frames/)
- [Panel Plugin Development Guide](https://grafana.com/docs/grafana/latest/developers/plugins/create-a-grafana-plugin/)
