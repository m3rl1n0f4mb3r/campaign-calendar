import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { getDefaultCalendarConfig, formatYear } from '../utils/dateUtils';

function CampaignWizard({ show, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: '',
    calendarConfig: getDefaultCalendarConfig(),
    startingYear: 0,
    startingMonth: 1,
    startingDay: 1
  });

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = () => {
    const newCampaign = {
      name: campaignData.name,
      calendarConfig: campaignData.calendarConfig,
      currentDate: {
        year: campaignData.startingYear,
        month: campaignData.startingMonth,
        day: campaignData.startingDay,
        isSpecialDay: false,
        specialDayIndex: null,
        specialDayOffset: null
      }
    };

    onCreate(newCampaign);

    // Reset wizard
    setStep(1);
    setCampaignData({
      name: '',
      calendarConfig: getDefaultCalendarConfig(),
      startingYear: 0,
      startingMonth: 1,
      startingDay: 1
    });
  };

  const canProceed = () => {
    if (step === 1) return campaignData.name.trim().length > 0;
    return true;
  };

  const updateMonthName = (index, value) => {
    const newMonthNames = [...campaignData.calendarConfig.monthNames];
    newMonthNames[index] = value;
    setCampaignData({
      ...campaignData,
      calendarConfig: {
        ...campaignData.calendarConfig,
        monthNames: newMonthNames
      }
    });
  };

  const updateDaysInMonth = (index, value) => {
    const newDaysPerMonth = [...campaignData.calendarConfig.daysPerMonth];
    newDaysPerMonth[index] = parseInt(value) || 28;
    setCampaignData({
      ...campaignData,
      calendarConfig: {
        ...campaignData.calendarConfig,
        daysPerMonth: newDaysPerMonth
      }
    });
  };

  const updateNumMonths = (value) => {
    const numMonths = parseInt(value) || 12;
    const newMonthNames = [...Array(numMonths)].map((_, i) =>
      campaignData.calendarConfig.monthNames[i] || `Month ${i + 1}`
    );
    const newDaysPerMonth = [...Array(numMonths)].map((_, i) =>
      campaignData.calendarConfig.daysPerMonth[i] || 28
    );
    setCampaignData({
      ...campaignData,
      calendarConfig: {
        ...campaignData.calendarConfig,
        monthNames: newMonthNames,
        daysPerMonth: newDaysPerMonth
      }
    });
  };

  const resetToDefaults = () => {
    setCampaignData({
      ...campaignData,
      calendarConfig: getDefaultCalendarConfig()
    });
  };

  // Special days handlers
  const handleAddSpecialDay = () => {
    const newSpecialDay = {
      name: 'New Festival',
      position: 'after',
      anchorMonth: 1,
      duration: 3
    };
    setCampaignData({
      ...campaignData,
      calendarConfig: {
        ...campaignData.calendarConfig,
        specialDays: [...(campaignData.calendarConfig.specialDays || []), newSpecialDay]
      }
    });
  };

  const handleUpdateSpecialDay = (index, field, value) => {
    const updated = [...(campaignData.calendarConfig.specialDays || [])];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setCampaignData({
      ...campaignData,
      calendarConfig: {
        ...campaignData.calendarConfig,
        specialDays: updated
      }
    });
  };

  const handleDeleteSpecialDay = (index) => {
    const updated = (campaignData.calendarConfig.specialDays || []).filter((_, i) => i !== index);
    setCampaignData({
      ...campaignData,
      calendarConfig: {
        ...campaignData.calendarConfig,
        specialDays: updated
      }
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-calendar-alt me-2"></i>
          Create New Campaign - Step {step} of 2
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {step === 1 && (
          <>
            <h5 className="mb-3">Campaign Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Campaign Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., The Shadowdark Chronicles, Fall of the Crimson Keep"
                value={campaignData.name}
                onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                autoFocus
              />
              <Form.Text className="text-muted">
                Give your campaign a memorable name
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Starting Date</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Label className="small">Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={campaignData.startingYear}
                    onChange={(e) => setCampaignData({ ...campaignData, startingYear: parseInt(e.target.value) || 0 })}
                  />
                  <Form.Text className="text-muted">
                    Can be negative for "before epoch" dates
                  </Form.Text>
                </Col>
                <Col md={4}>
                  <Form.Label className="small">Month</Form.Label>
                  <Form.Select
                    value={campaignData.startingMonth}
                    onChange={(e) => setCampaignData({ ...campaignData, startingMonth: parseInt(e.target.value) })}
                  >
                    {[...Array(campaignData.calendarConfig.monthNames.length)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Month {i + 1}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="small">Day</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="28"
                    value={campaignData.startingDay}
                    onChange={(e) => setCampaignData({ ...campaignData, startingDay: parseInt(e.target.value) || 1 })}
                  />
                </Col>
              </Row>
              <Form.Text className="text-muted">
                The current date when your campaign begins
              </Form.Text>
            </Form.Group>

            <Alert variant="info">
              <strong>Note:</strong> You'll be able to customize the calendar (month names, days per month, etc.) in the next step.
              The default is 12 months with 28 days each (4 weeks per month).
            </Alert>
          </>
        )}

        {step === 2 && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Calendar Configuration</h5>
              <Button variant="outline-secondary" size="sm" onClick={resetToDefaults}>
                <i className="fas fa-undo me-2"></i>
                Reset to Defaults
              </Button>
            </div>

            <Alert variant="secondary" className="mb-3">
              <small>
                <strong>Default:</strong> 12 months, 28 days each, 7-day weeks (total: 336 days/year).
                You can also add special days (festivals/holidays). Customize now or change later in Calendar Settings.
              </small>
            </Alert>

            <h6 className="mb-2">Calendar Structure</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="small">Number of Months</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="24"
                  value={campaignData.calendarConfig.monthNames.length}
                  onChange={(e) => updateNumMonths(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Default is 12. Can be any number 1-24.
                </Form.Text>
              </Col>
            </Row>

            <h6 className="mb-2">Month Names & Days</h6>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="mb-3">
              {campaignData.calendarConfig.monthNames.map((name, index) => (
                <Row key={index} className="mb-2">
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder={`Month ${index + 1}`}
                      value={name}
                      onChange={(e) => updateMonthName(index, e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      size="sm"
                      min="1"
                      max="100"
                      value={campaignData.calendarConfig.daysPerMonth[index]}
                      onChange={(e) => updateDaysInMonth(index, e.target.value)}
                    />
                    <Form.Text className="text-muted small">days</Form.Text>
                  </Col>
                </Row>
              ))}
            </div>

            <h6 className="mb-2">Week Structure</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="small">Days per Week</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="14"
                  value={campaignData.calendarConfig.daysPerWeek}
                  onChange={(e) => {
                    const daysPerWeek = parseInt(e.target.value) || 7;
                    const newWeekdayNames = [...Array(daysPerWeek)].map((_, i) =>
                      campaignData.calendarConfig.weekdayNames[i] || `Day ${i + 1}`
                    );
                    setCampaignData({
                      ...campaignData,
                      calendarConfig: {
                        ...campaignData.calendarConfig,
                        daysPerWeek,
                        weekdayNames: newWeekdayNames
                      }
                    });
                  }}
                />
                <Form.Text className="text-muted">
                  Default is 7 (like Earth). Can be any number 1-14.
                </Form.Text>
              </Col>
            </Row>

            <h6 className="mb-2">Weekday Names</h6>
            <div className="mb-3" style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid var(--sd-border)',
              borderRadius: '4px',
              padding: '0.5rem'
            }}>
              <Row>
                {campaignData.calendarConfig.weekdayNames.map((name, index) => (
                  <Col md={4} key={index} className="mb-2">
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder={`Day ${index + 1}`}
                      value={name}
                      onChange={(e) => {
                        const newWeekdayNames = [...campaignData.calendarConfig.weekdayNames];
                        newWeekdayNames[index] = e.target.value;
                        setCampaignData({
                          ...campaignData,
                          calendarConfig: {
                            ...campaignData.calendarConfig,
                            weekdayNames: newWeekdayNames
                          }
                        });
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </div>

            <h6 className="mb-2 mt-3">Era / Epoch</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="small">Era Label (e.g., DR, AC, AD)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="AC"
                  maxLength={10}
                  value={campaignData.calendarConfig.epoch?.label || 'AC'}
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      calendarConfig: {
                        ...campaignData.calendarConfig,
                        epoch: {
                          ...campaignData.calendarConfig.epoch,
                          label: e.target.value
                        }
                      }
                    });
                  }}
                />
                <Form.Text className="text-muted">
                  Appears after year: "15 DR", "2024 AD"
                </Form.Text>
              </Col>
              <Col md={6}>
                <Form.Label className="small">Before Era Label (optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="BC (optional)"
                  maxLength={10}
                  value={campaignData.calendarConfig.epoch?.labelBefore || ''}
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      calendarConfig: {
                        ...campaignData.calendarConfig,
                        epoch: {
                          ...campaignData.calendarConfig.epoch,
                          labelBefore: e.target.value || null
                        }
                      }
                    });
                  }}
                />
                <Form.Text className="text-muted">
                  For BC/AD style: "42 BC", "10 AD"
                </Form.Text>
              </Col>
            </Row>

            <h6 className="mb-2 mt-3">Special Days (Optional)</h6>
            <Alert variant="info" className="mb-3">
              <small>
                <i className="fas fa-info-circle me-2"></i>
                Special days are "out of time" periods like festivals or celebrations that don't count as regular days.
                They appear before or after specific months.
              </small>
            </Alert>

            {(!campaignData.calendarConfig.specialDays || campaignData.calendarConfig.specialDays.length === 0) ? (
              <div className="text-center p-4" style={{
                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                border: '1px dashed rgba(108, 117, 125, 0.3)',
                borderRadius: '4px'
              }}>
                <i className="fas fa-calendar-plus text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                <p className="text-muted mb-2">No special days configured</p>
                <Button variant="primary" size="sm" onClick={handleAddSpecialDay}>
                  <i className="fas fa-plus me-2"></i>
                  Add First Special Day
                </Button>
              </div>
            ) : (
              <>
                <ListGroup className="mb-3">
                  {campaignData.calendarConfig.specialDays.map((specialDay, index) => (
                    <ListGroup.Item key={index} style={{
                      backgroundColor: 'var(--sd-dark-gray)',
                      borderColor: 'var(--sd-border)'
                    }}>
                      <Row className="g-2 align-items-end">
                        <Col xs={12} md={4}>
                          <Form.Label className="small mb-1">Name</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={specialDay.name}
                            onChange={(e) => handleUpdateSpecialDay(index, 'name', e.target.value)}
                            placeholder="e.g., Midwinter Festival"
                          />
                        </Col>
                        <Col xs={6} md={2}>
                          <Form.Label className="small mb-1">Position</Form.Label>
                          <Form.Select
                            size="sm"
                            value={specialDay.position}
                            onChange={(e) => handleUpdateSpecialDay(index, 'position', e.target.value)}
                          >
                            <option value="before">Before</option>
                            <option value="after">After</option>
                          </Form.Select>
                        </Col>
                        <Col xs={6} md={3}>
                          <Form.Label className="small mb-1">Month</Form.Label>
                          <Form.Select
                            size="sm"
                            value={specialDay.anchorMonth}
                            onChange={(e) => handleUpdateSpecialDay(index, 'anchorMonth', parseInt(e.target.value))}
                          >
                            {campaignData.calendarConfig.monthNames.map((name, monthIndex) => (
                              <option key={monthIndex + 1} value={monthIndex + 1}>
                                {name}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col xs={8} md={2}>
                          <Form.Label className="small mb-1">Duration (days)</Form.Label>
                          <Form.Control
                            type="number"
                            size="sm"
                            min="1"
                            max="30"
                            value={specialDay.duration}
                            onChange={(e) => handleUpdateSpecialDay(index, 'duration', parseInt(e.target.value) || 1)}
                          />
                        </Col>
                        <Col xs={4} md={1} className="d-flex align-items-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteSpecialDay(index)}
                            title="Delete"
                            className="w-100"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </Col>
                      </Row>
                      <div className="mt-2">
                        <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                          {specialDay.position === 'before' ? 'Before' : 'After'} {campaignData.calendarConfig.monthNames[specialDay.anchorMonth - 1]}
                          {' • '}{specialDay.duration} day{specialDay.duration !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button variant="outline-primary" size="sm" onClick={handleAddSpecialDay}>
                  <i className="fas fa-plus me-2"></i>
                  Add Another Special Day
                </Button>
              </>
            )}

            <Alert variant="success" className="mt-3">
              <strong>Ready to create campaign!</strong><br />
              <ul className="mb-0 mt-2">
                <li><strong>{campaignData.name}</strong></li>
                <li>Starting: {campaignData.calendarConfig.monthNames[campaignData.startingMonth - 1]} {campaignData.startingDay}, {formatYear(campaignData.startingYear, campaignData.calendarConfig)}</li>
                <li>
                  {(() => {
                    const regularDays = campaignData.calendarConfig.daysPerMonth.reduce((a, b) => a + b, 0);
                    const specialDays = (campaignData.calendarConfig.specialDays || []).reduce((sum, sd) => sum + (sd.duration || 0), 0);
                    const totalDays = regularDays + specialDays;
                    if (specialDays > 0) {
                      return `${totalDays} days per year (${regularDays} regular + ${specialDays} special, ${campaignData.calendarConfig.monthNames.length} months)`;
                    }
                    return `${regularDays} days per year (${campaignData.calendarConfig.monthNames.length} months)`;
                  })()}
                </li>
                <li>{campaignData.calendarConfig.daysPerWeek}-day weeks</li>
                {(() => {
                  const totalSpecialDays = (campaignData.calendarConfig.specialDays || []).reduce((sum, sd) => sum + (sd.duration || 0), 0);
                  const numPeriods = (campaignData.calendarConfig.specialDays || []).length;
                  if (numPeriods > 0) {
                    return <li>{totalSpecialDays} special day{totalSpecialDays !== 1 ? 's' : ''} ({numPeriods} period{numPeriods !== 1 ? 's' : ''})</li>;
                  }
                  return null;
                })()}
              </ul>
              <small className="text-muted mt-2 d-block">
                After creating your campaign, you can add domains to track different regions, cities, or player strongholds.
              </small>
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step > 1 && (
          <Button variant="secondary" onClick={handleBack}>
            <i className="fas fa-arrow-left me-2"></i>
            Back
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {step < 2 ? (
          <Button variant="primary" onClick={handleNext} disabled={!canProceed()}>
            Next
            <i className="fas fa-arrow-right ms-2"></i>
          </Button>
        ) : (
          <Button variant="success" onClick={handleCreate} disabled={!canProceed()}>
            <i className="fas fa-check me-2"></i>
            Create Campaign
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default CampaignWizard;
