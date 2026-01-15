import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { formatDate, getNextMonth, getPreviousMonth } from '../utils/dateUtils';

/**
 * DateNavigator - Compact date navigation controls
 * Shows current date and provides Previous/Next day/month buttons
 */
const DateNavigator = ({
  currentDate,
  calendarConfig,
  onAdvanceDay,
  onPreviousDay,
  onAdvanceMonth,
  onSetDate
}) => {
  const handlePreviousDay = () => {
    onPreviousDay();
  };

  const handleNextDay = () => {
    onAdvanceDay();
  };

  const handlePreviousMonth = () => {
    const prevMonth = getPreviousMonth(currentDate, calendarConfig);
    onSetDate(prevMonth);
  };

  const handleNextMonth = () => {
    onAdvanceMonth();
  };

  return (
    <div className="date-navigator d-flex align-items-center gap-3">
      <div className="current-date">
        <strong>{formatDate(currentDate, calendarConfig)}</strong>
      </div>

      <ButtonGroup size="sm">
        <Button
          variant="outline-secondary"
          onClick={handlePreviousDay}
          title="Previous Day"
        >
          <i className="fas fa-chevron-left"></i> Day
        </Button>
        <Button
          variant="outline-secondary"
          onClick={handleNextDay}
          title="Next Day"
        >
          Day <i className="fas fa-chevron-right"></i>
        </Button>
      </ButtonGroup>

      <ButtonGroup size="sm">
        <Button
          variant="outline-secondary"
          onClick={handlePreviousMonth}
          title="Previous Month"
        >
          <i className="fas fa-chevron-left"></i> Month
        </Button>
        <Button
          variant="outline-secondary"
          onClick={handleNextMonth}
          title="Next Month"
        >
          Month <i className="fas fa-chevron-right"></i>
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default DateNavigator;
