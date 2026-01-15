/**
 * Date Utilities for Fantasy Calendar System
 * Supports customizable months, weeks, and "out of time" special days
 */

// ============================================================================
// BASIC DATE OPERATIONS
// ============================================================================

/**
 * Get the number of days in a given month
 */
export const getDaysInMonth = (month, year, calendarConfig) => {
  const numMonths = calendarConfig.monthNames?.length || 12;
  if (month < 1 || month > numMonths) return 0;
  return calendarConfig.daysPerMonth[month - 1];
};

/**
 * Check if a date is valid according to the calendar config
 */
export const isValidDate = (year, month, day, calendarConfig) => {
  // Allow any year including 0 and negative (for BC/AD style calendars)
  const numMonths = calendarConfig.monthNames?.length || 12;
  if (month < 1 || month > numMonths) return false;
  const daysInMonth = getDaysInMonth(month, year, calendarConfig);
  return day >= 1 && day <= daysInMonth;
};

/**
 * Compare two dates (-1 if date1 < date2, 0 if equal, 1 if date1 > date2)
 */
export const compareDates = (date1, date2) => {
  // Handle special days
  if (date1.isSpecialDay && !date2.isSpecialDay) {
    // Special days are positioned within the year flow
    // Need to compare based on their position
    // This is a simplified comparison - special days come after their anchor month
    if (date1.year !== date2.year) return date1.year - date2.year;
    // For same year, need more complex logic based on anchor month
    return 1; // Simplified: assume special day comes later
  }

  if (!date1.isSpecialDay && date2.isSpecialDay) {
    return -1; // Simplified
  }

  if (date1.isSpecialDay && date2.isSpecialDay) {
    if (date1.year !== date2.year) return date1.year - date2.year;
    if (date1.specialDayIndex !== date2.specialDayIndex) {
      return date1.specialDayIndex - date2.specialDayIndex;
    }
    return date1.specialDayOffset - date2.specialDayOffset;
  }

  // Regular date comparison
  if (date1.year !== date2.year) return date1.year - date2.year;
  if (date1.month !== date2.month) return date1.month - date2.month;
  return date1.day - date2.day;
};

/**
 * Format year with era label (e.g., "15 DR", "42 BC", "2024 AD")
 */
export const formatYear = (year, calendarConfig) => {
  // Support both new epoch object structure and old separate fields (backward compatibility)
  const epoch = calendarConfig.epoch || {};
  const eraLabel = epoch.label || calendarConfig.eraLabel || 'AC';
  const eraLabelBefore = epoch.labelBefore || calendarConfig.eraLabelBefore;

  // If year is negative and there's a "before" era label (BC/AD style)
  if (eraLabelBefore && year < 0) {
    return `${Math.abs(year)} ${eraLabelBefore}`;
  }

  // Standard format: year + era label
  return `${year} ${eraLabel}`;
};

/**
 * Format a date as a readable string
 */
export const formatDate = (date, calendarConfig) => {
  const yearStr = formatYear(date.year, calendarConfig);

  if (date.isSpecialDay) {
    const specialDay = calendarConfig.specialDays[date.specialDayIndex];
    return `${specialDay.name}, Day ${date.specialDayOffset}, ${yearStr}`;
  }

  const monthName = calendarConfig.monthNames[date.month - 1];
  return `${monthName} ${date.day}, ${yearStr}`;
};

// ============================================================================
// WEEK CALCULATIONS
// ============================================================================

/**
 * Get the number of days per week from config
 */
export const getDaysPerWeek = (calendarConfig) => {
  return calendarConfig.daysPerWeek || 7;
};

/**
 * Get the name of a weekday (1-indexed)
 */
export const getWeekdayName = (dayOfWeek, calendarConfig) => {
  const daysPerWeek = getDaysPerWeek(calendarConfig);
  if (dayOfWeek < 1 || dayOfWeek > daysPerWeek) return '';
  return calendarConfig.weekdayNames[dayOfWeek - 1] || `Day ${dayOfWeek}`;
};

/**
 * Calculate which day of the week a month starts on
 * Returns 1-indexed day of week (1 = first day of week)
 */
export const getFirstDayOfMonth = (year, month, calendarConfig) => {
  const daysPerWeek = getDaysPerWeek(calendarConfig);
  const numMonths = calendarConfig.monthNames?.length || 12;

  // Count total days from year 1, month 1, day 1
  let totalDays = 0;

  // Add days from previous years
  // NOTE: Special days are NOT counted - they don't affect the weekly cycle
  for (let y = 1; y < year; y++) {
    for (let m = 1; m <= numMonths; m++) {
      totalDays += getDaysInMonth(m, y, calendarConfig);
    }
  }

  // Add days from previous months in current year
  // NOTE: Special days are NOT counted - they don't affect the weekly cycle
  for (let m = 1; m < month; m++) {
    totalDays += getDaysInMonth(m, year, calendarConfig);
  }

  // Calculate day of week (1-indexed)
  const startingWeekday = calendarConfig.startingWeekday || 1;
  return ((totalDays + startingWeekday - 1) % daysPerWeek) + 1;
};

