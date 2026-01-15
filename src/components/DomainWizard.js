import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

function DomainWizard({ show, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [domainData, setDomainData] = useState({
    name: '',
    rulerName: '',
    rulerClass: 'Fighter',
    rulerLevel: 4,
    abilityTotal: 0,
    domainType: 'wilderness',
    population: 0
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const rollResources = () => {
    // Roll for number of resources (1d10)
    const numResourcesRoll = Math.floor(Math.random() * 10) + 1;
    let numResources = 1;
    if (numResourcesRoll >= 2 && numResourcesRoll <= 7) numResources = 2;
    else if (numResourcesRoll >= 8 && numResourcesRoll <= 9) numResources = 3;
    else if (numResourcesRoll === 10) numResources = 4;
    
    const resources = { animal: 0, vegetable: 0, mineral: 0 };
    
    // Roll for each resource type (1d10)
    for (let i = 0; i < numResources; i++) {
      const typeRoll = Math.floor(Math.random() * 10) + 1;
      if (typeRoll >= 1 && typeRoll <= 3) {
        resources.animal++;
      } else if (typeRoll >= 4 && typeRoll <= 8) {
        resources.vegetable++;
      } else {
        resources.mineral++;
      }
    }
    
    return resources;
  };

  const handleCreate = () => {
    // Roll base confidence
    const roll = Math.floor(Math.random() * 100) + 1;
    const baseConfidence = roll + 150 + domainData.abilityTotal;
    
    // Roll resources
    const resources = rollResources();

    const newDomain = {
      ...domainData,
      resources,
      confidence: {
        baseLevel: baseConfidence,
        currentLevel: baseConfidence,
        abilityTotal: domainData.abilityTotal
      },
      currentYear: domainData.startingYear,
      currentMonth: domainData.startingMonth
    };

    onCreate(newDomain);
    
    // Reset wizard
    setStep(1);
    setDomainData({
      name: '',
      rulerName: '',
      rulerClass: 'Fighter',
      rulerLevel: 4,
      abilityTotal: 0,
      domainType: 'wilderness',
      population: 0,
      startingYear: 1,
      startingMonth: 1
    });
  };

  const canProceed = () => {
    if (step === 1) return domainData.name && domainData.rulerName;
    if (step === 2) return domainData.abilityTotal >= 3 && domainData.abilityTotal <= 108;
    return true;
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-home me-2"></i>
          Create New Domain - Step {step} of 3
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 1 && (
          <>
            <h5 className="mb-3">Basic Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Domain Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Barony of Ironpeak, City of Silverhaven, Wizard's Tower"
                value={domainData.name}
                onChange={(e) => setDomainData({ ...domainData, name: e.target.value })}
              />
              <Form.Text className="text-muted">
                Any stronghold, city, castle, or territory can be a domain
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ruler Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Bjorn the Bold"
                value={domainData.rulerName}
                onChange={(e) => setDomainData({ ...domainData, rulerName: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ruler Class</Form.Label>
              <Form.Select
                value={domainData.rulerClass}
                onChange={(e) => setDomainData({ ...domainData, rulerClass: e.target.value })}
              >
                <option value="Fighter">Fighter</option>
                <option value="Priest">Priest</option>
                <option value="Thief">Thief</option>
                <option value="Wizard">Wizard</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ruler Level</Form.Label>
              <Form.Control
                type="number"
                min="4"
                max="10"
                value={domainData.rulerLevel}
                onChange={(e) => setDomainData({ ...domainData, rulerLevel: parseInt(e.target.value) })}
              />
              <Form.Text className="text-muted">
                Domain management starts at 4th level in Shadowdark
              </Form.Text>
            </Form.Group>
          </>
        )}

        {step === 2 && (
          <>
            <h5 className="mb-3">Ruler Abilities</h5>
            <Alert variant="info">
              <strong>Confidence Formula:</strong> (1d100 + 150) + Total Ability Scores<br />
              Add up all 6 ability scores (STR+DEX+CON+INT+WIS+CHA)
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Total of All 6 Ability Scores *</Form.Label>
              <Form.Control
                type="number"
                min="3"
                max="108"
                value={domainData.abilityTotal}
                onChange={(e) => setDomainData({ ...domainData, abilityTotal: parseInt(e.target.value) || 0 })}
                placeholder="Enter sum (typical: 36-72)"
              />
              <Form.Text className="text-muted">
                Average is 54 (9 per ability). Range: 3-108
              </Form.Text>
            </Form.Group>

            {domainData.abilityTotal > 0 && (
              <Alert variant="secondary">
                <strong>Estimated Base Confidence:</strong> {200 + domainData.abilityTotal} to {250 + domainData.abilityTotal}<br />
                <small>(Will roll 1d100 when you create the domain)</small>
              </Alert>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h5 className="mb-3">Starting Conditions</h5>
            
            <Form.Group className="mb-3">
              <Form.Label>Domain Type *</Form.Label>
              <Form.Select
                value={domainData.domainType}
                onChange={(e) => {
                  const type = e.target.value;
                  let suggestedPop = 0;
                  
                  // Set suggested starting population based on type
                  if (type === 'civilized') {
                    suggestedPop = Math.floor(Math.random() * 4501) + 500; // 500-5000
                  } else if (type === 'borderlands') {
                    suggestedPop = Math.floor(Math.random() * 1001) + 200; // 200-1200
                  } else {
                    suggestedPop = Math.floor(Math.random() * 91) + 10; // 10-100
                  }
                  
                  setDomainData({ 
                    ...domainData, 
                    domainType: type,
                    population: suggestedPop
                  });
                }}
              >
                <option value="wilderness">Wilderness (10-100 families)</option>
                <option value="borderlands">Borderlands (200-1,200 families)</option>
                <option value="civilized">Civilized (500-5,000 families)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Determines starting population range and growth rate
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Starting Population (Families)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={domainData.population}
                onChange={(e) => setDomainData({ ...domainData, population: parseInt(e.target.value) || 0 })}
              />
              <Form.Text className="text-muted">
                Each family = 5 people. Auto-generated based on domain type.
              </Form.Text>
            </Form.Group>

            <Alert variant="success">
              <strong>Ready to create domain!</strong><br />
              <ul className="mb-0 mt-2">
                <li><strong>{domainData.name}</strong></li>
                <li>Ruled by {domainData.rulerName} (Lvl {domainData.rulerLevel} {domainData.rulerClass})</li>
                <li>Type: {domainData.domainType.charAt(0).toUpperCase() + domainData.domainType.slice(1)}</li>
                <li>Population: {domainData.population} families ({domainData.population * 5} people)</li>
                <li>Base Confidence will be auto-rolled (1d100 + 150 + abilities)</li>
                <li>Resources will be auto-rolled (1-4 resources by type)</li>
              </ul>
              <small className="text-muted mt-2 d-block">
                This domain will be added to your active campaign and share its calendar timeline.
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
        {step < 3 ? (
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

export default DomainWizard;
