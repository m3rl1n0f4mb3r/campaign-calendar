import React, { useState, useMemo } from 'react';
import { Card, Form, Row, Col, Table, Badge, Button, ButtonGroup, InputGroup } from 'react-bootstrap';
import { formatYear, isValidDate } from '../utils/dateUtils';

function EventListView({
  campaign,
  events = [],
  onEditEvent,
  onDeleteEvent
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const domainList = Object.values(campaign?.domains || {});

  // Get month name helper
  const getMonthName = (monthNum) => {
    if (!campaign?.calendarConfig?.monthNames) return `Month ${monthNum}`;
    return campaign.calendarConfig.monthNames[monthNum - 1] || `Month ${monthNum}`;
  };

  // Get special day name helper
  const getSpecialDayName = (specialDayIndex) => {
    if (!campaign?.calendarConfig?.specialDays) return 'Special Day';
    return campaign.calendarConfig.specialDays[specialDayIndex]?.name || 'Special Day';
  };

  // Get current domain name (looks up from domains, falls back to stored name)
  const getDomainName = (event) => {
    if (!event.domainId) return event.domainName || null;
    const domain = campaign?.domains?.[event.domainId];
    return domain?.name || event.domainName || 'Unknown Domain';
  };

  // Format event date for display
  const formatEventDate = (event) => {
    if (!event.date) return { main: 'Unknown', sub: '' };

    if (event.date.isSpecialDay) {
      const specialDayName = getSpecialDayName(event.date.specialDayIndex);
      return {
        main: specialDayName,
        mainShort: specialDayName.length > 10 ? specialDayName.substring(0, 10) + '...' : specialDayName,
        sub: `Day ${event.date.specialDayOffset}`,
        isSpecialDay: true
      };
    }

    return {
      main: getMonthName(event.date.month),
      mainShort: getMonthName(event.date.month).substring(0, 3),
      sub: `Day ${event.date.day}`,
      isSpecialDay: false
    };
  };

  // Check if event date is valid
  const isEventDateValid = (event) => {
    if (!event.date || !campaign?.calendarConfig) return true;

    // Special day events - check if the special day index and offset are valid
    if (event.date.isSpecialDay) {
      const specialDay = campaign.calendarConfig.specialDays?.[event.date.specialDayIndex];
      if (!specialDay) return false;
      return event.date.specialDayOffset >= 1 && event.date.specialDayOffset <= specialDay.duration;
    }

    // Regular day events
    return isValidDate(event.date.year, event.date.month, event.date.day, campaign.calendarConfig);
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(term) ||
        event.notes?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Domain filter
    if (filterDomain !== 'all') {
      if (filterDomain === 'none') {
        filtered = filtered.filter(event => !event.domainId);
      } else {
        filtered = filtered.filter(event => event.domainId === filterDomain);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = a.date || { year: 0, month: 1, day: 1 };
      const dateB = b.date || { year: 0, month: 1, day: 1 };

      const yearDiff = dateA.year - dateB.year;
      if (yearDiff !== 0) {
        return sortBy === 'date-asc' ? yearDiff : -yearDiff;
      }

      const monthDiff = dateA.month - dateB.month;
      if (monthDiff !== 0) {
        return sortBy === 'date-asc' ? monthDiff : -monthDiff;
      }

      const dayDiff = dateA.day - dateB.day;
      return sortBy === 'date-asc' ? dayDiff : -dayDiff;
    });

    return filtered;
  }, [events, searchTerm, filterCategory, filterType, filterDomain, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterType('all');
    setFilterDomain('all');
    setSortBy('date-desc');
  };

  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterType !== 'all' || filterDomain !== 'all';

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="fas fa-list me-2"></i>
            Event List
          </h4>
          <Badge bg="secondary">
            {filteredAndSortedEvents.length} of {events.length} events
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Filters */}
        <div className="mb-4 p-3" style={{
          backgroundColor: 'rgba(108, 117, 125, 0.1)',
          border: '1px solid rgba(108, 117, 125, 0.3)',
          borderRadius: '4px'
        }}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="small fw-bold">Search Events</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by event name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>

          <Row className="mb-2 g-2">
            <Col xs={12} sm={6} md={3}>
              <Form.Label className="small fw-bold">Category</Form.Label>
              <Form.Select
                size="sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="campaign">Campaign-wide</option>
                <option value="domain">Domain Event</option>
                <option value="personal">Personal/Character</option>
                <option value="combat">Combat/Conflict</option>
                <option value="other">Other</option>
              </Form.Select>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Form.Label className="small fw-bold">Type</Form.Label>
              <Form.Select
                size="sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Natural">Natural</option>
                <option value="Unnatural">Unnatural</option>
                <option value="Custom">Custom</option>
              </Form.Select>
            </Col>

            {domainList.length > 0 && (
              <Col xs={12} sm={6} md={3}>
                <Form.Label className="small fw-bold">Domain</Form.Label>
                <Form.Select
                  size="sm"
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                >
                  <option value="all">All Domains</option>
                  <option value="none">No Domain (Campaign-wide)</option>
                  {domainList.map(domain => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}

            <Col xs={12} sm={6} md={3}>
              <Form.Label className="small fw-bold">Sort By</Form.Label>
              <Form.Select
                size="sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
              </Form.Select>
            </Col>
          </Row>

          {hasActiveFilters && (
            <div className="text-end mt-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearFilters}
              >
                <i className="fas fa-times me-1"></i>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Event List */}
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <p className="mb-0">
              {hasActiveFilters ? 'No events match your filters' : 'No events recorded yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table striped hover style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: '100px' }}>Date</th>
                  <th style={{ minWidth: '150px' }}>Event</th>
                  <th className="d-none d-md-table-cell">Type</th>
                  <th className="d-none d-lg-table-cell">Category</th>
                  <th className="d-none d-md-table-cell">Domain</th>
                  <th style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEvents.map((event) => (
                  <tr key={event.id}>
                    <td style={{ minWidth: '100px' }}>
                      {(() => {
                        const dateInfo = formatEventDate(event);
                        return (
                          <div>
                            <strong style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                              {dateInfo.isSpecialDay ? (
                                <>
                                  <span className="d-none d-sm-inline" style={{ color: 'var(--sd-accent-text)' }}>
                                    <i className="fas fa-star me-1" style={{ fontSize: '0.7em' }}></i>
                                    {dateInfo.main}
                                  </span>
                                  <span className="d-inline d-sm-none" style={{ color: 'var(--sd-accent-text)' }}>
                                    <i className="fas fa-star me-1" style={{ fontSize: '0.7em' }}></i>
                                    {dateInfo.mainShort}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="d-none d-sm-inline">{dateInfo.main}</span>
                                  <span className="d-inline d-sm-none">{dateInfo.mainShort}</span>
                                </>
                              )}
                            </strong>
                            {dateInfo.sub && (
                              <div style={{
                                fontSize: 'clamp(0.625rem, 1.5vw, 0.7rem)',
                                color: dateInfo.isSpecialDay ? 'var(--sd-accent-text)' : 'var(--sd-text-muted, #888)'
                              }}>
                                {dateInfo.sub}
                              </div>
                            )}
                            {event.date && !isEventDateValid(event) && (
                              <div className="mt-1">
                                <Badge bg="warning" text="dark" style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.625rem)' }} title="This date is invalid - the month doesn't have this many days">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Invalid
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {event.date && (
                        <div className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                          {formatYear(event.date.year, campaign?.calendarConfig)}
                        </div>
                      )}
                    </td>
                    <td style={{ minWidth: '150px' }}>
                      <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                        {event.name}
                        {event.disaster && (
                          <Badge bg="danger" className="ms-1 d-none d-sm-inline">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            DISASTER
                          </Badge>
                        )}
                        {event.disaster && (
                          <Badge bg="danger" className="ms-1 d-inline d-sm-none">
                            <i className="fas fa-exclamation-triangle"></i>
                          </Badge>
                        )}
                      </div>
                      {event.notes && (
                        <div className="text-muted mt-1 d-none d-sm-block" style={{
                          fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                          maxWidth: '300px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {event.notes}
                        </div>
                      )}
                      {/* Show Type badge on mobile (since Type column is hidden) */}
                      <div className="d-md-none mt-1">
                        <Badge bg={event.type === 'Natural' ? 'success' : event.type === 'Unnatural' ? 'info' : 'secondary'} style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.65rem)' }}>
                          {event.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <Badge bg={event.type === 'Natural' ? 'success' : event.type === 'Unnatural' ? 'info' : 'secondary'}>
                        {event.type}
                      </Badge>
                    </td>
                    <td className="d-none d-lg-table-cell">
                      <span className="text-capitalize" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{event.category || 'campaign'}</span>
                    </td>
                    <td className="d-none d-md-table-cell">
                      {getDomainName(event) ? (
                        <Badge bg="secondary">{getDomainName(event)}</Badge>
                      ) : (
                        <span className="text-muted small">Campaign-wide</span>
                      )}
                    </td>
                    <td style={{ width: '80px' }}>
                      <ButtonGroup size="sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => onEditEvent(event)}
                          title="Edit Event"
                          style={{ padding: 'clamp(0.15rem, 1vw, 0.25rem) clamp(0.3rem, 2vw, 0.5rem)' }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => onDeleteEvent(event)}
                          title="Delete Event"
                          style={{ padding: 'clamp(0.15rem, 1vw, 0.25rem) clamp(0.3rem, 2vw, 0.5rem)' }}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default EventListView;
