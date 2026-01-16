import React, { useState, useEffect } from 'react';
import { Card, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import CalendarGrid from './CalendarGrid';
import { getPreviousMonth, getNextMonth, formatYear } from '../utils/dateUtils';

// Helper to determine which month to display when in a special day period
const getDisplayMonth = (date, calendarConfig) => {
  if (!date.isSpecialDay) {
    return { year: date.year, month: date.month };
  }

  // Special day - determine anchor month
  const specialDay = calendarConfig.specialDays?.[date.specialDayIndex];
  if (!specialDay) {
    return { year: date.year, month: 1 }; // Fallback
  }

  if (specialDay.position === 'after') {
    // Display the month that the special day comes after
    return { year: date.year, month: specialDay.anchorMonth };
  } else {
    // Display the anchor month (the month that the special day comes before)
    return { year: date.year, month: specialDay.anchorMonth };
  }
};

/**
 * CalendarView - Main calendar interface
 * Displays month grid, provides month navigation, handles day selection
 *
 * Distinction:
 * - campaign.currentDate: The campaign timeline "now" (controlled by DateNavigator)
 * - viewingDate: What month the calendar is displaying (can be different)
 */
const CalendarView = ({
  campaign,
  onSetDate,
  onAdvanceMonth,
  onAdvanceDay,
  onPreviousDay
}) => {
  const [viewingDate, setViewingDate] = useState(() =>
    getDisplayMonth(campaign.currentDate, campaign.calendarConfig)
  );
  const [selectedDay, setSelectedDay] = useState(null);

  // Sync viewing date when campaign current date changes
  useEffect(() => {
    const displayMonth = getDisplayMonth(campaign.currentDate, campaign.calendarConfig);
    setViewingDate(displayMonth);
  }, [campaign.currentDate, campaign.calendarConfig]);

  const handlePreviousMonth = () => {
    const prevMonth = getPreviousMonth(
      { ...viewingDate, day: 1, isSpecialDay: false },
      campaign.calendarConfig
    );
    setViewingDate({ year: prevMonth.year, month: prevMonth.month });
  };

  const handleNextMonth = () => {
    const nextMonth = getNextMonth(
      { ...viewingDate, day: 1, isSpecialDay: false },
      campaign.calendarConfig
    );
    setViewingDate({ year: nextMonth.year, month: nextMonth.month });
  };

  const handleTodayClick = () => {
    const displayMonth = getDisplayMonth(campaign.currentDate, campaign.calendarConfig);
    setViewingDate(displayMonth);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    // Future: could open event modal or sidebar here
  };

  const monthName = campaign.calendarConfig.monthNames[viewingDate.month - 1];

  // Determine if we're viewing the "current" month (or the month that contains the current special day)
  const currentDisplayMonth = getDisplayMonth(campaign.currentDate, campaign.calendarConfig);
  const isViewingCurrentMonth =
    viewingDate.year === currentDisplayMonth.year &&
    viewingDate.month === currentDisplayMonth.month;

  const handlePreviousDay = () => {
    onPreviousDay();
  };

  const handleNextDay = () => {
    onAdvanceDay();
  };

  const handlePreviousCampaignMonth = () => {
    const prevMonth = getPreviousMonth(campaign.currentDate, campaign.calendarConfig);
    onSetDate(prevMonth);
  };

  const handleNextCampaignMonth = () => {
    onAdvanceMonth();
  };

  return (
    <>
      <Card style={{
        backgroundColor: 'var(--sd-card-bg)',
        border: '1px solid var(--sd-border)'
      }}>
      <Card.Header style={{
        backgroundColor: 'var(--sd-header-bg)',
        borderBottom: '1px solid var(--sd-border)'
      }}>
        <Row className="align-items-center g-2">
          <Col xs={12} md="auto" className="mb-2 mb-md-0">
            <h4 className="mb-0" style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}>
              {monthName}, {formatYear(viewingDate.year, campaign.calendarConfig)}
            </h4>
          </Col>
          <Col xs={12} md="auto" className="ms-md-auto">
            <div className="d-flex flex-wrap gap-1 gap-md-2 justify-content-center justify-content-md-end">
              {/* Campaign Timeline Controls */}
              <ButtonGroup size="sm">
                <Button
                  variant="outline-secondary"
                  onClick={handlePreviousDay}
                  title="Previous Day (Campaign Timeline)"
                >
                  <i className="fas fa-chevron-left"></i>
                  <span className="d-none d-sm-inline"> Day</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleNextDay}
                  title="Next Day (Campaign Timeline)"
                >
                  <span className="d-none d-sm-inline">Day </span>
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </ButtonGroup>

              <ButtonGroup size="sm">
                <Button
                  variant="outline-secondary"
                  onClick={handlePreviousCampaignMonth}
                  title="Previous Month (Campaign Timeline)"
                >
                  <i className="fas fa-chevron-left"></i>
                  <span className="d-none d-sm-inline"> Mo</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleNextCampaignMonth}
                  title="Next Month (Campaign Timeline)"
                >
                  <span className="d-none d-sm-inline">Mo </span>
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </ButtonGroup>

              {/* Calendar View Controls */}
              <ButtonGroup size="sm">
                <Button
                  variant="outline-secondary"
                  onClick={handlePreviousMonth}
                  title="View Previous Month"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <Button
                  variant={isViewingCurrentMonth ? "secondary" : "outline-info"}
                  onClick={handleTodayClick}
                  disabled={isViewingCurrentMonth}
                  title="Go to Current Month"
                >
                  <span className="d-none d-sm-inline">Current</span>
                  <i className="fas fa-dot-circle d-inline d-sm-none"></i>
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleNextMonth}
                  title="View Next Month"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Row>
      </Card.Header>

        <Card.Body>
          <CalendarGrid
            year={viewingDate.year}
            month={viewingDate.month}
            currentDate={campaign.currentDate}
            calendarConfig={campaign.calendarConfig}
            events={campaign.eventHistory}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
          />

          {selectedDay && (
            <div className="mt-3 p-2" style={{
              backgroundColor: 'rgba(108, 117, 125, 0.1)',
              border: '1px solid rgba(108, 117, 125, 0.3)',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              <i className="fas fa-mouse-pointer me-2"></i>
              <strong>Selected:</strong> {monthName} {selectedDay}, {formatYear(viewingDate.year, campaign.calendarConfig)}
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default CalendarView;
