import React from 'react';
import { Badge } from 'react-bootstrap';
import CalendarDay from './CalendarDay';
import {
  getDaysInMonth,
  getDaysPerWeek,
  getWeekdayName,
  getFirstDayOfMonth,
  getEventsByDate,
  getSpecialDaysAfterMonth,
  getSpecialDaysBeforeMonth,
  getEventsBySpecialDay
} from '../utils/dateUtils';

/**
 * CalendarGrid - Renders the month grid with dynamic week structure
 * Adapts to customizable week lengths (daysPerWeek from calendarConfig)
 */
const CalendarGrid = ({
  year,
  month,
  currentDate,
  calendarConfig,
  events,
  selectedDay,
  onDayClick
}) => {
  const daysPerWeek = getDaysPerWeek(calendarConfig);
  const daysInMonth = getDaysInMonth(month, year, calendarConfig);
  const firstDayOfWeek = getFirstDayOfMonth(year, month, calendarConfig);

  // Calculate previous and next month info for filling empty cells
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear, calendarConfig);

  // Build the calendar grid
  const weeks = [];
  let currentWeek = [];
  let dayCounter = 1;

  // Fill in days from previous month
  const daysFromPrevMonth = firstDayOfWeek - 1;
  for (let i = daysFromPrevMonth; i > 0; i--) {
    currentWeek.push({
      day: daysInPrevMonth - i + 1,
      isPreviousMonth: true,
      isNextMonth: false,
      isCurrentDay: false,
      events: []
    });
  }

  // Fill in current month days
  while (dayCounter <= daysInMonth) {
    const isCurrentDay =
      !currentDate.isSpecialDay &&
      currentDate.year === year &&
      currentDate.month === month &&
      currentDate.day === dayCounter;

    const isSelected = selectedDay === dayCounter;

    const dayEvents = getEventsByDate(events || [], year, month, dayCounter);

    currentWeek.push({
      day: dayCounter,
      isPreviousMonth: false,
      isNextMonth: false,
      isCurrentDay,
      isSelected,
      events: dayEvents
    });

    if (currentWeek.length === daysPerWeek) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    dayCounter++;
  }

  // Fill in days from next month to complete the final week
  let nextMonthDay = 1;
  while (currentWeek.length > 0 && currentWeek.length < daysPerWeek) {
    currentWeek.push({
      day: nextMonthDay,
      isPreviousMonth: false,
      isNextMonth: true,
      isCurrentDay: false,
      events: []
    });
    nextMonthDay++;
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get special days that occur before and after this month
  const specialDaysBefore = getSpecialDaysBeforeMonth(month, calendarConfig);
  const specialDaysAfter = getSpecialDaysAfterMonth(month, calendarConfig);

  // Helper function to render special day section
  const renderSpecialDaySection = (specialDay, sdIdx, isBefore = false) => {
    const specialDayIndex = calendarConfig.specialDays.indexOf(specialDay);
    const specialDayDays = [];

    for (let offset = 1; offset <= specialDay.duration; offset++) {
      const isCurrentDay =
        currentDate.isSpecialDay &&
        currentDate.specialDayIndex === specialDayIndex &&
        currentDate.specialDayOffset === offset;

      const dayEvents = getEventsBySpecialDay(events || [], year, specialDayIndex, offset);

      specialDayDays.push({
        offset,
        isCurrentDay,
        events: dayEvents
      });
    }

    return (
      <div
        key={`special-${isBefore ? 'before' : 'after'}-${sdIdx}`}
        style={{
          marginTop: isBefore ? '0' : (sdIdx === 0 ? '1.5rem' : '1rem'),
          marginBottom: isBefore ? '1.5rem' : (sdIdx < specialDaysAfter.length - 1 ? '1rem' : '0')
        }}
      >
        {/* Special Day Header */}
        <div
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '0.5rem',
            backgroundColor: 'var(--sd-accent-bg)',
            border: '2px solid var(--sd-accent-border)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
            color: 'var(--sd-accent-text)',
            fontStyle: 'italic'
          }}
        >
          <i className="fas fa-star me-2"></i>
          {specialDay.name}
          <i className="fas fa-star ms-2"></i>
        </div>

        {/* Special Day Grid (no weekday headers) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(daysPerWeek, specialDay.duration)}, 1fr)`,
            gap: '2px'
          }}
        >
          {specialDayDays.map((dayInfo) => (
            <div
              key={dayInfo.offset}
              style={{
                border: '2px solid var(--sd-accent-border)',
                borderRadius: '4px',
                padding: '0.5rem',
                minHeight: '80px',
                backgroundColor: dayInfo.isCurrentDay
                  ? 'var(--sd-current-day-bg)'
                  : 'var(--sd-special-day-bg, rgba(255, 215, 0, 0.1))',
                cursor: 'default',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                  color: 'var(--sd-accent-text)',
                  marginBottom: '0.25rem'
                }}
              >
                Day {dayInfo.offset}
              </div>

              {dayInfo.isCurrentDay && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '0.75rem',
                    color: 'var(--sd-accent-text)'
                  }}
                >
                  <i className="fas fa-dot-circle"></i>
                </div>
              )}

              {dayInfo.events.length > 0 && (
                <div style={{ position: 'absolute', bottom: '0.25rem', left: '0.25rem', right: '0.25rem' }}>
                  <div className="d-flex gap-1 flex-wrap">
                    {dayInfo.events.slice(0, 2).map((event, idx) => (
                      <Badge
                        key={idx}
                        bg={event.disaster ? 'danger' : 'info'}
                        style={{
                          fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)',
                          padding: 'clamp(0.1rem, 0.5vw, 0.15rem) clamp(0.2rem, 0.75vw, 0.3rem)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                        title={event.name}
                      >
                        <span className="d-none d-sm-inline">
                          {event.type === 'Natural' && <i className="fas fa-tree me-1"></i>}
                          {event.type === 'Unnatural' && <i className="fas fa-skull me-1"></i>}
                          {event.type === 'Scheduled' && <i className="fas fa-calendar me-1"></i>}
                          {event.name.length > 10 ? event.name.substring(0, 10) + '...' : event.name}
                        </span>
                        <span className="d-inline d-sm-none">
                          {event.type === 'Natural' && <i className="fas fa-tree"></i>}
                          {event.type === 'Unnatural' && <i className="fas fa-skull"></i>}
                          {event.type === 'Scheduled' && <i className="fas fa-calendar"></i>}
                        </span>
                      </Badge>
                    ))}
                    {dayInfo.events.length > 2 && (
                      <Badge bg="secondary" style={{
                        fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)',
                        padding: 'clamp(0.1rem, 0.5vw, 0.15rem) clamp(0.2rem, 0.75vw, 0.3rem)'
                      }}>
                        +{dayInfo.events.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Special Days ("Out of Time" periods before this month) */}
      {specialDaysBefore.map((specialDay, sdIdx) => renderSpecialDaySection(specialDay, sdIdx, true))}

      {/* Weekday headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${daysPerWeek}, 1fr)`,
          gap: '2px',
          marginBottom: '0.5rem'
        }}
      >
        {Array.from({ length: daysPerWeek }, (_, i) => {
          const fullName = getWeekdayName(i + 1, calendarConfig);
          const abbrev = fullName.substring(0, 3);
          return (
            <div
              key={i}
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                padding: '0.25rem',
                backgroundColor: 'var(--sd-header-bg)',
                border: '1px solid var(--sd-border)',
                fontSize: 'clamp(0.625rem, 2vw, 0.875rem)',
                color: 'var(--sd-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={fullName}
            >
              <span className="d-none d-md-inline">{fullName}</span>
              <span className="d-inline d-md-none">{abbrev}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div>
        {weeks.map((week, weekIdx) => (
          <div
            key={weekIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${daysPerWeek}, 1fr)`,
              gap: '2px'
            }}
          >
            {week.map((dayInfo, dayIdx) => (
              <CalendarDay
                key={dayIdx}
                day={dayInfo.day}
                isCurrentDay={dayInfo.isCurrentDay}
                isSelected={dayInfo.isSelected}
                isPreviousMonth={dayInfo.isPreviousMonth}
                isNextMonth={dayInfo.isNextMonth}
                events={dayInfo.events}
                onClick={onDayClick}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Special Days ("Out of Time" periods after this month) */}
      {specialDaysAfter.map((specialDay, sdIdx) => renderSpecialDaySection(specialDay, sdIdx))}
    </div>
  );
};

export default CalendarGrid;
