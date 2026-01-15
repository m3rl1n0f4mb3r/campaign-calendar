import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { formatYear, isValidDate } from '../utils/dateUtils';

function EventScheduler({ campaign, onAddEvent, onCancel }) {
  const [eventData, setEventData] = useState({
    name: '',
    type: 'Custom',
    category: 'campaign',
    notes: '',
    disaster: false,
    domainId: null,
    date: {
      year: campaign.currentDate.year,
      month: campaign.currentDate.month,
      day: campaign.currentDate.day,
      isSpecialDay: false,
      specialDayIndex: null,
      specialDayOffset: null
    }
  });

  const [validationError, setValidationError] = useState('');

  const domainList = campaign?.domains ? Object.values(campaign.domains) : [];
  const calendarConfig = campaign.calendarConfig;

  const handleDateChange = (field, value) => {
    let finalValue;
    if (value === '') {
      // Allow field to be empty while typing
      finalValue = null;
    } else {
      const parsed = parseInt(value, 10);
      finalValue = isNaN(parsed) ? 0 : parsed;
    }

    const newDate = {
      ...eventData.date,
      [field]: finalValue
    };
    setEventData({
      ...eventData,
      date: newDate
    });
  };

  const validateAndSubmit = () => {
    // Validate event name
    if (!eventData.name.trim()) {
      setValidationError('Event name is required');
      return;
    }

    let finalDate;

    if (eventData.date.isSpecialDay) {
      // Special day event
      if (eventData.date.specialDayIndex === null || eventData.date.specialDayOffset === null) {
        setValidationError('Please select a special day and offset');
        return;
      }

      const specialDay = calendarConfig.specialDays?.[eventData.date.specialDayIndex];
      if (!specialDay) {
        setValidationError('Invalid special day selected');
        return;
      }

      if (eventData.date.specialDayOffset < 1 || eventData.date.specialDayOffset > specialDay.duration) {
        setValidationError(`Day must be between 1 and ${specialDay.duration}`);
        return;
      }

      finalDate = {
        year: eventData.date.year ?? 1,
        month: null,
        day: null,
        isSpecialDay: true,
        specialDayIndex: eventData.date.specialDayIndex,
        specialDayOffset: eventData.date.specialDayOffset
      };
    } else {
      // Regular day event
      // Convert null date values to defaults
      finalDate = {
        year: eventData.date.year ?? 0,
        month: eventData.date.month ?? 1,
        day: eventData.date.day ?? 1,
        isSpecialDay: false,
        specialDayIndex: null,
        specialDayOffset: null
      };

      // Validate date
      if (!isValidDate(finalDate.year, finalDate.month, finalDate.day, calendarConfig)) {
        setValidationError('Invalid date for this calendar configuration');
        return;
      }
    }

    // Create event
    const selectedDomain = eventData.domainId ? campaign.domains[eventData.domainId] : null;

    const newEvent = {
      name: eventData.name,
      type: eventData.type,
      category: eventData.category,
      notes: eventData.notes,
      disaster: eventData.disaster,
      domainId: selectedDomain ? selectedDomain.id : null,
      domainName: selectedDomain ? selectedDomain.name : null,
      date: finalDate
    };

    onAddEvent(newEvent);

    // Reset form
    setEventData({
      name: '',
      type: 'Custom',
      category: 'campaign',
      notes: '',
      disaster: false,
      domainId: null,
      date: {
        year: campaign.currentDate.year,
        month: campaign.currentDate.month,
        day: campaign.currentDate.day,
        isSpecialDay: false,
        specialDayIndex: null,
        specialDayOffset: null
      }
    });
    setValidationError('');
  };

  const daysInSelectedMonth = calendarConfig.daysPerMonth[(eventData.date.month ?? 1) - 1] || 28;

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>
          <i className="fas fa-calendar-plus me-2"></i>
          Schedule New Event
        </h4>
      </Card.Header>
      <Card.Body>
        {validationError && (
          <Alert variant="danger" dismissible onClose={() => setValidationError('')}>
            {validationError}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Event Name *</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., Festival of the Sun, Dragon Attack, Treaty Signing"
            value={eventData.name}
            onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
            autoFocus
          />
        </Form.Group>

        <Row className="mb-3 g-2">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Event Type</Form.Label>
              <Form.Select
                value={eventData.type}
                onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
              >
                <option value="Custom">Custom</option>
                <option value="Natural">Natural</option>
                <option value="Unnatural">Unnatural</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={eventData.category}
                onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
              >
                <option value="campaign">Campaign-wide</option>
                <option value="domain">Domain Event</option>
                <option value="personal">Personal/Character</option>
                <option value="combat">Combat/Conflict</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {eventData.category === 'domain' && (
          domainList.length > 0 ? (
            <Form.Group className="mb-3">
              <Form.Label>Domain</Form.Label>
              <Form.Select
                value={eventData.domainId || ''}
                onChange={(e) => setEventData({ ...eventData, domainId: e.target.value || null })}
              >
                <option value="">Select a domain...</option>
                {domainList.map(domain => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name} - {domain.rulerName}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Specify which domain this event occurs in.
              </Form.Text>
            </Form.Group>
          ) : (
            <Alert variant="info" className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              No domains in this campaign yet. Create a domain first, or change the category to "Campaign-wide".
            </Alert>
          )
        )}

        <Form.Group className="mb-3">
          <Form.Label>Event Date *</Form.Label>

          {/* Toggle between Regular Day and Special Day */}
          {calendarConfig.specialDays && calendarConfig.specialDays.length > 0 && (
            <div className="mb-2">
              <Form.Check
                type="checkbox"
                id="special-day-toggle"
                label={
                  <>
                    <i className="fas fa-star me-1" style={{ color: 'var(--sd-accent-text)' }}></i>
                    <strong>Special Day (Festival/Holiday)</strong>
                  </>
                }
                checked={eventData.date.isSpecialDay}
                onChange={(e) => {
                  const isSpecial = e.target.checked;
                  setEventData({
                    ...eventData,
                    date: {
                      year: eventData.date.year,
                      month: isSpecial ? null : campaign.currentDate.month,
                      day: isSpecial ? null : campaign.currentDate.day,
                      isSpecialDay: isSpecial,
                      specialDayIndex: isSpecial ? (calendarConfig.specialDays.length > 0 ? 0 : null) : null,
                      specialDayOffset: isSpecial ? 1 : null
                    }
                  });
                }}
              />
            </div>
          )}

          {eventData.date.isSpecialDay ? (
            // Special Day inputs
            <Row className="g-2">
              <Col xs={12} sm={4}>
                <Form.Label className="small">Year</Form.Label>
                <Form.Control
                  type="number"
                  value={eventData.date.year ?? ''}
                  onChange={(e) => handleDateChange('year', e.target.value)}
                />
                <Form.Text className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                  {formatYear(eventData.date.year ?? 0, calendarConfig)}
                </Form.Text>
              </Col>
              <Col xs={12} sm={4}>
                <Form.Label className="small">Special Day</Form.Label>
                <Form.Select
                  value={eventData.date.specialDayIndex ?? ''}
                  onChange={(e) => {
                    const index = parseInt(e.target.value, 10);
                    setEventData({
                      ...eventData,
                      date: {
                        ...eventData.date,
                        specialDayIndex: isNaN(index) ? null : index,
                        specialDayOffset: 1 // Reset to day 1
                      }
                    });
                  }}
                >
                  {calendarConfig.specialDays.map((sd, index) => (
                    <option key={index} value={index}>
                      {sd.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} sm={4}>
                <Form.Label className="small">Day</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={
                    eventData.date.specialDayIndex !== null
                      ? calendarConfig.specialDays[eventData.date.specialDayIndex]?.duration || 1
                      : 1
                  }
                  value={eventData.date.specialDayOffset ?? ''}
                  onChange={(e) => {
                    const offset = parseInt(e.target.value, 10);
                    setEventData({
                      ...eventData,
                      date: {
                        ...eventData.date,
                        specialDayOffset: isNaN(offset) ? null : offset
                      }
                    });
                  }}
                />
                <Form.Text className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                  Max:{' '}
                  {eventData.date.specialDayIndex !== null
                    ? calendarConfig.specialDays[eventData.date.specialDayIndex]?.duration || 1
                    : 1}
                </Form.Text>
              </Col>
            </Row>
          ) : (
            // Regular Day inputs
            <Row className="g-2">
              <Col xs={12} sm={4}>
                <Form.Label className="small">Year</Form.Label>
                <Form.Control
                  type="number"
                  value={eventData.date.year ?? ''}
                  onChange={(e) => handleDateChange('year', e.target.value)}
                />
                <Form.Text className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                  {formatYear(eventData.date.year ?? 0, calendarConfig)}
                </Form.Text>
              </Col>
              <Col xs={12} sm={4}>
                <Form.Label className="small">Month</Form.Label>
                <Form.Select
                  value={eventData.date.month}
                  onChange={(e) => handleDateChange('month', e.target.value)}
                >
                  {calendarConfig.monthNames.map((name, index) => (
                    <option key={index + 1} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} sm={4}>
                <Form.Label className="small">Day</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={daysInSelectedMonth}
                  value={eventData.date.day ?? ''}
                  onChange={(e) => handleDateChange('day', e.target.value)}
                />
                <Form.Text className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                  Max: {daysInSelectedMonth}
                </Form.Text>
              </Col>
            </Row>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Additional details about this event..."
            value={eventData.notes}
            onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label={
              <>
                <strong>Disaster Event</strong>
                {eventData.disaster && (
                  <Badge bg="danger" className="ms-2">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    DISASTER
                  </Badge>
                )}
              </>
            }
            checked={eventData.disaster}
            onChange={(e) => setEventData({ ...eventData, disaster: e.target.checked })}
          />
          <Form.Text className="text-muted">
            Disasters require Confidence checks and may be prevented if Confidence ≥450
          </Form.Text>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="primary" onClick={validateAndSubmit}>
            <i className="fas fa-plus me-2"></i>
            Schedule Event
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default EventScheduler;