/**
 * Calculate how many weeks a month spans
 */
export const getWeeksInMonth = (month, year, calendarConfig) => {
  const daysPerWeek = getDaysPerWeek(calendarConfig);
  const daysInMonth = getDaysInMonth(month, year, calendarConfig);
  const firstDay = getFirstDayOfMonth(year, month, calendarConfig);

  // Calculate how many calendar rows needed
  const daysBeforeMonth = firstDay - 1;
  const totalCells = daysBeforeMonth + daysInMonth;
  return Math.ceil(totalCells / daysPerWeek);
};

// ============================================================================
// SPECIAL DAY OPERATIONS
// ============================================================================

/**
 * Get all special days that come after a given month
 */
export const getSpecialDaysAfterMonth = (month, calendarConfig) => {
  if (!calendarConfig.specialDays) return [];

  return calendarConfig.specialDays.filter(sd =>
    sd.position === 'after' && sd.anchorMonth === month
  );
};

/**
 * Get all special days that come before a given month
 */
export const getSpecialDaysBeforeMonth = (month, calendarConfig) => {
  if (!calendarConfig.specialDays) return [];

  return calendarConfig.specialDays.filter(sd =>
    sd.position === 'before' && sd.anchorMonth === month
  );
};

/**
 * Check if a date is in a special day period
 */
export const isDateInSpecialPeriod = (date, calendarConfig) => {
  return date.isSpecialDay === true;
};

/**
 * Get information about a specific special day
 */
export const getSpecialDayInfo = (specialDayIndex, dayOffset, calendarConfig) => {
  const specialDay = calendarConfig.specialDays?.[specialDayIndex];
  if (!specialDay) return null;

  return {
    ...specialDay,
    dayOffset,
    isValid: dayOffset >= 1 && dayOffset <= specialDay.duration
  };
};

/**
 * Format a special day date
 */
export const formatSpecialDate = (specialDayIndex, dayOffset, year, calendarConfig) => {
  const specialDay = calendarConfig.specialDays?.[specialDayIndex];
  if (!specialDay) return 'Unknown Special Day';

  return `${specialDay.name}, Day ${dayOffset}, Year ${year}`;
};

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Advance a date by one day
 * Handles month boundaries, year boundaries, and special days
 */
export const advanceDate = (currentDate, calendarConfig) => {
  const newDate = { ...currentDate };
  const numMonths = calendarConfig.monthNames?.length || 12;

  // If in special day period
  if (currentDate.isSpecialDay) {
    const specialDay = calendarConfig.specialDays[currentDate.specialDayIndex];

    // If not at end of special day period, increment day
    if (currentDate.specialDayOffset < specialDay.duration) {
      newDate.specialDayOffset = currentDate.specialDayOffset + 1;
      return newDate;
    }

    // End of special day period - move to next regular day
    newDate.isSpecialDay = false;
    newDate.specialDayIndex = null;
    newDate.specialDayOffset = null;

    // Determine where to go next
    if (specialDay.position === 'after') {
      // After month - go to next month
      if (specialDay.anchorMonth === numMonths) {
        // After last month - new year
        newDate.year = currentDate.year + 1;
        newDate.month = 1;
        newDate.day = 1;
      } else {
        newDate.month = specialDay.anchorMonth + 1;
        newDate.day = 1;
      }
    } else {
      // Before month - go to anchor month
      newDate.month = specialDay.anchorMonth;
      newDate.day = 1;
    }

    return newDate;
  }

  // Regular day - check if at end of month
  const daysInMonth = getDaysInMonth(currentDate.month, currentDate.year, calendarConfig);

  if (currentDate.day < daysInMonth) {
    // Still within month
    newDate.day = currentDate.day + 1;
    return newDate;
  }

  // End of month - check for special days after this month OR before next month
  const specialDaysAfter = getSpecialDaysAfterMonth(currentDate.month, calendarConfig);

  if (specialDaysAfter.length > 0) {
    // Enter first special day period after this month
    const specialDay = specialDaysAfter[0];
    const specialDayIndex = calendarConfig.specialDays.indexOf(specialDay);

    newDate.isSpecialDay = true;
    newDate.specialDayIndex = specialDayIndex;
    newDate.specialDayOffset = 1;
    newDate.month = null;
    newDate.day = null;
    return newDate;
  }

  // Check for special days before the NEXT month
  const nextMonth = currentDate.month === numMonths ? 1 : currentDate.month + 1;
  const specialDaysBeforeNext = getSpecialDaysBeforeMonth(nextMonth, calendarConfig);

  if (specialDaysBeforeNext.length > 0) {
    // Enter first special day period before next month
    const specialDay = specialDaysBeforeNext[0];
    const specialDayIndex = calendarConfig.specialDays.indexOf(specialDay);

    newDate.isSpecialDay = true;
    newDate.specialDayIndex = specialDayIndex;
    newDate.specialDayOffset = 1;
    newDate.month = null;
    newDate.day = null;
    // Adjust year if crossing year boundary
    if (currentDate.month === numMonths && nextMonth === 1) {
      newDate.year = currentDate.year + 1;
    }
    return newDate;
  }

  // No special days - advance to next month
  if (currentDate.month === numMonths) {
    // End of year
    newDate.year = currentDate.year + 1;
    newDate.month = 1;
  } else {
    newDate.month = currentDate.month + 1;
  }
  newDate.day = 1;

  return newDate;
};

