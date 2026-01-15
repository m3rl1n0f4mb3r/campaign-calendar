# Campaign Calendar

A comprehensive web app for managing campaigns in tabletop RPGs, featuring fully customizable fantasy calendars, special day periods (festivals/holidays), domain tracking, and event management. Compatible with Shadowdark RPG.

## Features

### Campaign Management
- **Multiple Campaigns**: Create and manage separate campaigns with independent calendars, domains, and event histories
- **Campaign Wizard**: Step-by-step setup for new campaigns
- **Import/Export**: Backup and transfer all campaign data via JSON files
- **Persistent Storage**: All data automatically saved to browser localStorage

### Custom Fantasy Calendar
- **Configurable Months**: Define 1-24 months with custom names and days per month (1-100 each)
- **Custom Week Structure**: Set 1-14 days per week with custom weekday names
- **Special Days (Festivals & Holidays)**: Create "out of time" periods that exist outside the normal calendar cycle
  - Position festivals before or after any month
  - Special days don't affect the weekly cycle (a month ending on Saturday will have the next month start on Sunday, regardless of festival days in between)
  - Display as distinctive gold-highlighted sections on the calendar
- **Era/Epoch Labels**: Configure labels like "AC" (After Cataclysm), "DR" (Dale Reckoning), etc.
- **Negative Years**: Full support for years before the epoch (e.g., "42 BC")
- **Day-by-Day Navigation**: Move forward and backward through time, including through special day periods

### Domain Management
- **Multiple Domains per Campaign**: Manage player strongholds, regions, cities
- **Domain Wizard**: Step-by-step setup (name, ruler, abilities, starting conditions)
- **Editable Domain Details**: Change domain name and ruler name at any time
- **Confidence System**: Track domain confidence scores (1-1000 scale) with 11 status levels
- **Resource Management**: Track gold, food, materials, and manpower
- **Population & Morale**: Monitor domain population and morale levels
- **Domain Overview**: At-a-glance table of all domains with quick actions
  - View population, confidence, and net income for each domain
  - **Roll All Growth**: Batch roll population growth for all domains at once
  - **Roll Annual Events**: Roll 1d4 events per domain with date scheduling modal
  - Quick access to view domain details
- **Domain Calculator**:
  - Population & resources (0-10 scale)
  - **Automated Population Growth**: Roll monthly growth with one click (percentage based on population bracket, 1d10 for growth/decline)
  - Income tracking (standard, tax, resource-based)
  - Staff management (officials and servitors)
  - Military forces (9 mercenary types)
  - **Wartime Toggle**: Switch between peacetime and wartime costs (mercenary costs double during war)
  - Overlord payments (liege lord and theocracy)
  - XP calculation
  - Net income display (color-coded profit/loss)

### Event System
- **Event Roller**: Roll random events using Shadowdark's domain event tables
  - 24 Natural events (weather, disasters, markets)
  - 19 Unnatural events (politics, military, social)
- **Annual Events**: Roll 1d4 events per year from Domain Overview with batch scheduling
  - All rolled events shown in a modal with dice roll details
  - Schedule each event on a specific date before saving
- **Manual Scheduling**: Schedule custom events on any date (including special days/festivals)
- **Event Categories**: Campaign-wide, Domain, Personal/Character, Combat, and Other
- **Disaster Events**: Special handling with confidence check requirements
- **Calendar Display**: Events shown as color-coded badges on calendar days with tooltips for full event names
- **Event History**: View, edit, and manage all past and scheduled events with filtering and search

### Quick Reference
- Built-in reference for Shadowdark domain rules
- Fortification costs (walls, towers, gates)
- Mercenary wages by type (peacetime and wartime rates)
- Official salaries
- Income rates
- Population growth table with automated rolling
- Stronghold construction costs (1 engineer per 40,000 gp)

## Installation

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd gm-screen

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

The build output will be in the `build/` directory, ready for deployment to any static hosting service.

## Deployment

The app is a static site with no backend requirements. Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag `build/` folder to Netlify
- **GitHub Pages**: Configure `homepage` in `package.json`
- **Any static host**: Upload `build/` contents

## Usage Guide

### Getting Started

1. **Create a Campaign**: Click "New Campaign" and follow the wizard
   - Enter campaign name and description
   - Configure your calendar (months, weeks, days)
   - Optionally set up special days/festivals
   - Set the starting date

2. **Navigate the Calendar**: Use the Calendar tab to view and navigate your campaign timeline
   - Use day/month navigation buttons to move through time
   - Click on days to select them
   - Special days appear as gold-highlighted sections before or after their anchor months

3. **Roll Events**: Use the "Events & History" tab to generate and manage events
   - Roll random events for domain turns
   - Schedule custom events manually (on regular days or special days)
   - View and edit your event history

