import React, { useState } from 'react';
import { Card, Button, Alert, Modal, Badge } from 'react-bootstrap';
import { formatDate, formatYear } from '../utils/dateUtils';

function DomainTimeline({ domain, campaign, onAdvanceMonth, onAdvanceYear, onUpdateDomain, onAddEvent }) {
  const [showYearModal, setShowYearModal] = useState(false);
  const [yearResults, setYearResults] = useState(null);
  const [showMonthAlert, setShowMonthAlert] = useState(false);
  const [monthResult, setMonthResult] = useState(null);

  if (!domain || !campaign) {
    return null;
  }

  const currentDate = campaign.currentDate;
  const calendarConfig = campaign.calendarConfig;
  const monthName = calendarConfig.monthNames[currentDate.month - 1];

  const handleAdvanceMonth = () => {
    const result = onAdvanceMonth();
    setMonthResult(result);
    setShowMonthAlert(true);
    
    // Auto-hide alert after 4 seconds
    setTimeout(() => setShowMonthAlert(false), 4000);
    
    if (result.isNewYear) {
      // New year! Show automation option
      setShowYearModal(true);
    }
  };

  const handleAdvanceYear = () => {
    onAdvanceYear();
    setShowYearModal(true);
  };

  const runYearlyAutomation = () => {
    const results = {
      year: currentDate.year,
      confidenceReset: false,
      events: []
    };

    // Reset confidence to base
    if (domain.confidence.baseLevel > 0) {
      onUpdateDomain({
        confidence: {
          ...domain.confidence,
          currentLevel: domain.confidence.baseLevel
        }
      });
      results.confidenceReset = true;
    }

    // Roll annual events (1d4)
    const numEvents = Math.floor(Math.random() * 4) + 1;
    const rolledEvents = rollEvents(numEvents);
    
    rolledEvents.forEach(event => {
      onAddEvent(event);
    });

    results.events = rolledEvents;
    setYearResults(results);
  };

  const rollEvents = (numEvents) => {
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

    const allPossibleEvents = [];

    naturalEvents.forEach(event => {
      if (rollForEvent(event)) {
        allPossibleEvents.push({
          name: event.name,
          type: 'Natural',
          disaster: event.disaster,
          domainId: domain.id,
          domainName: domain.name
        });
      }
    });

    unnaturalEvents.forEach(event => {
      if (rollForEvent(event)) {
        allPossibleEvents.push({
          name: event.name,
          type: 'Unnatural',
          disaster: false,
          domainId: domain.id,
          domainName: domain.name
        });
      }
    });

    // Shuffle and take only the number rolled
    const shuffled = allPossibleEvents.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(numEvents, shuffled.length));
  };

  const closeYearModal = () => {
    setShowYearModal(false);
    setYearResults(null);
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header>
          <h3><i className="fas fa-calendar-alt me-2"></i>Domain Timeline</h3>
        </Card.Header>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>
              {monthName}, {formatYear(currentDate.year, calendarConfig)}
            </h2>
            <p className="text-muted mb-0">
              Population: {domain.population || 0} families ({(domain.population || 0) * 5} people)
            </p>
          </div>

          {showMonthAlert && monthResult && (
            <Alert 
              variant={monthResult.populationChange >= 0 ? 'success' : 'warning'} 
              dismissible 
              onClose={() => setShowMonthAlert(false)}
              className="mb-3"
            >
              <strong>Month Advanced!</strong><br />
              Population change: {monthResult.populationChange >= 0 ? '+' : ''}{monthResult.populationChange} families
              {' '}({domain.population} total)
            </Alert>
          )}

          <div className="d-grid gap-2">
            <Button variant="primary" size="lg" onClick={handleAdvanceMonth}>
              <i className="fas fa-forward me-2"></i>
              Advance 1 Month (+ Population Growth)
            </Button>
            <Button variant="outline-primary" onClick={handleAdvanceYear}>
              <i className="fas fa-fast-forward me-2"></i>
              Advance to New Year
            </Button>
          </div>

          <Alert variant="info" className="mt-3 mb-0">
            <strong>At the start of each new year:</strong>
            <ul className="mb-0 mt-2">
              <li>Confidence resets to base level</li>
              <li>Roll 1d4 annual events</li>
              <li>Check for disasters</li>
            </ul>
          </Alert>
        </Card.Body>
      </Card>

      <Modal show={showYearModal} onHide={closeYearModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-calendar-check me-2"></i>
            New Year: {formatYear(currentDate.year, calendarConfig)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!yearResults ? (
            <>
              <Alert variant="primary">
                <h5><i className="fas fa-magic me-2"></i>Welcome to {formatYear(currentDate.year, calendarConfig)}!</h5>
                <p className="mb-0">Run automated yearly processing to:</p>
                <ul className="mb-0">
                  <li>Reset Confidence to base level ({domain.confidence.baseLevel})</li>
                  <li>Roll 1d4 annual events</li>
                  <li>Record all results in history</li>
                </ul>
              </Alert>
              <div className="text-center">
                <Button variant="success" size="lg" onClick={runYearlyAutomation}>
                  <i className="fas fa-dice me-2"></i>
                  Run Yearly Automation
                </Button>
                <div className="mt-3">
                  <Button variant="outline-secondary" onClick={closeYearModal}>
                    Skip (Manual Mode)
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Alert variant="success">
                <h5><i className="fas fa-check-circle me-2"></i>Yearly Processing Complete!</h5>
              </Alert>

              {yearResults.confidenceReset && (
                <Alert variant="info">
                  <strong>Confidence Reset:</strong> Reset to base level of {domain.confidence.baseLevel}
                </Alert>
              )}

              <h5 className="mt-3 mb-3">
                <i className="fas fa-scroll me-2"></i>
                Events Rolled: {yearResults.events.length}
              </h5>
              
              {yearResults.events.length > 0 ? (
                <div className="list-group">
                  {yearResults.events.map((event, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{event.name}</strong>
                          {event.disaster && (
                            <Badge bg="danger" className="ms-2">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              DISASTER
                            </Badge>
                          )}
                        </div>
                        <Badge bg={event.type === 'Natural' ? 'success' : 'info'}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="secondary">
                  No significant events occurred this year.
                </Alert>
              )}

              {yearResults.events.some(e => e.disaster) && (
                <Alert variant="danger" className="mt-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Disaster(s) occurred!</strong> Remember to make Confidence checks.
                </Alert>
              )}

              <div className="text-center mt-4">
                <Button variant="primary" onClick={closeYearModal}>
                  <i className="fas fa-check me-2"></i>
                  Continue
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DomainTimeline;
