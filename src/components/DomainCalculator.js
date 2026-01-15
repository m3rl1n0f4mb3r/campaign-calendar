import React, { useState } from 'react';
import { Card, Row, Col, Form, Table, Button } from 'react-bootstrap';
import ConfidenceTracker from './ConfidenceTracker';
import DomainTimeline from './DomainTimeline';

function DomainCalculator({ domain, onUpdateDomain, onAddEvent, onAdvanceMonth, onAdvanceYear }) {
  const [lastGrowthResult, setLastGrowthResult] = useState(null);

  if (!domain) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <i className="fas fa-exclamation-circle text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3">No Domain Selected</h4>
          <p className="text-muted">Select or create a domain to manage finances.</p>
        </Card.Body>
      </Card>
    );
  }

  const updateField = (field, value) => {
    onUpdateDomain({ [field]: value });
  };

  // Population growth calculation
  const rollPopulationGrowth = () => {
    const currentPop = domain.population || 0;
    if (currentPop === 0) {
      setLastGrowthResult({ error: 'No population to grow!' });
      return;
    }

    // Determine growth rate based on population bracket
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
      // 500+ families: roll 1d6 for percentage
      growthRateRoll = Math.floor(Math.random() * 6) + 1;
      growthRate = growthRateRoll;
    }

    // Calculate percentage growth (absolute value)
    const percentageGrowth = Math.floor(currentPop * (growthRate / 100));

    // Roll 1d10: 1-5 = lose the %, 6-10 = gain the %
    const d10Roll = Math.floor(Math.random() * 10) + 1;
    const isGrowth = d10Roll >= 6;
    const totalChange = isGrowth ? percentageGrowth : -percentageGrowth;

    // Calculate new population
    const newPopulation = Math.max(0, currentPop + totalChange);

    // Update domain
    updateField('population', newPopulation);

    // Store result for display
    setLastGrowthResult({
      previousPop: currentPop,
      growthRate,
      growthRateRoll,
      percentageGrowth,
      d10Roll,
      isGrowth,
      totalChange,
      newPopulation
    });
  };

  // Income calculations
  const getIncomeModifier = (confidence) => {
    if (confidence >= 300) return 1.1;
    if (confidence >= 150) return 0.5;
    if (confidence >= 100) return 0.33;
    return 0;
  };

  const confidenceLevel = domain.confidence?.currentLevel ?? 300; // Use ?? instead of || to handle 0 correctly
  const incomeModifier = getIncomeModifier(confidenceLevel);
  const taxModifier = confidenceLevel >= 150 ? 1 : 0; // Zero tax BELOW 150

  const population = domain.population || 0;
  const resources = domain.resources || { animal: 0, vegetable: 0, mineral: 0 };
  const taxRate = domain.taxRate || 4;
  const staff = domain.staff || {};
  const troops = domain.troops || {};
  const isWartime = domain.isWartime || false;
  const wartimeMultiplier = isWartime ? 2 : 1;

  const standardIncome = population * 4 * incomeModifier;
  const taxIncome = population * (taxRate / 10) * taxModifier;
  const resourceIncome = {
    animal: population * (resources.animal * 0.8) * incomeModifier,
    vegetable: population * (resources.vegetable * 0.4) * incomeModifier,
    mineral: population * (resources.mineral * 1.2) * incomeModifier
  };
  const totalResourceIncome = resourceIncome.animal + resourceIncome.vegetable + resourceIncome.mineral;
  const totalIncome = standardIncome + taxIncome + totalResourceIncome;

  // Expense calculations
  const staffCosts = {
    seneschal: (staff.seneschal || 0) * 1600,
    castellan: (staff.castellan || 0) * 800,
    chiefSteward: (staff.chiefSteward || 0) * 400,
    guardCaptain: (staff.guardCaptain || 0) * 1600,
    reeve: (staff.reeve || 0) * 200,
    chaplain: (staff.chaplain || 0) * 200,
    engineer: (staff.engineer || 0) * 300,
    servitors: (staff.servitors || 0) * 2
  };

  const troopCosts = {
    normalMen: (troops.normalMen || 0) * 0.4 * wartimeMultiplier,
    archers: (troops.archers || 0) * 2 * wartimeMultiplier,
    footmenLight: (troops.footmenLight || 0) * 0.8 * wartimeMultiplier,
    footmenHeavy: (troops.footmenHeavy || 0) * 1.2 * wartimeMultiplier,
    crossbowmen: (troops.crossbowmen || 0) * 1.6 * wartimeMultiplier,
    longbowmen: (troops.longbowmen || 0) * 4 * wartimeMultiplier,
    horsemanLight: (troops.horsemanLight || 0) * 8 * wartimeMultiplier,
    horsemanMedium: (troops.horsemanMedium || 0) * 8 * wartimeMultiplier,
    horsemanHeavy: (troops.horsemanHeavy || 0) * 12 * wartimeMultiplier
  };

  const totalStaffCost = Object.values(staffCosts).reduce((a, b) => a + b, 0);
  const totalTroopCost = Object.values(troopCosts).reduce((a, b) => a + b, 0);
  const totalExpenses = totalStaffCost + totalTroopCost;

  const paymentToLiege = totalIncome * 0.2;
  const paymentToTheocracy = totalIncome * 0.1;
  const totalPayments = paymentToLiege + paymentToTheocracy;

  const netIncome = totalIncome - totalExpenses - totalPayments;
  const xpEarned = Math.floor((taxIncome + totalResourceIncome) / 100);

  return (
    <div className="domain-calculator">
      <DomainTimeline 
        domain={domain}
        onAdvanceMonth={onAdvanceMonth}
        onAdvanceYear={onAdvanceYear}
        onUpdateDomain={onUpdateDomain}
        onAddEvent={onAddEvent}
      />

      <ConfidenceTracker domain={domain} onUpdateDomain={onUpdateDomain} />
      
      <Row>
        <Col xs={12} md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-users me-2"></i>Domain Information
              </h3>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label>Domain Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={domain.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Enter domain name"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label>Ruler Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={domain.rulerName || ''}
                      onChange={(e) => updateField('rulerName', e.target.value)}
                      placeholder="Enter ruler name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Population (Families)</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    value={population}
                    onChange={(e) => updateField('population', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <Button
                    variant="outline-success"
                    onClick={rollPopulationGrowth}
                    title="Roll monthly population growth"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <i className="fas fa-dice me-1"></i>
                    Growth
                  </Button>
                </div>
                <Form.Text className="text-muted">Each family = 5 people</Form.Text>

                {lastGrowthResult && !lastGrowthResult.error && (
                  <div className="mt-2 p-2" style={{
                    backgroundColor: 'rgba(108, 117, 125, 0.2)',
                    borderRadius: '4px',
                    fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)'
                  }}>
                    <div className="mb-1">
                      <strong>Growth Rate:</strong>{' '}
                      {lastGrowthResult.growthRateRoll
                        ? <span>1d6 = {lastGrowthResult.growthRateRoll} → </span>
                        : null
                      }
                      {lastGrowthResult.growthRate}% = {lastGrowthResult.percentageGrowth} families
                    </div>
                    <div className="mb-1">
                      <strong>1d10 Roll:</strong> {lastGrowthResult.d10Roll}{' '}
                      → <span style={{ color: lastGrowthResult.isGrowth ? 'var(--sd-positive)' : 'var(--sd-negative)' }}>
                        {lastGrowthResult.isGrowth ? 'Growth (+)' : 'Decline (-)'}
                      </span>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      <strong>Result:</strong> {lastGrowthResult.previousPop}{' '}
                      → <span style={{ color: lastGrowthResult.totalChange >= 0 ? 'var(--sd-positive)' : 'var(--sd-negative)' }}>
                        {lastGrowthResult.newPopulation}
                      </span>{' '}
                      ({lastGrowthResult.totalChange >= 0 ? '+' : ''}{lastGrowthResult.totalChange})
                    </div>
                  </div>
                )}
                {lastGrowthResult?.error && (
                  <div className="mt-2 text-warning" style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)' }}>
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    {lastGrowthResult.error}
                  </div>
                )}
              </Form.Group>

              <h5 className="mt-4 mb-3">Resources</h5>
              <p className="text-muted small mb-2">
                <i className="fas fa-info-circle me-1"></i>
                Auto-rolled at domain creation. Adjust as resources are gained/lost.
              </p>
              <Form.Group className="mb-2">
                <Form.Label>Animal Resources (furs, herds, fish, etc.)</Form.Label>
                <Form.Control
                  type="number"
                  value={resources.animal}
                  onChange={(e) => updateField('resources', {...resources, animal: parseInt(e.target.value) || 0})}
                  min="0"
                  max="10"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Vegetable Resources (farms, timber, wine, etc.)</Form.Label>
                <Form.Control
                  type="number"
                  value={resources.vegetable}
                  onChange={(e) => updateField('resources', {...resources, vegetable: parseInt(e.target.value) || 0})}
                  min="0"
                  max="10"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mineral Resources (gold, silver, gems, iron, etc.)</Form.Label>
                <Form.Control
                  type="number"
                  value={resources.mineral}
                  onChange={(e) => updateField('resources', {...resources, mineral: parseInt(e.target.value) || 0})}
                  min="0"
                  max="10"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tax Rate (sp per family/month)</Form.Label>
                <Form.Control
                  type="number"
                  value={taxRate}
                  onChange={(e) => updateField('taxRate', parseInt(e.target.value) || 0)}
                  min="0"
                />
                <Form.Text className="text-muted">Standard: 4 sp</Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} className="mb-4">
          <Card className="mb-3">
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-coins me-2"></i>Income Summary
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '250px' }}>
                  <tbody>
                  <tr>
                    <td>Standard Income</td>
                    <td className="text-end">{standardIncome.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Tax Income</td>
                    <td className="text-end">{taxIncome.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Animal Resources</td>
                    <td className="text-end">{resourceIncome.animal.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Vegetable Resources</td>
                    <td className="text-end">{resourceIncome.vegetable.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Mineral Resources</td>
                    <td className="text-end">{resourceIncome.mineral.toFixed(0)} gp</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td>TOTAL INCOME</td>
                    <td className="text-end">{totalIncome.toFixed(0)} gp</td>
                  </tr>
                </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-chart-line me-2"></i>Net Income
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '250px' }}>
                  <tbody>
                  <tr>
                    <td>Total Income</td>
                    <td className="text-end">{totalIncome.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Staff Costs</td>
                    <td className="text-end" style={{ color: 'var(--sd-negative)' }}>-{totalStaffCost.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Troop Costs</td>
                    <td className="text-end" style={{ color: 'var(--sd-negative)' }}>-{totalTroopCost.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Payment to Liege (20%)</td>
                    <td className="text-end" style={{ color: 'var(--sd-negative)' }}>-{paymentToLiege.toFixed(0)} gp</td>
                  </tr>
                  <tr>
                    <td>Theocracy Tithe (10%)</td>
                    <td className="text-end" style={{ color: 'var(--sd-negative)' }}>-{paymentToTheocracy.toFixed(0)} gp</td>
                  </tr>
                  <tr style={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    backgroundColor: netIncome >= 0 ? 'var(--sd-positive-bg)' : 'var(--sd-negative-bg)'
                  }}>
                    <td>NET INCOME</td>
                    <td className="text-end" style={{ color: netIncome >= 0 ? 'var(--sd-positive)' : 'var(--sd-negative)' }}>
                      {netIncome >= 0 ? '+' : ''}{netIncome.toFixed(0)} gp/month
                    </td>
                  </tr>
                  <tr>
                    <td>XP Earned</td>
                    <td className="text-end" style={{ color: 'var(--sd-positive)' }}>{xpEarned} XP/month</td>
                  </tr>
                </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-user-tie me-2"></i>Stronghold Staff & Military
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <h5 style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }}>Officials</h5>
                  {Object.entries({
                    seneschal: { label: 'Seneschal', cost: 1600 },
                    castellan: { label: 'Castellan', cost: 800 },
                    chiefSteward: { label: 'Chief Steward', cost: 400 },
                    guardCaptain: { label: 'Guard Captain', cost: 1600 },
                    reeve: { label: 'Reeve', cost: 200 },
                    chaplain: { label: 'Chaplain', cost: 200 },
                    engineer: { label: 'Engineer', cost: 300 }
                  }).map(([key, {label, cost}]) => (
                    <Form.Group className="mb-2" key={key}>
                      <Form.Label>{label} ({cost} gp/month)</Form.Label>
                      <Form.Control
                        type="number"
                        value={staff[key] || 0}
                        onChange={(e) => updateField('staff', {...staff, [key]: parseInt(e.target.value) || 0})}
                        min="0"
                        size="sm"
                      />
                    </Form.Group>
                  ))}
                  <Form.Group className="mb-2">
                    <Form.Label>Servitors (2 gp/month)</Form.Label>
                    <Form.Control
                      type="number"
                      value={staff.servitors || 0}
                      onChange={(e) => updateField('staff', {...staff, servitors: parseInt(e.target.value) || 0})}
                      min="0"
                      size="sm"
                    />
                  </Form.Group>
                  <p className="mt-3" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                    <strong>Total Staff Cost:</strong> {totalStaffCost.toFixed(0)} gp/month
                  </p>
                </Col>

                <Col xs={12} md={6}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)' }} className="mb-0">Military Forces</h5>
                    <Form.Check
                      type="switch"
                      id="wartime-switch"
                      label={isWartime ? "Wartime (2x)" : "Peacetime"}
                      checked={isWartime}
                      onChange={(e) => updateField('isWartime', e.target.checked)}
                      style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                    />
                  </div>
                  {Object.entries({
                    normalMen: { label: 'Normal Men', cost: isWartime ? '8 sp' : '4 sp' },
                    archers: { label: 'Archers', cost: isWartime ? '4 gp' : '2 gp' },
                    footmenLight: { label: 'Light Footmen', cost: isWartime ? '16 sp' : '8 sp' },
                    footmenHeavy: { label: 'Heavy Footmen', cost: isWartime ? '24 sp' : '12 sp' },
                    crossbowmen: { label: 'Crossbowmen', cost: isWartime ? '32 sp' : '16 sp' },
                    longbowmen: { label: 'Longbowmen', cost: isWartime ? '8 gp' : '4 gp' },
                    horsemanLight: { label: 'Light Horsemen', cost: isWartime ? '16 gp' : '8 gp' },
                    horsemanMedium: { label: 'Medium Horsemen', cost: isWartime ? '16 gp' : '8 gp' },
                    horsemanHeavy: { label: 'Heavy Horsemen', cost: isWartime ? '24 gp' : '12 gp' }
                  }).map(([key, {label, cost}]) => (
                    <Form.Group className="mb-2" key={key}>
                      <Form.Label>{label} ({cost}/month)</Form.Label>
                      <Form.Control
                        type="number"
                        value={troops[key] || 0}
                        onChange={(e) => updateField('troops', {...troops, [key]: parseInt(e.target.value) || 0})}
                        min="0"
                        size="sm"
                      />
                    </Form.Group>
                  ))}
                  <p className="mt-3" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                    <strong>Total Troop Cost:</strong> {totalTroopCost.toFixed(0)} gp/month
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DomainCalculator;
