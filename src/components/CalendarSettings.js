import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Alert, Card, ListGroup } from 'react-bootstrap';

/**
 * CalendarSettings - Modal for configuring campaign calendar
 * Allows customization of:
 * - Month names and days per month
 * - Week structure (days per week, weekday names)
 * - Special days (festivals, holidays - "out of time" periods)
 * - Epoch/era labels
 */
function CalendarSettings({ show, onClose, currentConfig, onSave }) {
  const getInitialConfig = () => {
    const defaults = {
      numMonths: 12,
      monthNames: Array(12).fill('').map((_, i) => `Month ${i + 1}`),
      daysPerMonth: Array(12).fill(28),
      daysPerWeek: 7,
      weekdayNames: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      specialDays: [],
      epoch: {
        label: 'AC',
        labelBefore: null
      }
    };

    if (!currentConfig) return defaults;

    // Deep clone currentConfig to avoid mutating the original campaign's config
    const clonedConfig = JSON.parse(JSON.stringify(currentConfig));

    // Ensure epoch field exists and handle backward compatibility
    let epoch;
    if (clonedConfig.epoch) {
      // New structure - ensure labelBefore exists
      epoch = {
        label: clonedConfig.epoch.label || defaults.epoch.label,
        labelBefore: clonedConfig.epoch.labelBefore || null
      };
    } else if (clonedConfig.eraLabel || clonedConfig.eraLabelBefore) {
      // Old structure - convert to new format
      epoch = {
        label: clonedConfig.eraLabel || defaults.epoch.label,
        labelBefore: clonedConfig.eraLabelBefore || null
      };
    } else {
      epoch = defaults.epoch;
    }

    return {
      ...clonedConfig,
      numMonths: clonedConfig.monthNames?.length || clonedConfig.numMonths || defaults.numMonths,
      specialDays: clonedConfig.specialDays || [],
      epoch
    };
  };

  const [config, setConfig] = useState(getInitialConfig);

  const [validationErrors, setValidationErrors] = useState([]);

  // Reinitialize config when modal opens or currentConfig changes
  useEffect(() => {
    if (show) {
      setConfig(getInitialConfig());
      setValidationErrors([]);
    }
  }, [show, currentConfig]);

  // Handle number of months change
  const handleNumMonthsChange = (newNum) => {
    const num = parseInt(newNum) || 12;
    const clampedNum = Math.max(1, Math.min(24, num));

    const newMonthNames = [...config.monthNames];
    const newDaysPerMonth = [...config.daysPerMonth];

    // Expand or shrink arrays
    while (newMonthNames.length < clampedNum) {
      newMonthNames.push(`Month ${newMonthNames.length + 1}`);
      newDaysPerMonth.push(28);
    }
    if (newMonthNames.length > clampedNum) {
      newMonthNames.length = clampedNum;
      newDaysPerMonth.length = clampedNum;
    }

    setConfig({
      ...config,
      numMonths: clampedNum,
      monthNames: newMonthNames,
      daysPerMonth: newDaysPerMonth
    });
  };

  // Handle days per week change
  const handleDaysPerWeekChange = (newNum) => {
    const num = parseInt(newNum) || 7;
    const clampedNum = Math.max(1, Math.min(14, num));

    const newWeekdayNames = [...config.weekdayNames];

    // Expand or shrink weekday names
    while (newWeekdayNames.length < clampedNum) {
      newWeekdayNames.push(`Day ${newWeekdayNames.length + 1}`);
    }
    if (newWeekdayNames.length > clampedNum) {
      newWeekdayNames.length = clampedNum;
    }

    setConfig({
      ...config,
      daysPerWeek: clampedNum,
      weekdayNames: newWeekdayNames
    });
  };

  // Update month name
  const updateMonthName = (index, name) => {
    const newNames = [...config.monthNames];
    newNames[index] = name || `Month ${index + 1}`;
    setConfig({ ...config, monthNames: newNames });
  };

  // Update days in month
  const updateDaysInMonth = (index, days) => {
    const numDays = parseInt(days) || 28;
    const clampedDays = Math.max(1, Math.min(100, numDays));
    const newDays = [...config.daysPerMonth];
    newDays[index] = clampedDays;
    setConfig({ ...config, daysPerMonth: newDays });
  };

  // Update weekday name
  const updateWeekdayName = (index, name) => {
    const newNames = [...config.weekdayNames];
    newNames[index] = name || `Day ${index + 1}`;
    setConfig({ ...config, weekdayNames: newNames });
  };

  // Validate configuration
  const validate = () => {
    const errors = [];

    // Check for empty month names
    if (config.monthNames.some(name => !name.trim())) {
      errors.push('All months must have names');
    }

    // Check for empty weekday names
    if (config.weekdayNames.some(name => !name.trim())) {
      errors.push('All weekdays must have names');
    }

    // Check for duplicate month names
    const monthSet = new Set(config.monthNames.map(n => n.toLowerCase().trim()));
    if (monthSet.size !== config.monthNames.length) {
      errors.push('Month names must be unique');
    }

    // Check special days
    config.specialDays.forEach((sd, index) => {
      if (!sd.name.trim()) {
        errors.push(`Special day #${index + 1} must have a name`);
      }
      if (!sd.duration || sd.duration < 1 || sd.duration > 30) {
        errors.push(`Special day "${sd.name}" must have a duration between 1 and 30 days`);
      }
      if (!sd.anchorMonth || sd.anchorMonth < 1 || sd.anchorMonth > config.numMonths) {
        errors.push(`Special day "${sd.name}" has an invalid anchor month`);
      }
    });

    // Check epoch label
    if (!config.epoch.label.trim()) {
      errors.push('Epoch label is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validate()) {
      // Deep clone config to prevent shared references between campaigns
      const clonedConfig = JSON.parse(JSON.stringify(config));
      onSave(clonedConfig);
      onClose();
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setConfig({
      numMonths: 12,
      monthNames: Array(12).fill('').map((_, i) => `Month ${i + 1}`),
      daysPerMonth: Array(12).fill(28),
      daysPerWeek: 7,
      weekdayNames: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      specialDays: [],
      epoch: {
        label: 'AC',
        labelBefore: null
      }
    });
    setValidationErrors([]);
  };

  // Special days handlers
  const handleAddSpecialDay = () => {
    const newSpecialDay = {
      name: 'New Festival',
      position: 'after',
      anchorMonth: 1,
      duration: 3
    };
    setConfig({
      ...config,
      specialDays: [...config.specialDays, newSpecialDay]
    });
  };

  const handleUpdateSpecialDay = (index, field, value) => {
    const updated = [...config.specialDays];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setConfig({
      ...config,
      specialDays: updated
    });
  };

  const handleDeleteSpecialDay = (index) => {
    const updated = config.specialDays.filter((_, i) => i !== index);
    setConfig({
      ...config,
      specialDays: updated
    });
  };

  // Calculate total days in year (regular days + special days)
  const totalRegularDays = config.daysPerMonth.reduce((sum, days) => sum + days, 0);
  const totalSpecialDays = config.specialDays.reduce((sum, sd) => sum + (sd.duration || 0), 0);
  const totalDaysInYear = totalRegularDays + totalSpecialDays;

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-cog me-2"></i>
          Calendar Configuration
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {validationErrors.length > 0 && (
          <Alert variant="danger">
            <strong>Validation Errors:</strong>
            <ul className="mb-0 mt-2">
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Summary Stats */}
        <div className="mb-4 p-3" style={{
          backgroundColor: 'rgba(108, 117, 125, 0.1)',
          border: '1px solid rgba(108, 117, 125, 0.3)',
          borderRadius: '4px'
        }}>
          <Row>
            <Col md={3}>
              <div className="text-center">
                <div className="h3 mb-0">{config.numMonths}</div>
                <small className="text-muted">Months</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="h3 mb-0">{totalDaysInYear}</div>
                <small className="text-muted">Total Days/Year</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="h3 mb-0">{config.daysPerWeek}</div>
                <small className="text-muted">Days per Week</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="h3 mb-0">{totalSpecialDays}</div>
                <small className="text-muted">Special Days</small>
              </div>
            </Col>
          </Row>
          {totalSpecialDays > 0 && (
            <div className="text-center mt-2">
              <small className="text-muted">
                ({totalRegularDays} regular + {totalSpecialDays} special)
              </small>
            </div>
          )}
        </div>

        {/* Number of Months */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Number of Months in Year</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max="24"
            value={config.numMonths}
            onChange={(e) => handleNumMonthsChange(e.target.value)}
          />
          <Form.Text className="text-muted">
            Between 1 and 24 months
          </Form.Text>
        </Form.Group>

        {/* Month Configuration */}
        <div className="mb-4">
          <h5 className="mb-3">
            <i className="fas fa-calendar me-2"></i>
            Month Names & Days
          </h5>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="mb-3">
            {config.monthNames.map((name, index) => (
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
                    value={config.daysPerMonth[index]}
                    onChange={(e) => updateDaysInMonth(index, e.target.value)}
                  />
                  <Form.Text className="text-muted small">days</Form.Text>
                </Col>
              </Row>
            ))}
          </div>
        </div>

        {/* Week Configuration */}
        <div className="mb-4">
          <h5 className="mb-3">
            <i className="fas fa-calendar-week me-2"></i>
            Week Configuration
          </h5>

          <Form.Group className="mb-3">
            <Form.Label>Days per Week</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="14"
              value={config.daysPerWeek}
              onChange={(e) => handleDaysPerWeekChange(e.target.value)}
            />
            <Form.Text className="text-muted">
              Between 1 and 14 days per week
            </Form.Text>
          </Form.Group>

          <Form.Label>Weekday Names</Form.Label>
          <div className="mb-3" style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid var(--sd-border)',
            borderRadius: '4px',
            padding: '0.5rem'
          }}>
            <Row>
              {config.weekdayNames.map((name, index) => (
                <Col md={4} key={index} className="mb-2">
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder={`Day ${index + 1}`}
                    value={name}
                    onChange={(e) => updateWeekdayName(index, e.target.value)}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* Special Days Configuration */}
        <div className="mb-4">
          <h5 className="mb-3">
            <i className="fas fa-star me-2"></i>
            Special Days (Festivals & Holidays)
          </h5>

          <Alert variant="info" className="mb-3">
            <small>
              <i className="fas fa-info-circle me-2"></i>
              Special days are "out of time" periods like festivals or celebrations that don't count as regular days.
              They appear before or after specific months.
            </small>
          </Alert>

          {config.specialDays.length === 0 ? (
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
                {config.specialDays.map((specialDay, index) => (
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
                          {config.monthNames.map((name, monthIndex) => (
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
                        {specialDay.position === 'before' ? 'Before' : 'After'} {config.monthNames[specialDay.anchorMonth - 1]}
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
        </div>

        {/* Epoch/Era Configuration */}
        <div className="mb-4">
          <h5 className="mb-3">
            <i className="fas fa-history me-2"></i>
            Epoch / Era Configuration
          </h5>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Era Label</Form.Label>
                <Form.Control
                  type="text"
                  value={config.epoch.label}
                  onChange={(e) => setConfig({
                    ...config,
                    epoch: { ...config.epoch, label: e.target.value }
                  })}
                  placeholder="e.g., DR, AC, AD"
                  maxLength={10}
                />
                <Form.Text className="text-muted">
                  Appears after year: "15 DR", "2024 AD"
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Before Era Label (optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={config.epoch.labelBefore || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    epoch: { ...config.epoch, labelBefore: e.target.value || null }
                  })}
                  placeholder="BC (optional)"
                  maxLength={10}
                />
                <Form.Text className="text-muted">
                  For BC/AD style: "42 BC", "10 AD"
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <div className="p-2 bg-light border rounded">
            <strong>Preview:</strong>
            <div className="mt-2">
              {config.epoch.labelBefore ? (
                <>
                  <Badge bg="secondary" className="me-2">Year -5: 5 {config.epoch.labelBefore}</Badge>
                  <Badge bg="secondary" className="me-2">Year 0: 0 {config.epoch.label}</Badge>
                  <Badge bg="secondary">Year 42: 42 {config.epoch.label}</Badge>
                </>
              ) : (
                <>
                  <Badge bg="secondary" className="me-2">Year -5: -5 {config.epoch.label}</Badge>
                  <Badge bg="secondary" className="me-2">Year 0: 0 {config.epoch.label}</Badge>
                  <Badge bg="secondary">Year 42: 42 {config.epoch.label}</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleReset}>
          <i className="fas fa-undo me-2"></i>
          Reset to Defaults
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <i className="fas fa-save me-2"></i>
          Save Configuration
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CalendarSettings;
