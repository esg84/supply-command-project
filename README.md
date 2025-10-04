# Supplier Command

A procurement dashboard for managing purchase orders, tracking supplier communications, and monitoring delivery timelines. Built for buyers to efficiently manage active POs with smart prioritization and risk indicators.

## Overview

Supplier Command helps procurement teams:
- **Prioritize urgent POs** requiring immediate attention
- **Track supplier performance** with historical metrics and risk scores
- **Manage omnichannel communications** (email and phone) with suppliers
- **Monitor delivery timelines** with visual priority indicators
- **Identify at-risk orders** based on supplier reliability and contact escalation rates

## Features

### Purchase Order Management
- **Smart Prioritization**: Collapsible sections for Urgent, This Week, Pending, and Confirmed POs
- **Priority Indicators**: Visual badges showing POs due within 1-3 days
- **Risk Warnings**: "At Risk" tags for unreliable suppliers or high-escalation contacts
- **Search & Filter**: Full-text search across PO numbers, items, and suppliers
- **Status Tracking**: Real-time status updates (Pending, Email Sent, Phone Call, Confirmed, Delivered, etc.)

### Supplier Insights
- **Risk Scoring**: 0-100 risk score based on delivery history, escalation rates, and response times
- **Performance Metrics**: 
  - Average response time
  - On-time delivery rate
  - Escalation percentage
  - Delay rate
- **Contact-Level Analytics**: Performance breakdown by individual supplier contacts
- **Active Risk Alerts**: Automatic warnings for slow response times, high escalations, or at-risk POs

### Communication History
- **Timeline View**: Complete communication history for each PO
- **Omnichannel Tracking**: Email and phone call records
- **AI Agent Integration**: Shows activity from AI assistant "Paul"
- **Quick Actions**: One-click email or call buttons from any PO card

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Data Format**: CSV files for mock purposes (easily replaced with API calls for real data)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd supplier-command

# Install dependencies
npm install

# Start development server
npm run dev
```

### Required Data Files

CSV files in the `public/` directory:

**suppliercommanddata.csv** - Purchase order data
```csv
PO Number,PO line,PO Schedule Line,Item Code,PO Delivery Date,PO Open Qty,Buyer,Buyer email,supplier_email,Supplier,Supplier contact name,Status
```

**supplierinsights.csv** - Historical supplier performance
```csv
PO Number,PO line,PO Schedule Line,Supplier,Supplier contact,Delivery Status,Phone Escalation,Response Time (hrs)
```

### Project Structure

```
supplier-command/
├── public/
│   ├── suppliercommanddata.csv
│   ├── supplierinsights.csv
│   └── happy-robot-logo.png
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage

### For Buyers

1. **Check Urgent POs First**: The URGENT section shows POs due today or tomorrow that need immediate action
2. **Expand This Week**: Review POs due in 2-7 days to plan ahead
3. **Search & Filter**: Use the search bar to quickly find specific POs, items, or suppliers
4. **Click for Details**: Click any PO card to see full details, communication history, and quick actions
5. **Monitor Risks**: Look for yellow "At Risk" badges indicating problematic suppliers or contacts


## Configuration

### Unreliable Suppliers List

Update the hardcoded list in `App.tsx`:

```typescript
const unreliableSuppliers = ['AeroCraft Tooling Co', 'MechaSupplies Inc'];
```

### Current Date

For demo purposes, the current date is set in the `getDaysUntil` function:

```typescript
const today = new Date('2025-10-03');
```

Change this to `new Date()` for production use.

### Risk Score Thresholds

Adjust risk calculation in `calculateSupplierMetrics`:

```typescript
if (score >= 50) return 'High Risk';
if (score >= 35) return 'Medium Risk';
return 'Low Risk';
```

## Scaling Considerations (Future)

### UI/UX at Scale (100+ POs)
- Collapsible sections hide non-urgent POs by default
- Search functionality for quick filtering
- Progressive disclosure keeps interface manageable
- Section counts show totals without expanding

### Performance Optimization (Future)
For production deployments with large datasets:
- Implement pagination (50 POs per page)
- Add virtual scrolling for long lists
- Move to API-based data loading
- Use React Query for caching
- Implement server-side filtering

## Data Model

### Status Values
- `Pending`: Initial state, no action taken
- `Email Sent`: AI agent sent email to supplier
- `Phone Call`: Escalated to phone call after no email response
- `Confirmed`: Supplier confirmed delivery
- `On Way`: Shipment in transit
- `Delivered`: Successfully delivered
- `Delayed`: Reported delay
- `At Risk`: Requires attention & monitoring

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time WebSocket updates
- [ ] Bulk actions (email multiple suppliers)
- [ ] Email templates
- [ ] Calendar integration
- [ ] Mobile responsive design improvements (on the go PO Management)
- [ ] Keyboard shortcuts
- [ ] Table view toggle
