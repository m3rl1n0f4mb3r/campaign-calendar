import React from 'react';
import { Badge } from 'react-bootstrap';

/**
 * CalendarDay - Individual day cell in the calendar grid
 * Shows day number, highlights current day (red border), selected day (grey bg), displays event indicators
 */
const CalendarDay = ({
  day,
  isCurrentDay,
  isSelected,
  isPreviousMonth,
  isNextMonth,
  events,
  onClick
}) => {
  const handleClick = () => {
    if (onClick && !isPreviousMonth && !isNextMonth) {
      onClick(day);
    }
  };

  const getCellStyle = () => {
    const baseStyle = {
      minHeight: 'clamp(60px, 15vw, 80px)',
      border: '1px solid var(--sd-border)',
      padding: 'clamp(0.25rem, 1vw, 0.5rem)',
      cursor: isPreviousMonth || isNextMonth ? 'default' : 'pointer',
      backgroundColor: 'var(--sd-card-bg)',
      position: 'relative',
      transition: 'all 0.2s'
    };

    if (isPreviousMonth || isNextMonth) {
      return {
        ...baseStyle,
        opacity: 0.3,
        cursor: 'default'
      };
    }

    // Current day - red border, darker background
    if (isCurrentDay) {
      return {
        ...baseStyle,
        backgroundColor: '#4a5568',
        border: '2px solid #8b0000',
        fontWeight: 'bold'
      };
    }

    // Selected day - grey highlight
    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(108, 117, 125, 0.2)',
        border: '1px solid rgba(108, 117, 125, 0.5)'
      };
    }

    return baseStyle;
  };

  const getDayNumberStyle = () => {
    const baseStyle = {
      fontSize: 'clamp(0.875rem, 3vw, 1.1rem)',
      marginBottom: '0.25rem'
    };

    if (isCurrentDay) {
      return {
        ...baseStyle,
        color: '#f5f5f5',
        fontWeight: 'bold'
      };
    }

    return baseStyle;
  };

  return (
    <div
      style={getCellStyle()}
      onClick={handleClick}
      className="calendar-day"
      onMouseEnter={(e) => {
        if (!isPreviousMonth && !isNextMonth) {
          e.currentTarget.style.backgroundColor = '#3a4048';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPreviousMonth && !isNextMonth) {
          if (isCurrentDay) {
            e.currentTarget.style.backgroundColor = '#4a5568';
          } else if (isSelected) {
            e.currentTarget.style.backgroundColor = 'rgba(108, 117, 125, 0.2)';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--sd-card-bg)';
          }
        }
      }}
    >
      <div style={getDayNumberStyle()}>
        {day}
      </div>

      {/* Event indicators */}
      {events && events.length > 0 && !isPreviousMonth && !isNextMonth && (
        <div style={{ position: 'absolute', bottom: '0.25rem', left: '0.25rem', right: '0.25rem' }}>
          <div className="d-flex gap-1 flex-wrap">
            {events.slice(0, 2).map((event, idx) => (
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
            {events.length > 2 && (
              <Badge bg="secondary" style={{
                fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)',
                padding: 'clamp(0.1rem, 0.5vw, 0.15rem) clamp(0.2rem, 0.75vw, 0.3rem)'
              }}>
                +{events.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
