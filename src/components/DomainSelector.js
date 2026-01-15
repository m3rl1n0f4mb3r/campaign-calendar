import React, { useState } from 'react';
import { Card, Button, Dropdown, Badge, Modal } from 'react-bootstrap';

function DomainSelector({
  campaign,
  activeDomain,
  onSelectDomain,
  onDeleteDomain,
  onNewDomain
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState(null);

  const domainList = campaign ? Object.values(campaign.domains) : [];

  const handleDeleteClick = (domain) => {
    setDomainToDelete(domain);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (domainToDelete) {
      onDeleteDomain(domainToDelete.id);
    }
    setShowDeleteConfirm(false);
    setDomainToDelete(null);
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

  // No domains yet
  if (domainList.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-4">
          <i className="fas fa-home text-muted" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <h5>No Domains in this Campaign</h5>
          <p className="text-muted mb-3">Create your first domain to start tracking finances, confidence, and resources.</p>
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
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1" style={{ fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
                <i className="fas fa-home me-2"></i>
                {activeDomain ? activeDomain.name : 'Select a Domain'}
              </h5>
              {activeDomain && (
                <div className="text-muted">
                  <small style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                    {activeDomain.rulerName} • {' '}
                    <Badge bg={getConfidenceStatus(activeDomain.confidence.currentLevel).variant}>
                      {getConfidenceStatus(activeDomain.confidence.currentLevel).label}
                    </Badge>
                  </small>
                </div>
              )}
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="px-2">
                <i className="fas fa-ellipsis-v"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Switch Domain</Dropdown.Header>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {domainList.map(domain => (
                    <Dropdown.Item
                      key={domain.id}
                      active={activeDomain && domain.id === activeDomain.id}
                      onClick={() => onSelectDomain(domain.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{domain.name}</strong>
                          <br />
                          <small className="text-muted">
                            {domain.rulerName}
                          </small>
                        </div>
                        <Badge bg={getConfidenceStatus(domain.confidence.currentLevel).variant} className="ms-2">
                          {domain.confidence.currentLevel}
                        </Badge>
                      </div>
                    </Dropdown.Item>
                  ))}
                </div>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onNewDomain}>
                  <i className="fas fa-plus me-2"></i>
                  Create New Domain
                </Dropdown.Item>
                {activeDomain && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      className="text-danger"
                      onClick={() => handleDeleteClick(activeDomain)}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Delete Domain
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Domain Confirmation */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Domain?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{domainToDelete?.name}</strong>?</p>
          <p className="text-danger mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            This action cannot be undone. All domain data will be permanently lost.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <i className="fas fa-trash me-2"></i>
            Delete Domain
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DomainSelector;