/**
 * Go back one day
 * Handles month boundaries, year boundaries, and special days
 */
export const previousDate = (currentDate, calendarConfig) => {
  const newDate = { ...currentDate };
  const numMonths = calendarConfig.monthNames?.length || 12;

  // If in special day period
  if (currentDate.isSpecialDay) {
    // If not at start of special day period, decrement day
    if (currentDate.specialDayOffset > 1) {
      newDate.specialDayOffset = currentDate.specialDayOffset - 1;
      return newDate;
    }

    // At start of special day period - move to previous regular day
    const specialDay = calendarConfig.specialDays[currentDate.specialDayIndex];
    newDate.isSpecialDay = false;
    newDate.specialDayIndex = null;
    newDate.specialDayOffset = null;

    // Determine where to go
    if (specialDay.position === 'before') {
      // Before month - go to end of previous month
      newDate.month = specialDay.anchorMonth - 1;
      if (newDate.month < 1) {
        newDate.month = numMonths;
        newDate.year = currentDate.year - 1;
      }
      newDate.day = getDaysInMonth(newDate.month, newDate.year, calendarConfig);
    } else {
      // After month - go to last day of anchor month
      newDate.month = specialDay.anchorMonth;
      newDate.day = getDaysInMonth(specialDay.anchorMonth, currentDate.year, calendarConfig);
    }

    return newDate;
  }

  // Regular day - check if at start of month
  if (currentDate.day > 1) {
    // Still within month
    newDate.day = currentDate.day - 1;
    return newDate;
  }

  // Start of month (day 1) - check for special days before this month OR after previous month
  const specialDaysBefore = getSpecialDaysBeforeMonth(currentDate.month, calendarConfig);

  if (specialDaysBefore.length > 0) {
    // Enter last day of last special day period before this month
    const specialDay = specialDaysBefore[specialDaysBefore.length - 1];
    const specialDayIndex = calendarConfig.specialDays.indexOf(specialDay);

    newDate.isSpecialDay = true;
    newDate.specialDayIndex = specialDayIndex;
    newDate.specialDayOffset = specialDay.duration;
    newDate.month = null;
    newDate.day = null;
    return newDate;
  }

  // Check for special days after the PREVIOUS month
  const prevMonth = currentDate.month === 1 ? numMonths : currentDate.month - 1;
  const specialDaysAfterPrev = getSpecialDaysAfterMonth(prevMonth, calendarConfig);

  if (specialDaysAfterPrev.length > 0) {
    // Enter last day of last special day period after previous month
    const specialDay = specialDaysAfterPrev[specialDaysAfterPrev.length - 1];
    const specialDayIndex = calendarConfig.specialDays.indexOf(specialDay);

    newDate.isSpecialDay = true;
    newDate.specialDayIndex = specialDayIndex;
    newDate.specialDayOffset = specialDay.duration;
    newDate.month = null;
    newDate.day = null;
    // Adjust year if crossing year boundary backward
    if (currentDate.month === 1 && prevMonth === numMonths) {
      newDate.year = currentDate.year - 1;
    }
    return newDate;
  }

  // No special days - go to previous month
  if (currentDate.month === 1) {
    // Start of year - go to previous year (allow negative years)
    newDate.year = currentDate.year - 1;
    newDate.month = numMonths;
  } else {
    newDate.month = currentDate.month - 1;
  }
  newDate.day = getDaysInMonth(newDate.month, newDate.year, calendarConfig);

  return newDate;
};

/**
 * Advance a date by multiple days
 */
