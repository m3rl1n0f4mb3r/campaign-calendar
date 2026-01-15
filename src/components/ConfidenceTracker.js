import React, { useState } from 'react';
import { Card, Row, Col, Form, Table, Badge, Alert } from 'react-bootstrap';

function ConfidenceTracker({ domain, onUpdateDomain }) {
  const [monthlyAdjustment, setMonthlyAdjustment] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [newAbilityTotal, setNewAbilityTotal] = useState(0);

  if (!domain) {
    return null;
  }

  const confidence = domain.confidence || { baseLevel: 0, currentLevel: 0, abilityTotal: 0 };

  const calculateBase = () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    const base = roll + 150 + newAbilityTotal;
    onUpdateDomain({
      confidence: {
        baseLevel: base,
        currentLevel: base,
        abilityTotal: newAbilityTotal
      }
    });
    setShowCalculator(false);
    setNewAbilityTotal(0);
  };

  const adjustConfidence = (amount) => {
    const newLevel = Math.max(0, Math.min(500, confidence.currentLevel + amount));
    onUpdateDomain({
      confidence: {
        ...confidence,
        currentLevel: newLevel
      }
    });
  };

  const resetToBase = () => {
    onUpdateDomain({
      confidence: {
        ...confidence,
        currentLevel: confidence.baseLevel
      }
    });
  };

  const getConfidenceStatus = (level) => {
    if (level >= 450) return { label: 'Ideal', variant: 'success', description: '+10% income, +25 to next check, 75% spy reveal, 25% disaster prevention' };
    if (level >= 400) return { label: 'Thriving', variant: 'success', description: '+10% income, 75% spy reveal, 25% disaster prevention' };
    if (level >= 350) return { label: 'Prosperous', variant: 'success', description: '+10% income, 25% spy reveal, 25% disaster prevention' };
    if (level >= 300) return { label: 'Healthy', variant: 'info', description: '+10% income, 25% spy reveal' };
    if (level >= 270) return { label: 'Steady', variant: 'info', description: '25% spy reveal' };
    if (level >= 230) return { label: 'Average', variant: 'secondary', description: 'No special effects' };
    if (level >= 200) return { label: 'Unsteady', variant: 'warning', description: '1-in-6 chance confidence drops 10%' };
    if (level >= 150) return { label: 'Defiant', variant: 'danger', description: 'Peasant militia forms (half peasants), zero tax, half income' };
    if (level >= 100) return { label: 'Rebellious', variant: 'danger', description: 'Peasant militia, zero tax, 1/3 income, -5/month' };
    if (level >= 50) return { label: 'Belligerent', variant: 'danger', description: 'Zero income, officials attacked, -10/month' };
    return { label: 'Revolution', variant: 'danger', description: 'Total rebellion, ruler may be killed' };
  };

  const status = getConfidenceStatus(confidence.currentLevel);
  const incomeModifier = confidence.currentLevel >= 300 ? 1.1 : 
                        confidence.currentLevel >= 150 ? 0.5 :
                        confidence.currentLevel >= 100 ? 0.33 : 0;

  if (showCalculator || confidence.baseLevel === 0) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h4><i className="fas fa-heart me-2"></i>Calculate Base Confidence Level</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>Formula:</strong> (1d100 + 150) + Total of ruler's 6 ability scores
          </Alert>
          
          <Form.Group className="mb-3">
            <Form.Label>Ruler's Total Ability Scores (STR+DEX+CON+INT+WIS+CHA)</Form.Label>
            <Form.Control
              type="number"
              value={newAbilityTotal}
              onChange={(e) => setNewAbilityTotal(parseInt(e.target.value) || 0)}
              min="3"
              max="108"
              placeholder="Enter sum of all 6 ability scores"
            />
            <Form.Text className="text-muted">
              Typical range: 36-72 (average 54)
            </Form.Text>
          </Form.Group>

          <button className="btn btn-primary me-2" onClick={calculateBase}>
            <i className="fas fa-dice me-2"></i>
            Roll Base Confidence Level
          </button>
          {confidence.baseLevel > 0 && (
            <button className="btn btn-secondary" onClick={() => {
              setShowCalculator(false);
              setNewAbilityTotal(0);
            }}>
              Cancel
            </button>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
          <i className="fas fa-heart me-2"></i>Dominion Confidence Level
        </h4>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col xs={12} md={6} className="mb-3 mb-md-0">
            <div className="text-center mb-4">
              <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', margin: '0' }}>
                {confidence.currentLevel}
              </h2>
              <Badge bg={status.variant} style={{ fontSize: 'clamp(0.875rem, 3vw, 1.2rem)' }}>
                {status.label}
              </Badge>
              <p className="mt-2 text-muted" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>
                {status.description}
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <Table size="sm" bordered style={{ minWidth: '200px' }}>
                <tbody>
                <tr>
                  <td>Base Level (yearly reset)</td>
                  <td className="text-end"><strong>{confidence.baseLevel}</strong></td>
                </tr>
                <tr>
                  <td>Current Level</td>
                  <td className="text-end"><strong>{confidence.currentLevel}</strong></td>
                </tr>
                {incomeModifier !== 1 && (
                  <tr>
                    <td>Income Modifier</td>
                    <td className="text-end">
                      <strong style={{ color: incomeModifier > 1 ? 'var(--sd-positive)' : 'var(--sd-negative)' }}>
                        {incomeModifier > 1 ? '+' : ''}{((incomeModifier - 1) * 100).toFixed(0)}%
                      </strong>
                    </td>
                  </tr>
                )}
              </tbody>
              </Table>
            </div>
          </Col>

          <Col xs={12} md={6}>
            <h5 className="mb-3" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>
              Adjust Confidence
            </h5>
            
            <Form.Group className="mb-3">
              <Form.Label>Quick Adjustments</Form.Label>
              <div className="d-grid gap-2">
                <button className="btn btn-sm btn-success" onClick={() => adjustConfidence(25)}>
                  <i className="fas fa-plus me-2"></i>+25 (Major Success)
                </button>
                <button className="btn btn-sm btn-success" onClick={() => adjustConfidence(10)}>
                  <i className="fas fa-plus me-2"></i>+10 (Good Event)
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => adjustConfidence(-10)}>
                  <i className="fas fa-minus me-2"></i>-10 (Bad Event)
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => adjustConfidence(-25)}>
                  <i className="fas fa-minus me-2"></i>-25 (Major Problem)
                </button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Custom Adjustment</Form.Label>
              <div className="input-group">
                <Form.Control
                  type="number"
                  value={monthlyAdjustment}
                  onChange={(e) => setMonthlyAdjustment(parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    adjustConfidence(monthlyAdjustment);
                    setMonthlyAdjustment(0);
                  }}
                >
                  Apply
                </button>
              </div>
              <Form.Text className="text-muted">
                Max ±50/month or ±10/event recommended
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <button className="btn btn-secondary btn-sm" onClick={resetToBase}>
                <i className="fas fa-undo me-2"></i>Reset to Base ({confidence.baseLevel})
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={() => {
                  setShowCalculator(true);
                  setNewAbilityTotal(confidence.abilityTotal || 0);
                }}
              >
                <i className="fas fa-calculator me-2"></i>Recalculate Base
              </button>
            </div>
          </Col>
        </Row>

        <Alert variant="secondary" className="mt-3 mb-0" style={{ fontSize: '0.85rem' }}>
          <strong>When to Check:</strong> Year begins, celebration canceled, natural disaster, enemy invasion, major events
        </Alert>
      </Card.Body>
    </Card>
  );
}

export default ConfidenceTracker;
