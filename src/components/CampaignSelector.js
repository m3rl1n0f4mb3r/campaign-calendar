import React, { useState } from 'react';
import { Card, Button, Dropdown, Modal } from 'react-bootstrap';
import { formatDate, formatYear } from '../utils/dateUtils';
import CalendarSettings from './CalendarSettings';

function CampaignSelector({
  campaigns,
  activeCampaign,
  activeCampaignId,
  onSelectCampaign,
  onDeleteCampaign,
  onNewCampaign,
  onUpdateCampaign
}) {
  const [showDeleteCampaignConfirm, setShowDeleteCampaignConfirm] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);

  const campaignList = Object.values(campaigns);

  const handleDeleteCampaignClick = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteCampaignConfirm(true);
  };

  const confirmDeleteCampaign = () => {
    if (campaignToDelete) {
      onDeleteCampaign(campaignToDelete.id);
    }
    setShowDeleteCampaignConfirm(false);
    setCampaignToDelete(null);
  };

  const handleSaveCalendarConfig = (newConfig) => {
    if (activeCampaignId && onUpdateCampaign) {
      onUpdateCampaign(activeCampaignId, { calendarConfig: newConfig });
    }
  };

  // No campaigns yet
  if (campaignList.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center py-5">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺</div>
          <h3>No Campaigns Yet</h3>
          <p className="text-muted mb-4">Create your first campaign to start tracking your adventure.</p>
          <Button variant="primary" size="lg" onClick={onNewCampaign}>
            <i className="fas fa-plus me-2"></i>
            Create First Campaign
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
            <div className="flex-grow-1">
              <h5 className="mb-1" style={{ fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
                <span className="me-2">🗺</span>
                {activeCampaign ? activeCampaign.name : 'Select a Campaign'}
              </h5>
              {activeCampaign && (
                <div className="text-muted">
                  <small style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                    <strong>{formatDate(activeCampaign.currentDate, activeCampaign.calendarConfig)}</strong>
                    {' • '}{Object.keys(activeCampaign.domains).length} domain(s)
                  </small>
                </div>
              )}
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="px-2">
                <i className="fas fa-ellipsis-v"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Switch Campaign</Dropdown.Header>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {campaignList.map(campaign => (
                    <Dropdown.Item
                      key={campaign.id}
                      active={campaign.id === activeCampaignId}
                      onClick={() => onSelectCampaign(campaign.id)}
                    >
                      <div>
                        <strong>{campaign.name}</strong>
                        <br />
                        <small className="text-muted">
                          {formatYear(campaign.currentDate.year, campaign.calendarConfig)} • {Object.keys(campaign.domains).length} domains
                        </small>
                      </div>
                    </Dropdown.Item>
                  ))}
                </div>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onNewCampaign}>
                  <i className="fas fa-plus me-2"></i>
                  Create New Campaign
                </Dropdown.Item>
                {activeCampaign && (
                  <>
                    <Dropdown.Item onClick={() => setShowCalendarSettings(true)}>
                      <i className="fas fa-cog me-2"></i>
                      Calendar Settings
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      className="text-danger"
                      onClick={() => handleDeleteCampaignClick(activeCampaign)}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Delete Campaign
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Campaign Confirmation */}
      <Modal show={showDeleteCampaignConfirm} onHide={() => setShowDeleteCampaignConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Campaign?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{campaignToDelete?.name}</strong>?</p>
          <p className="text-danger mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            This will delete ALL domains, events, and data in this campaign. This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteCampaignConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteCampaign}>
            <i className="fas fa-trash me-2"></i>
            Delete Campaign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Calendar Settings */}
      {activeCampaign && (
        <CalendarSettings
          show={showCalendarSettings}
          onClose={() => setShowCalendarSettings(false)}
          currentConfig={activeCampaign.calendarConfig}
          onSave={handleSaveCalendarConfig}
        />
      )}
    </>
  );
}

export default CampaignSelector;
