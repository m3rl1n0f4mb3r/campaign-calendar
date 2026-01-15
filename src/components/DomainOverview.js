import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';

function DomainOverview({
  campaign,
  activeDomainId,
  onSelectDomain,
  onUpdateDomain,
  onAddEvent,
  onNewDomain
}) {
  const [growthResults, setGrowthResults] = useState({});
  const [showGrowthSummary, setShowGrowthSummary] = useState(false);
  const [lastBatchResults, setLastBatchResults] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [eventDates, setEventDates] = useState({});
  const [eventDomain, setEventDomain] = useState(null);
  const [numEventsRoll, setNumEventsRoll] = useState(null);

  const domainList = campaign ? Object.values(campaign.domains) : [];

  // Calculate net income for a domain (simplified version of DomainCalculator logic)
  const calculateNetIncome = (domain) => {
    const getIncomeModifier = (confidence) => {
      if (confidence >= 300) return 1.1;
      if (confidence >= 150) return 0.5;
      if (confidence >= 100) return 0.33;
      return 0;
    };

    const confidenceLevel = domain.confidence?.currentLevel ?? 300;
    const incomeModifier = getIncomeModifier(confidenceLevel);
    const taxModifier = confidenceLevel >= 150 ? 1 : 0;

    const population = domain.population || 0;
    const resources = domain.resources || { animal: 0, vegetable: 0, mineral: 0 };
    const taxRate = domain.taxRate || 4;
    const staff = domain.staff || {};
    const troops = domain.troops || {};
    const isWartime = domain.isWartime || false;
    const wartimeMultiplier = isWartime ? 2 : 1;

    const standardIncome = population * 4 * incomeModifier;
    const taxIncome = population * (taxRate / 10) * taxModifier;
    const resourceIncome =
      population * (resources.animal * 0.8) * incomeModifier +
      population * (resources.vegetable * 0.4) * incomeModifier +
      population * (resources.mineral * 1.2) * incomeModifier;
    const totalIncome = standardIncome + taxIncome + resourceIncome;

    const staffCosts =
      (staff.seneschal || 0) * 1600 +
      (staff.castellan || 0) * 800 +
      (staff.chiefSteward || 0) * 400 +
      (staff.guardCaptain || 0) * 1600 +
      (staff.reeve || 0) * 200 +
      (staff.chaplain || 0) * 200 +
      (staff.engineer || 0) * 300 +
      (staff.servitors || 0) * 2;

    const troopCosts = (
      (troops.normalMen || 0) * 0.4 +
      (troops.archers || 0) * 2 +
      (troops.footmenLight || 0) * 0.8 +
      (troops.footmenHeavy || 0) * 1.2 +
      (troops.crossbowmen || 0) * 1.6 +
      (troops.longbowmen || 0) * 4 +
      (troops.horsemanLight || 0) * 8 +
      (troops.horsemanMedium || 0) * 8 +
      (troops.horsemanHeavy || 0) * 12
    ) * wartimeMultiplier;

    const totalExpenses = staffCosts + troopCosts;
    const paymentToLiege = totalIncome * 0.2;
    const paymentToTheocracy = totalIncome * 0.1;

    return totalIncome - totalExpenses - paymentToLiege - paymentToTheocracy;
  };

  // Roll population growth for a single domain
  const rollGrowthForDomain = (domain) => {
    const currentPop = domain.population || 0;
    if (currentPop === 0) {
      return { error: 'No population', domain };
    }

    let growthRate;
    let growthRateRoll = null;
    if (currentPop <= 100) {
      growthRate = 25;
    } else if (currentPop <= 200) {
      growthRate = 20;
    } else if (currentPop <= 300) {
      growthRate = 15;
    } else if (currentPop <= 400) {
      growthRate = 10;
    } else if (currentPop <= 500) {
      growthRate = 5;
    } else {
      growthRateRoll = Math.floor(Math.random() * 6) + 1;
      growthRate = growthRateRoll;
    }

    const percentageGrowth = Math.floor(currentPop * (growthRate / 100));
    const d10Roll = Math.floor(Math.random() * 10) + 1;
    const isGrowth = d10Roll >= 6;
    const totalChange = isGrowth ? percentageGrowth : -percentageGrowth;
    const newPopulation = Math.max(0, currentPop + totalChange);

    return {
      domain,
      previousPop: currentPop,
      growthRate,
      growthRateRoll,
      percentageGrowth,
      d10Roll,
      isGrowth,
      totalChange,
      newPopulation
    };
  };

  // Handle rolling growth for a single domain
  const handleRollGrowth = (domain) => {
    const result = rollGrowthForDomain(domain);
    if (!result.error) {
      onUpdateDomain(domain.id, { population: result.newPopulation });
    }
    setGrowthResults(prev => ({ ...prev, [domain.id]: result }));
  };

  // Handle rolling growth for all domains
  const handleRollAllGrowth = () => {
    const results = [];
    domainList.forEach(domain => {
      const result = rollGrowthForDomain(domain);
      if (!result.error) {
        onUpdateDomain(domain.id, { population: result.newPopulation });
      }
      results.push(result);
    });
    setLastBatchResults(results);
    setShowGrowthSummary(true);
  };

  // Event tables
  const naturalEvents = [
    { name: "Earthquake", disaster: true },
    { name: "Flood", disaster: true },
    { name: "Weather: severe", disaster: false },
    { name: "Weather: mild", disaster: false },
    { name: "Weather: beneficial", disaster: false },
    { name: "Tornadoes", disaster: true },
    { name: "Fire", disaster: true },
    { name: "Drought", disaster: false },
    { name: "Blight", disaster: true },
    { name: "Epidemic", disaster: true },
    { name: "Animals: pest", disaster: false },
    { name: "Animals: plague", disaster: true },
    { name: "Animals: bounty", disaster: false },
    { name: "Food event: shortage", disaster: false },
    { name: "Food event: bounty", disaster: false },
    { name: "Food event: contamination", disaster: true },
    { name: "Resource event: shortage", disaster: false },
    { name: "Resource event: bounty", disaster: false },
    { name: "Market event: new interest", disaster: false },
    { name: "Market event: trade boom", disaster: false },
    { name: "Market event: trade collapse", disaster: true },
    { name: "Celestial event: eclipse", disaster: false },
    { name: "Celestial event: comet", disaster: false },
    { name: "Celestial event: meteor", disaster: true }
  ];

  const unnaturalEvents = [
    { name: "Assassination: ruler targeted", disaster: true },
    { name: "Assassination: official targeted", disaster: false },
    { name: "Birth/Death of notable person", disaster: false },
    { name: "Crime wave", disaster: false },
    { name: "Diplomatic event: positive", disaster: false },
    { name: "Diplomatic event: negative", disaster: false },
    { name: "Discovery: resources", disaster: false },
    { name: "Discovery: ruins/artifacts", disaster: false },
    { name: "Economic event: boom", disaster: false },
    { name: "Economic event: recession", disaster: true },
    { name: "Invasion/War threat", disaster: true },
    { name: "Migration: immigrants", disaster: false },
    { name: "Migration: emigrants", disaster: false },
    { name: "Monster sighting", disaster: false },
    { name: "Monster attack", disaster: true },
    { name: "Rebellion/Unrest", disaster: true },
    { name: "Religious event", disaster: false },
    { name: "Scandal", disaster: false },
    { name: "Visiting dignitary", disaster: false }
  ];

  // Roll a single event
  const rollSingleEvent = (domain, index) => {
    const typeRoll = Math.floor(Math.random() * 6) + 1;
    const isNatural = typeRoll <= 3;
    const eventRoll = isNatural
      ? Math.floor(Math.random() * 24) + 1
      : Math.floor(Math.random() * 19) + 1;

    const eventList = isNatural ? naturalEvents : unnaturalEvents;
    const event = eventList[eventRoll - 1];

    return {
      id: `${Date.now()}-${index}`,
      name: event.name,
      type: isNatural ? 'Natural' : 'Unnatural',
      category: 'domain',
      domainId: domain.id,
      domainName: domain.name,
      disaster: event.disaster,
      notes: '',
      rolls: { typeRoll, eventRoll }
    };
  };

  // Handle rolling annual events for a domain (1d4 events)
  const handleRollEvent = (domain) => {
    // Roll 1d4 for number of events
    const numEvents = Math.floor(Math.random() * 4) + 1;
    setNumEventsRoll(numEvents);

    // Roll each event
    const events = [];
    const dates = {};
    for (let i = 0; i < numEvents; i++) {
      const event = rollSingleEvent(domain, i);
      events.push(event);
      // Default each event to current date
      dates[event.id] = { ...campaign.currentDate };
    }

    setEventDomain(domain);
    setPendingEvents(events);
    setEventDates(dates);
    setShowEventModal(true);
  };

  // Save all events with their selected dates
  const handleSaveAllEvents = () => {
    pendingEvents.forEach(event => {
      const eventToSave = {
        ...event,
        date: eventDates[event.id]
      };
      delete eventToSave.rolls;
      onAddEvent(eventToSave);
    });
    handleCloseEventModal();
  };

  // Update date for a specific event
  const updateEventDate = (eventId, field, value) => {
    setEventDates(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value
      }
    }));
  };

  // Close and reset the event modal
  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setPendingEvents([]);
    setEventDates({});
    setEventDomain(null);
    setNumEventsRoll(null);
  };

  // Get month name helper
  const getMonthName = (monthNum) => {
    if (!campaign?.calendarConfig?.monthNames) return `Month ${monthNum}`;
    return campaign.calendarConfig.monthNames[monthNum - 1] || `Month ${monthNum}`;
  };

  const getConfidenceStatus = (level) => {
    if (level >= 450) return { label: 'Ideal', variant: 'success' };
    if (level >= 400) return { label: 'Thriving', variant: 'success' };
    if (level >= 350) return { label: 'Prosperous', variant: 'success' };
    if (level >= 300) return { label: 'Healthy', variant: 'info' };
    if (level >= 270) return { label: 'Steady', variant: 'info' };
    if (level >= 230) return { label: 'Average', variant: 'secondary' };
    if (level >= 200) return { label: 'Unsteady', variant: 'warning' };
    if (level >= 150) return { label: 'Defiant', variant: 'danger' };
    if (level >= 100) return { label: 'Rebellious', variant: 'danger' };
    return { label: 'Revolution', variant: 'danger' };
  };

  if (domainList.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <i className="fas fa-home text-muted" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <h4>No Domains Yet</h4>
          <p className="text-muted mb-3">Create your first domain to start tracking your realm.</p>
          <Button variant="primary" onClick={onNewDomain}>
            <i className="fas fa-plus me-2"></i>
            Create First Domain
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="mb-0" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
              <i className="fas fa-th-list me-2"></i>
              Domain Overview
            </h4>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleRollAllGrowth}
                title="Roll population growth for all domains"
              >
                <i className="fas fa-dice me-1"></i>
                Roll All Growth
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onNewDomain}
                title="Create new domain"
              >
                <i className="fas fa-plus me-1"></i>
                New Domain
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div style={{ overflowX: 'auto' }}>
            <Table striped hover size="sm" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th className="text-center">Population</th>
                  <th className="text-center">Confidence</th>
                  <th className="text-end">Net Income</th>
                  <th className="text-center" style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domainList.map(domain => {
                  const netIncome = calculateNetIncome(domain);
                  const confidence = getConfidenceStatus(domain.confidence?.currentLevel || 300);
                  const growthResult = growthResults[domain.id];

                  return (
                    <tr
                      key={domain.id}
                      className={activeDomainId === domain.id ? 'table-active' : ''}
                    >
                      <td>
                        <div>
                          <strong>{domain.name}</strong>
                          {domain.isWartime && (
                            <Badge bg="danger" className="ms-2" style={{ fontSize: '0.65rem' }}>
                              WAR
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">{domain.rulerName}</small>
                      </td>
                      <td className="text-center align-middle">
                        <div>{domain.population || 0}</div>
                        {growthResult && !growthResult.error && (
                          <small style={{
                            color: growthResult.totalChange >= 0 ? 'var(--sd-positive)' : 'var(--sd-negative)',
                            fontSize: '0.75rem'
                          }}>
                            {growthResult.totalChange >= 0 ? '+' : ''}{growthResult.totalChange}
                          </small>
                        )}
                      </td>
                      <td className="text-center align-middle">
                        <Badge bg={confidence.variant}>
                          {domain.confidence?.currentLevel || 300}
                        </Badge>
                        <div style={{ fontSize: '0.7rem' }} className="text-muted">
                          {confidence.label}
                        </div>
                      </td>
                      <td className="text-end align-middle">
                        <span style={{ color: netIncome >= 0 ? 'var(--sd-positive)' : 'var(--sd-negative)' }}>
                          {netIncome >= 0 ? '+' : ''}{netIncome.toFixed(0)} gp
                        </span>
                      </td>
                      <td className="text-center align-middle">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleRollGrowth(domain)}
                            title="Roll population growth"
                          >
                            <i className="fas fa-seedling"></i>
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleRollEvent(domain)}
                            title="Roll annual events (1d4)"
                          >
                            <i className="fas fa-bolt"></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onSelectDomain(domain.id)}
                            title="View domain details"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="mt-3 text-muted" style={{ fontSize: '0.8rem' }}>
            <i className="fas fa-info-circle me-1"></i>
            <strong>Quick Actions:</strong>{' '}
            <i className="fas fa-seedling text-success me-1"></i> Roll Growth{' | '}
            <i className="fas fa-bolt text-warning me-1"></i> Roll Annual Events (1d4){' | '}
            <i className="fas fa-eye text-primary me-1"></i> View Details
          </div>
        </Card.Body>
      </Card>

      {/* Batch Growth Results Modal */}
      <Modal show={showGrowthSummary} onHide={() => setShowGrowthSummary(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-seedling me-2"></i>
            Population Growth Results
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped size="sm">
            <thead>
              <tr>
                <th>Domain</th>
                <th className="text-center">Rate</th>
                <th className="text-center">Roll (1d10)</th>
                <th className="text-center">Result</th>
                <th className="text-end">New Population</th>
              </tr>
            </thead>
            <tbody>
              {lastBatchResults.map((result, idx) => (
                <tr key={idx}>
                  <td>{result.domain.name}</td>
                  <td className="text-center">
                    {result.error ? '—' : `${result.growthRate}%`}
                    {result.growthRateRoll && <small className="text-muted"> (1d6={result.growthRateRoll})</small>}
                  </td>
                  <td className="text-center">
                    {result.error ? '—' : result.d10Roll}
                  </td>
                  <td className="text-center">
                    {result.error ? (
                      <span className="text-muted">{result.error}</span>
                    ) : (
                      <span style={{ color: result.isGrowth ? 'var(--sd-positive)' : 'var(--sd-negative)' }}>
                        {result.isGrowth ? 'Growth' : 'Decline'} ({result.totalChange >= 0 ? '+' : ''}{result.totalChange})
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    {result.error ? '—' : (
                      <>
                        <span className="text-muted">{result.previousPop}</span>
                        {' → '}
                        <strong>{result.newPopulation}</strong>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGrowthSummary(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Annual Events Roll Modal */}
      <Modal show={showEventModal} onHide={handleCloseEventModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-bolt me-2"></i>
            Annual Events for {eventDomain?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 p-2" style={{
            backgroundColor: 'var(--sd-medium-gray)',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            <i className="fas fa-dice me-2"></i>
            <strong>1d4 = {numEventsRoll}</strong> event{numEventsRoll !== 1 ? 's' : ''} this year
            <span className="text-muted ms-2">
              (Current date: {getMonthName(campaign?.currentDate?.month)} {campaign?.currentDate?.day}, Year {campaign?.currentDate?.year})
            </span>
          </div>

          {pendingEvents.map((event, index) => (
            <div
              key={event.id}
              className="mb-3 p-3"
              style={{
                backgroundColor: 'var(--sd-medium-gray)',
                borderRadius: '8px',
                border: event.disaster ? '2px solid #dc3545' : '1px solid var(--sd-border)'
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="text-muted me-2" style={{ fontSize: '0.8rem' }}>#{index + 1}</span>
                  <strong>{event.name}</strong>
                </div>
                <div className="d-flex gap-1">
                  <Badge bg={event.type === 'Natural' ? 'success' : 'warning'}>
                    {event.type}
                  </Badge>
                  {event.disaster && (
                    <Badge bg="danger">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Disaster
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                <i className="fas fa-dice me-1"></i>
                Type 1d6={event.rolls?.typeRoll}, Event={event.rolls?.eventRoll}
              </div>
              <Row>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="small mb-1">Year</Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={eventDates[event.id]?.year || 1}
                      onChange={(e) => updateEventDate(event.id, 'year', parseInt(e.target.value) || 1)}
                      min={1}
                    />
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="small mb-1">Month</Form.Label>
                    <Form.Select
                      size="sm"
                      value={eventDates[event.id]?.month || 1}
                      onChange={(e) => updateEventDate(event.id, 'month', parseInt(e.target.value))}
                    >
                      {(campaign?.calendarConfig?.monthNames || Array(12).fill(null).map((_, i) => `Month ${i + 1}`)).map((name, idx) => (
                        <option key={idx} value={idx + 1}>
                          {name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="small mb-1">Day</Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={eventDates[event.id]?.day || 1}
                      onChange={(e) => updateEventDate(event.id, 'day', parseInt(e.target.value) || 1)}
                      min={1}
                      max={campaign?.calendarConfig?.daysPerMonth?.[eventDates[event.id]?.month - 1] || 28}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseEventModal}>
            <i className="fas fa-times me-1"></i>
            Discard All
          </Button>
          <Button variant="primary" onClick={handleSaveAllEvents}>
            <i className="fas fa-save me-1"></i>
            Save All Events ({pendingEvents.length})
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DomainOverview;
