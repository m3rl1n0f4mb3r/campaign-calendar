import React, { useState } from 'react';
import { Card, Button, Badge, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { formatYear } from '../utils/dateUtils';
import EventScheduler from './EventScheduler';
import EventListView from './EventListView';

function EventRoller({ campaign, onAddEvent, onAddMultipleEvents, onUpdateEvent, onDeleteEvent }) {
  const [currentRoll, setCurrentRoll] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showEventScheduler, setShowEventScheduler] = useState(false);

  const naturalEvents = [
    { name: 'Comet', chance: 30, disaster: false },
    { name: 'Death (Official/Ruler)', chance: 10, disaster: false },
    { name: 'Earthquake', chance: 10, disaster: true },
    { name: 'Explosion', chance: 10, disaster: false },
    { name: 'Fire, Minor', chance: 50, disaster: false },
    { name: 'Fire, Major', chance: 10, disaster: true },
    { name: 'Flood', chance: 30, disaster: false },
    { name: 'Hurricane', chance: 15, disaster: true },
    { name: 'Market Glut', chance: 20, disaster: false },
    { name: 'Market Shortage', chance: 25, disaster: false },
    { name: 'Meteor Strike', chance: 1, disaster: true },
    { name: 'Meteor Shower', chance: 20, disaster: false },
    { name: 'Plague', chance: 25, disaster: true },
    { name: 'Population Change', chance: 20, disaster: false },
    { name: 'Resource Lost', chance: 10, disaster: false },
    { name: 'Resource, New', chance: 10, disaster: false },
    { name: 'Sinkhole', chance: 5, disaster: false },
    { name: 'Storm', chance: 80, disaster: false },
    { name: 'Tornado', chance: 25, disaster: true },
    { name: 'Trade Route Lost', chance: 15, disaster: false },
    { name: 'Trade Route, New', chance: 15, disaster: false },
    { name: 'Volcano', chance: 2, disaster: true },
    { name: 'Waterspout', chance: 25, disaster: false },
    { name: 'Whirlpool', chance: 25, disaster: false }
  ];

  const unnaturalEvents = [
    { name: 'Assassination', chance: 10 },
    { name: 'Bandits', chance: 50 },
    { name: 'Birth in Ruling Family', chance: 20 },
    { name: 'Border Skirmish', chance: 40 },
    { name: 'Cultural Discovery', chance: 10 },
    { name: 'Fanatic Cult', chance: 10 },
    { name: 'Insurrection', chance: 10 },
    { name: 'Lycanthropy', chance: 15 },
    { name: 'Magical Happening', chance: 30 },
    { name: 'Migration', chance: 10 },
    { name: 'Pretender/Usurper', chance: 10 },
    { name: 'Raiders from Other Dominion', chance: 25 },
    { name: 'Rebellion (minor)', chance: 10 },
    { name: 'Resident Specialist, New', chance: 20 },
    { name: 'Spy Ring', chance: 60 },
    { name: 'Traitor', chance: 30 },
    { name: 'Accidental Death of Official', chance: 25 },
    { name: 'VIP Visitor', chance: 10 },
    { name: 'Wandering Monsters (20 HD+)', chance: 75 }
  ];

  const rollForEvent = (event) => {
    const roll = Math.floor(Math.random() * 100) + 1;
    return roll <= event.chance;
  };

  const rollAnnualEvents = () => {
    const numEvents = Math.floor(Math.random() * 4) + 1; // 1d4
    const newEvents = [];

    // Roll for each event type
    naturalEvents.forEach(event => {
      if (rollForEvent(event)) {
        newEvents.push({
          name: event.name,
          type: 'Natural',
          category: 'campaign',
          disaster: event.disaster,
          domainId: null,
          domainName: null,
          date: {
            year: campaign.currentDate.year,
            month: campaign.currentDate.month,
            day: campaign.currentDate.day
          }
        });
      }
    });

    unnaturalEvents.forEach(event => {
      if (rollForEvent(event)) {
        newEvents.push({
          name: event.name,
          type: 'Unnatural',
          category: 'campaign',
          disaster: false,
          domainId: null,
          domainName: null,
          date: {
            year: campaign.currentDate.year,
            month: campaign.currentDate.month,
            day: campaign.currentDate.day
          }
        });
      }
    });

    // Shuffle and take only the number rolled
    const shuffled = newEvents.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(numEvents, shuffled.length));

    setCurrentRoll(selected);
  };

  const rollSingleNatural = () => {
    const availableEvents = naturalEvents.filter(e => rollForEvent(e));
    if (availableEvents.length > 0) {
      const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      setCurrentRoll([{
        name: event.name,
        type: 'Natural',
        category: 'campaign',
        disaster: event.disaster,
        domainId: null,
        domainName: null,
        date: {
          year: campaign.currentDate.year,
          month: campaign.currentDate.month,
          day: campaign.currentDate.day
        }
      }]);
    } else {
      setCurrentRoll([{
        name: 'No events this period',
        type: 'None',
        category: 'campaign',
        disaster: false,
        domainId: null,
        domainName: null,
        date: {
          year: campaign.currentDate.year,
          month: campaign.currentDate.month,
          day: campaign.currentDate.day
        }
      }]);
    }
  };

  const rollSingleUnnatural = () => {
    const availableEvents = unnaturalEvents.filter(e => rollForEvent(e));
    if (availableEvents.length > 0) {
      const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      setCurrentRoll([{
        name: event.name,
        type: 'Unnatural',
        category: 'campaign',
        disaster: false,
        domainId: null,
        domainName: null,
        date: {
          year: campaign.currentDate.year,
          month: campaign.currentDate.month,
          day: campaign.currentDate.day
        }
      }]);
    } else {
      setCurrentRoll([{
        name: 'No events this period',
        type: 'None',
        category: 'campaign',
        disaster: false,
        domainId: null,
        domainName: null,
        date: {
          year: campaign.currentDate.year,
          month: campaign.currentDate.month,
          day: campaign.currentDate.day
        }
      }]);
    }
  };

  const updateEventDate = (index, field, value) => {
    const newRoll = [...currentRoll];
    let finalValue;

    if (value === '') {
      // Allow field to be empty while typing
      finalValue = null;
    } else {
      const parsed = parseInt(value, 10);
      finalValue = isNaN(parsed) ? (field === 'year' ? 0 : 1) : parsed;
    }

    newRoll[index] = {
      ...newRoll[index],
      date: {
        ...newRoll[index].date,
        [field]: finalValue
      }
    };
    setCurrentRoll(newRoll);
  };

  const toggleEventSpecialDay = (index, isSpecial) => {
    const newRoll = [...currentRoll];
    newRoll[index] = {
      ...newRoll[index],
      date: {
        year: newRoll[index].date.year,
        month: isSpecial ? null : campaign.currentDate.month,
        day: isSpecial ? null : campaign.currentDate.day,
        isSpecialDay: isSpecial,
        specialDayIndex: isSpecial ? (campaign.calendarConfig.specialDays?.length > 0 ? 0 : null) : null,
        specialDayOffset: isSpecial ? 1 : null
      }
    };
    setCurrentRoll(newRoll);
  };

  const updateEventSpecialDay = (index, field, value) => {
    const newRoll = [...currentRoll];
    const parsed = parseInt(value, 10);
    newRoll[index] = {
      ...newRoll[index],
      date: {
        ...newRoll[index].date,
        [field]: isNaN(parsed) ? null : parsed,
        // Reset offset to 1 when changing the special day period
        ...(field === 'specialDayIndex' ? { specialDayOffset: 1 } : {})
      }
    };
    setCurrentRoll(newRoll);
  };

  const updateEventCategory = (index, category) => {
    const newRoll = [...currentRoll];
    newRoll[index] = {
      ...newRoll[index],
      category: category
    };
    setCurrentRoll(newRoll);
  };

  const updateEventDomain = (index, domainId) => {
    const newRoll = [...currentRoll];
    const selectedDomain = domainId ? campaign.domains[domainId] : null;
    newRoll[index] = {
      ...newRoll[index],
      domainId: domainId || null,
      domainName: selectedDomain ? selectedDomain.name : null
    };
    setCurrentRoll(newRoll);
  };

  const saveEvents = () => {
    // Prepare all events with their full data (using each event's individual date, category, and domain)
    const eventsToAdd = currentRoll.map(event => ({
      ...event,
      notes: '',
      date: event.date.isSpecialDay
        ? {
            year: event.date.year ?? 1,
            month: null,
            day: null,
            isSpecialDay: true,
            specialDayIndex: event.date.specialDayIndex,
            specialDayOffset: event.date.specialDayOffset ?? 1
          }
        : {
            year: event.date.year ?? 0,
            month: event.date.month ?? 1,
            day: event.date.day ?? 1,
            isSpecialDay: false,
            specialDayIndex: null,
            specialDayOffset: null
          }
    }));

    // Use batch add if available, otherwise fall back to adding one at a time
    if (onAddMultipleEvents) {
      onAddMultipleEvents(eventsToAdd);
    } else {
      eventsToAdd.forEach(event => onAddEvent(event));
    }

    setCurrentRoll([]);
  };

  const handleEditClick = (event) => {
    setEditingEvent({ ...event });
  };

  const handleSaveEdit = () => {
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, {
        name: editingEvent.name,
        notes: editingEvent.notes || '',
        date: editingEvent.date,
        category: editingEvent.category,
        domainId: editingEvent.domainId,
        domainName: editingEvent.domainName
      });
      setEditingEvent(null);
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
    }
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  const getMonthName = (monthNum) => {
    if (!campaign.calendarConfig || !campaign.calendarConfig.monthNames) return `Month ${monthNum}`;
    return campaign.calendarConfig.monthNames[monthNum - 1] || `Month ${monthNum}`;
  };

  if (!campaign) {
    return null;
  }

  const eventHistory = campaign.eventHistory || [];
  const domainList = Object.values(campaign.domains || {});

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <h3><i className="fas fa-dice-d20 me-2"></i>Event Roller</h3>
        </Card.Header>
        <Card.Body>
          <div className="d-grid gap-2 mb-3">
            <Button variant="primary" size="lg" onClick={rollAnnualEvents}>
              <i className="fas fa-dice me-2"></i>
              <span className="d-none d-sm-inline">Roll Annual Events (1d4)</span>
              <span className="d-inline d-sm-none">Annual Events</span>
            </Button>
            <div className="row g-2">
              <div className="col-6">
                <Button variant="secondary" className="w-100" onClick={rollSingleNatural}>
                  <i className="fas fa-cloud-sun me-1 me-sm-2"></i>
                  <span className="d-none d-sm-inline">Roll Natural Event</span>
                  <span className="d-inline d-sm-none">Natural</span>
                </Button>
              </div>
              <div className="col-6">
                <Button variant="secondary" className="w-100" onClick={rollSingleUnnatural}>
                  <i className="fas fa-users me-1 me-sm-2"></i>
                  <span className="d-none d-sm-inline">Roll Unnatural Event</span>
                  <span className="d-inline d-sm-none">Unnatural</span>
                </Button>
              </div>
            </div>
          </div>

          {currentRoll.length > 0 && (
            <>
              <h5 className="mt-4 mb-3">
                <i className="fas fa-scroll me-2"></i>
                Current Roll ({currentRoll.length})
              </h5>

              {currentRoll.some(e => e.disaster) && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Disaster rolled!</strong> Requires a Confidence check.
                  If Confidence ≥450, 25% chance the disaster won't occur.
                </div>
              )}

              <h6 className="mb-2">Schedule Each Event</h6>
              {currentRoll.map((event, idx) => (
                <div key={idx} className="mb-3 p-3" style={{
                  border: '1px solid var(--sd-border)',
                  borderRadius: '4px',
                  backgroundColor: event.disaster ? 'rgba(220, 53, 69, 0.05)' : 'transparent'
                }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>{event.name}</strong>
                      <div className="mt-1">
                        <Badge bg={event.type === 'Natural' ? 'success' : 'info'} className="me-2">
                          {event.type}
                        </Badge>
                        {event.disaster && (
                          <Badge bg="danger">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            DISASTER
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Row className="mt-2 mb-2 g-2">
                    <Col xs={12} md={domainList.length > 0 && event.category === 'domain' ? 6 : 12}>
                      <Form.Label className="small">Category</Form.Label>
                      <Form.Select
                        size="sm"
                        value={event.category || 'campaign'}
                        onChange={(e) => updateEventCategory(idx, e.target.value)}
                      >
                        <option value="campaign">Campaign-wide</option>
                        <option value="domain">Domain Event</option>
                        <option value="personal">Personal/Character</option>
                        <option value="combat">Combat/Conflict</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Col>
                    {domainList.length > 0 && event.category === 'domain' && (
                      <Col xs={12} md={6}>
                        <Form.Label className="small">Domain</Form.Label>
                        <Form.Select
                          size="sm"
                          value={event.domainId || ''}
                          onChange={(e) => updateEventDomain(idx, e.target.value)}
                        >
                          <option value="">Select a domain...</option>
                          {domainList.map(domain => (
                            <option key={domain.id} value={domain.id}>
                              {domain.name} - {domain.rulerName}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    )}
                  </Row>
                  {domainList.length === 0 && event.category === 'domain' && (
                    <Alert variant="info" className="mb-2 py-2" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                      <i className="fas fa-info-circle me-1"></i>
                      No domains available. Create a domain or change category to "Campaign-wide".
                    </Alert>
                  )}

                  {/* Special Day Toggle */}
                  {campaign.calendarConfig.specialDays && campaign.calendarConfig.specialDays.length > 0 && (
                    <div className="mb-2">
                      <Form.Check
                        type="checkbox"
                        id={`special-day-toggle-${idx}`}
                        label={
                          <small>
                            <i className="fas fa-star me-1" style={{ color: 'var(--sd-accent-text)' }}></i>
                            <strong>Special Day (Festival/Holiday)</strong>
                          </small>
                        }
                        checked={event.date.isSpecialDay || false}
                        onChange={(e) => toggleEventSpecialDay(idx, e.target.checked)}
                      />
                    </div>
                  )}

                  {event.date.isSpecialDay ? (
                    // Special Day inputs
                    <Row className="g-2">
                      <Col xs={12} sm={4} md={4}>
                        <Form.Label className="small">Year</Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={event.date.year ?? ''}
                          onChange={(e) => updateEventDate(idx, 'year', e.target.value)}
                        />
                      </Col>
                      <Col xs={12} sm={4} md={4}>
                        <Form.Label className="small">Special Day</Form.Label>
                        <Form.Select
                          size="sm"
                          value={event.date.specialDayIndex ?? 0}
                          onChange={(e) => updateEventSpecialDay(idx, 'specialDayIndex', e.target.value)}
                        >
                          {campaign.calendarConfig.specialDays.map((sd, index) => (
                            <option key={index} value={index}>
                              {sd.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={12} sm={4} md={4}>
                        <Form.Label className="small">Day</Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          min="1"
                          max={
                            event.date.specialDayIndex !== null && event.date.specialDayIndex !== undefined
                              ? campaign.calendarConfig.specialDays[event.date.specialDayIndex]?.duration || 1
                              : 1
                          }
                          value={event.date.specialDayOffset ?? 1}
                          onChange={(e) => updateEventSpecialDay(idx, 'specialDayOffset', e.target.value)}
                        />
                      </Col>
                    </Row>
                  ) : (
                    // Regular Day inputs
                    <Row className="g-2">
                      <Col xs={12} sm={4} md={4}>
                        <Form.Label className="small">Year</Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={event.date.year ?? ''}
                          onChange={(e) => updateEventDate(idx, 'year', e.target.value)}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                          {formatYear(event.date.year ?? 0, campaign.calendarConfig)}
                        </Form.Text>
                      </Col>
                      <Col xs={12} sm={4} md={4}>
                        <Form.Label className="small">Month</Form.Label>
                        <Form.Select
                          size="sm"
                          value={event.date.month}
                          onChange={(e) => updateEventDate(idx, 'month', e.target.value)}
                        >
                          {campaign.calendarConfig.monthNames.map((name, index) => (
                            <option key={index + 1} value={index + 1}>
                              {name}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={12} sm={4} md={4}>
                        <Form.Label className="small">Day</Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          min="1"
                          max={campaign.calendarConfig.daysPerMonth[(event.date.month ?? 1) - 1] || 28}
                          value={event.date.day ?? ''}
                          onChange={(e) => updateEventDate(idx, 'day', e.target.value)}
                        />
                      </Col>
                    </Row>
                  )}
                </div>
              ))}

              <div className="text-center">
                <Button variant="success" onClick={saveEvents}>
                  <i className="fas fa-save me-2"></i>
                  Save {currentRoll.length} Event{currentRoll.length !== 1 ? 's' : ''} to History
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <EventListView
        campaign={campaign}
        events={eventHistory}
        onEditEvent={handleEditClick}
        onDeleteEvent={handleDeleteClick}
      />

      {/* Edit Event Modal */}
      <Modal show={!!editingEvent} onHide={() => setEditingEvent(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingEvent && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editingEvent.notes || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  placeholder="Add additional notes about this event..."
                />
              </Form.Group>

              <Row className="mb-3 g-2">
                <Col xs={12} md={domainList.length > 0 && editingEvent.category === 'domain' ? 6 : 12}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={editingEvent.category || 'campaign'}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        category: e.target.value
                      })}
                    >
                      <option value="campaign">Campaign-wide</option>
                      <option value="domain">Domain Event</option>
                      <option value="personal">Personal/Character</option>
                      <option value="combat">Combat/Conflict</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {domainList.length > 0 && editingEvent.category === 'domain' && (
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label>Domain</Form.Label>
                      <Form.Select
                        value={editingEvent.domainId || ''}
                        onChange={(e) => {
                          const selectedDomain = e.target.value ? campaign.domains[e.target.value] : null;
                          setEditingEvent({
                            ...editingEvent,
                            domainId: e.target.value || null,
                            domainName: selectedDomain ? selectedDomain.name : null
                          });
                        }}
                      >
                        <option value="">Select a domain...</option>
                        {domainList.map(domain => (
                          <option key={domain.id} value={domain.id}>
                            {domain.name} - {domain.rulerName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
              </Row>
              {domainList.length === 0 && editingEvent.category === 'domain' && (
                <Alert variant="info" className="mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  No domains available. Create a domain or change category to "Campaign-wide".
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Event Date</Form.Label>

                {/* Toggle between Regular Day and Special Day */}
                {campaign.calendarConfig.specialDays && campaign.calendarConfig.specialDays.length > 0 && (
                  <div className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id="special-day-toggle-roller"
                      label={
                        <>
                          <i className="fas fa-star me-1" style={{ color: 'var(--sd-accent-text)' }}></i>
                          <strong>Special Day (Festival/Holiday)</strong>
                        </>
                      }
                      checked={editingEvent.date?.isSpecialDay || false}
                      onChange={(e) => {
                        const isSpecial = e.target.checked;
                        setEditingEvent({
                          ...editingEvent,
                          date: {
                            year: editingEvent.date?.year || campaign.currentDate.year,
                            month: isSpecial ? null : (editingEvent.date?.month || campaign.currentDate.month),
                            day: isSpecial ? null : (editingEvent.date?.day || campaign.currentDate.day),
                            isSpecialDay: isSpecial,
                            specialDayIndex: isSpecial ? (campaign.calendarConfig.specialDays.length > 0 ? 0 : null) : null,
                            specialDayOffset: isSpecial ? 1 : null
                          }
                        });
                      }}
                    />
                  </div>
                )}

                {editingEvent.date?.isSpecialDay ? (
                  // Special Day inputs
                  <Row className="g-2">
                    <Col xs={12} sm={4}>
                      <Form.Label className="small">Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={editingEvent.date?.year ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const parsed = value === '' ? null : parseInt(value, 10);
                          setEditingEvent({
                            ...editingEvent,
                            date: {
                              ...editingEvent.date,
                              year: parsed
                            }
                          });
                        }}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Label className="small">Special Day</Form.Label>
                      <Form.Select
                        value={editingEvent.date?.specialDayIndex ?? ''}
                        onChange={(e) => {
                          const index = parseInt(e.target.value, 10);
                          setEditingEvent({
                            ...editingEvent,
                            date: {
                              ...editingEvent.date,
                              specialDayIndex: isNaN(index) ? null : index,
                              specialDayOffset: 1 // Reset to day 1
                            }
                          });
                        }}
                      >
                        {campaign.calendarConfig.specialDays.map((sd, index) => (
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
                          editingEvent.date?.specialDayIndex !== null && editingEvent.date?.specialDayIndex !== undefined
                            ? campaign.calendarConfig.specialDays[editingEvent.date.specialDayIndex]?.duration || 1
                            : 1
                        }
                        value={editingEvent.date?.specialDayOffset ?? ''}
                        onChange={(e) => {
                          const offset = parseInt(e.target.value, 10);
                          setEditingEvent({
                            ...editingEvent,
                            date: {
                              ...editingEvent.date,
                              specialDayOffset: isNaN(offset) ? null : offset
                            }
                          });
                        }}
                      />
                    </Col>
                  </Row>
                ) : (
                  // Regular Day inputs
                  <Row className="g-2">
                    <Col xs={12} sm={4}>
                      <Form.Label className="small">Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={editingEvent.date?.year ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const parsed = value === '' ? null : parseInt(value, 10);
                          setEditingEvent({
                            ...editingEvent,
                            date: {
                              ...editingEvent.date,
                              year: parsed
                            }
                          });
                        }}
                      />
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Label className="small">Month</Form.Label>
                      <Form.Select
                        value={editingEvent.date?.month || 1}
                        onChange={(e) => setEditingEvent({
                          ...editingEvent,
                          date: {
                            ...editingEvent.date,
                            month: parseInt(e.target.value)
                          }
                        })}
                      >
                        {campaign.calendarConfig.monthNames.map((name, index) => (
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
                        max={campaign.calendarConfig.daysPerMonth[editingEvent.date?.month - 1] || 28}
                        value={editingEvent.date?.day || 1}
                        onChange={(e) => setEditingEvent({
                          ...editingEvent,
                          date: {
                            ...editingEvent.date,
                            day: parseInt(e.target.value) || 1
                          }
                        })}
                      />
                    </Col>
                  </Row>
                )}
              </Form.Group>

              <div className="text-muted small">
                <strong>Type:</strong> {editingEvent.type}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingEvent(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            <i className="fas fa-save me-2"></i>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Event?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this event?</p>
          {eventToDelete && (
            <div className="alert alert-warning">
              <strong>{eventToDelete.name}</strong>
              {eventToDelete.date && (
                <div className="small text-muted">
                  {getMonthName(eventToDelete.date.month)}, {formatYear(eventToDelete.date.year, campaign.calendarConfig)}
                </div>
              )}
            </div>
          )}
          <p className="text-danger mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <i className="fas fa-trash me-2"></i>
            Delete Event
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Schedule Custom Event Button */}
      <div className="text-center mb-3 mt-4">
        <Button
          variant={showEventScheduler ? "secondary" : "primary"}
          onClick={() => setShowEventScheduler(!showEventScheduler)}
        >
          <i className={`fas ${showEventScheduler ? 'fa-times' : 'fa-calendar-plus'} me-2`}></i>
          {showEventScheduler ? 'Hide Event Scheduler' : 'Schedule Custom Event'}
        </Button>
      </div>

      {/* Event Scheduler */}
      {showEventScheduler && (
        <EventScheduler
          campaign={campaign}
          onAddEvent={(event) => {
            onAddEvent(event);
            setShowEventScheduler(false);
          }}
          onCancel={() => setShowEventScheduler(false)}
        />
      )}
    </div>
  );
}

export default EventRoller;