export const advanceDays = (currentDate, numDays, calendarConfig) => {
  let date = { ...currentDate };
  for (let i = 0; i < numDays; i++) {
    date = advanceDate(date, calendarConfig);
  }
  return date;
};

/**
 * Move to the first day of the next month
 */
export const getNextMonth = (currentDate, calendarConfig) => {
  const newDate = { ...currentDate };
  const numMonths = calendarConfig.monthNames?.length || 12;

  if (currentDate.isSpecialDay) {
    // In special day - figure out what month we're between
    const specialDay = calendarConfig.specialDays[currentDate.specialDayIndex];
    if (specialDay.position === 'after') {
      newDate.month = specialDay.anchorMonth === numMonths ? 1 : specialDay.anchorMonth + 1;
      if (specialDay.anchorMonth === numMonths) newDate.year = currentDate.year + 1;
    } else {
      newDate.month = specialDay.anchorMonth;
    }
    newDate.day = 1;
    newDate.isSpecialDay = false;
    newDate.specialDayIndex = null;
    newDate.specialDayOffset = null;
    return newDate;
  }

  // Regular month
  if (currentDate.month === numMonths) {
    newDate.year = currentDate.year + 1;
    newDate.month = 1;
  } else {
    newDate.month = currentDate.month + 1;
  }
  newDate.day = 1;

  return newDate;
};

/**
 * Move to the first day of the previous month
 */
export const getPreviousMonth = (currentDate, calendarConfig) => {
  const newDate = { ...currentDate };
  const numMonths = calendarConfig.monthNames?.length || 12;

  if (currentDate.isSpecialDay) {
    // In special day - go to the month before it
    const specialDay = calendarConfig.specialDays[currentDate.specialDayIndex];
    if (specialDay.position === 'before') {
      newDate.month = specialDay.anchorMonth === 1 ? numMonths : specialDay.anchorMonth - 1;
      if (specialDay.anchorMonth === 1) newDate.year = currentDate.year - 1;
    } else {
      newDate.month = specialDay.anchorMonth;
    }
    newDate.day = 1;
    newDate.isSpecialDay = false;
    newDate.specialDayIndex = null;
    newDate.specialDayOffset = null;
    return newDate;
  }

  // Regular month
  if (currentDate.month === 1) {
    // Allow negative years (no Math.max constraint)
    newDate.year = currentDate.year - 1;
    newDate.month = numMonths;
  } else {
    newDate.month = currentDate.month - 1;
  }
  newDate.day = 1;

  return newDate;
};

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

/**
 * Get all events that occur on a specific date
 */
export const getEventsByDate = (events, year, month, day) => {
  return events.filter(event =>
    event.date.year === year &&
    event.date.month === month &&
    event.date.day === day &&
    !event.date.isSpecialDay
  );
};

/**
 * Get all events in a specific month
 */
export const getEventsInMonth = (events, year, month) => {
  return events.filter(event =>
    event.date.year === year &&
    event.date.month === month &&
    !event.date.isSpecialDay
  );
};

/**
 * Get all events on a specific special day
 */
export const getEventsBySpecialDay = (events, year, specialDayIndex, specialDayOffset) => {
  return events.filter(event =>
    event.date.year === year &&
    event.date.isSpecialDay &&
    event.date.specialDayIndex === specialDayIndex &&
    event.date.specialDayOffset === specialDayOffset
  );
};

/**
 * Sort events by date (earliest first)
 */
export const sortEventsByDate = (events) => {
  return [...events].sort((a, b) => compareDates(a.date, b.date));
};

// ============================================================================
// DEFAULT CALENDAR CONFIG
// ============================================================================

/**
 * Get default calendar configuration (12 months, 28 days, 7-day weeks)
 */
export const getDefaultCalendarConfig = () => {
  return {
    monthNames: [
      'First Month',
      'Second Month',
      'Third Month',
      'Fourth Month',
      'Fifth Month',
      'Sixth Month',
      'Seventh Month',
      'Eighth Month',
      'Ninth Month',
      'Tenth Month',
      'Eleventh Month',
      'Twelfth Month'
    ],
    daysPerMonth: [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    daysPerWeek: 7,
    weekdayNames: [
      'First Day',
      'Second Day',
      'Third Day',
      'Fourth Day',
      'Fifth Day',
      'Sixth Day',
      'Seventh Day'
    ],
    startingWeekday: 1,
    specialDays: [],
    // Epoch/Era configuration
    epoch: {
      label: 'AC',  // Main era label (e.g., "AC", "DR", "AD")
      labelBefore: null  // Optional label for years before epoch (e.g., "BC" for BC/AD style)
    }
  };
};