4. **Manage Domains**: Use the "Domain Management" tab for player strongholds
   - Create domains with the wizard
   - Track resources, population, and morale
   - Monitor confidence scores
   - Calculate income and expenses

### Calendar Configuration

Access calendar settings via the gear icon next to your campaign name.

#### Months
- Set the number of months (1-24)
- Name each month
- Set days per month (1-100 each)

#### Weeks
- Set days per week (1-14)
- Name each weekday

#### Special Days (Festivals & Holidays)
Special days are "out of time" periods that:
- Appear before or after a specific month
- Can be any duration (1+ days)
- Don't affect the weekly cycle
- Display as separate golden sections on the calendar
- Can have events scheduled on them

**Example**: A 7-day "Midwinter Festival" after Month 12:
- Month 12 ends on Saturday the 28th
- Festival runs for 7 days (Day 1 through Day 7)
- Month 1 of the new year starts on Sunday the 1st

#### Epoch Labels
- Set era label (e.g., "DR", "AC", "AD")
- Optionally set a "before" label (e.g., "BC", "BAC")

### Data Management

#### Export
Click the download icon in the navbar to export all campaigns as a JSON file.

#### Import
Click the upload icon to import campaigns from a previously exported JSON file.

**Note**: Importing will merge with existing campaigns, not replace them.

## Technical Details

### Built With
- **React 19** - UI framework
- **React Bootstrap** - UI components
- **Bootstrap 5** - Styling
- **Font Awesome** - Icons
- **localStorage** - Data persistence

### Project Structure
```
src/
├── App.js              # Main application component
├── index.js            # Application entry point
├── index.css           # Global styles and CSS variables
├── components/         # React UI components
├── hooks/              # Custom React hooks for state management
└── utils/              # Utility functions (date calculations, etc.)
```

### Key Utilities (dateUtils.js)
- `advanceDate()` / `previousDate()` - Navigate by day (handles special days)
- `getDaysInMonth()` - Get days for a specific month
- `getFirstDayOfMonth()` - Calculate starting weekday (excludes special days from calculation)
- `getSpecialDaysBeforeMonth()` / `getSpecialDaysAfterMonth()` - Get festival periods
- `formatDate()` / `formatSpecialDate()` - Human-readable date formatting

### Data Storage

All data stored in browser's localStorage:
- `shadowdark_campaigns`: All campaign data
- `shadowdark_active_campaign`: Currently selected campaign ID

**Campaign Data Structure**:
```javascript
{
  id: "timestamp",
  name: "The Dragon's Shadow",
  calendarConfig: {
    monthNames: ["Deepwinter", "Thawing", ...],
    daysPerMonth: [28, 30, ...],
    weekdayNames: ["Moonday", "Tirsday", ...],
    daysPerWeek: 7,
    specialDays: [
      { name: "Midwinter Festival", position: "after", anchorMonth: 12, duration: 7 }
    ],
    epoch: { label: "DR", labelBefore: "BDR" }
  },
  currentDate: {
    year: 1492,
    month: 3,
    day: 15,
    isSpecialDay: false,
    specialDayIndex: null,
    specialDayOffset: null
  },
  domains: { ... },
  eventHistory: [ ... ],
  createdAt: "2024-01-15T...",
  updatedAt: "2024-01-20T..."
}
```

### Styling

The app uses CSS custom properties for a dark "Shadowdark" theme. Key variables in `index.css`:

```css
:root {
  /* Core colors */
  --sd-black: #1a1a1a;
  --sd-dark-gray: #2b2b2b;
  --sd-medium-gray: #4a4a4a;
  --sd-light-gray: #d0d0d0;
  --sd-white: #f5f5f5;
  --sd-accent: #8b0000;

  /* Special days (gold theme) */
  --sd-accent-text: #ffd700;
  --sd-special-day-bg: rgba(255, 215, 0, 0.1);

  /* Value indicators (income, growth, etc.) */
  --sd-positive: #90ee90;
  --sd-negative: #ef4444;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Mobile browsers are supported with responsive design.

## Domain Play Rules

Based on **BECMI D&D Rules Cyclopedia** adapted for Shadowdark RPG:
- Domain play starts at **4th level** (vs BECMI 9th)
- All costs converted with **0.4x multiplier**
- Shadowdark max level is **10th** (vs BECMI 36th)
- Confidence system (1-1000 scale)
- Event system (1d4 per year)

## License

This project's source code is licensed under the **MIT License** - see [LICENSE.md](LICENSE.md) for details.

**Content Notice**: Campaign Calendar is an independent product published under the Shadowdark RPG Third-Party License and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.

**Domain Rules**: Based on BECMI D&D Rules Cyclopedia by TSR/Wizards of the Coast

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- **Shadowdark RPG** by Kelsey Dionne / The Arcane Library
- **BECMI D&D Rules Cyclopedia** for domain play rules
- Fonts: Cinzel (headers), Crimson Text (body)
