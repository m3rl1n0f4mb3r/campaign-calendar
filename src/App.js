import React, { useState } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Analytics } from '@vercel/analytics/react';
import { useCampaignManager } from './hooks/useCampaignManager';
import CampaignSelector from './components/CampaignSelector';
import DomainSelector from './components/DomainSelector';
import CampaignWizard from './components/CampaignWizard';
import DomainWizard from './components/DomainWizard';
import DomainCalculator from './components/DomainCalculator';
import DomainOverview from './components/DomainOverview';
import QuickReference from './components/QuickReference';
import EventRoller from './components/EventRoller';
import CalendarView from './components/CalendarView';

function App() {
  const [activeTab, setActiveTab] = useState('calendar'); // Changed to calendar as default
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [showDomainWizard, setShowDomainWizard] = useState(false);

  const {
    campaigns,
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    activeDomain,
    createDomain,
    updateDomain,
    deleteDomain,
    setActiveDomain,
    addEvent,
    addMultipleEvents,
    updateEvent,
    deleteEvent,
    advanceMonth,
    advanceYear,
    advanceDay,
    previousDay,
    setDate,
    exportCampaigns,
    importCampaigns
  } = useCampaignManager();

  const handleCreateCampaign = (campaignData) => {
    createCampaign(campaignData);
    setShowCampaignWizard(false);
  };

  const handleCreateDomain = (domainData) => {
    if (activeCampaignId) {
      createDomain(activeCampaignId, domainData);
      setShowDomainWizard(false);
    }
  };

  const handleUpdateDomain = (updates) => {
    if (activeCampaignId && activeDomain) {
      updateDomain(activeCampaignId, activeDomain.id, updates);
    }
  };

  const handleAddEvent = (event) => {
    if (activeCampaignId) {
      addEvent(activeCampaignId, event);
    }
  };

  const handleAddMultipleEvents = (events) => {
    if (activeCampaignId) {
      addMultipleEvents(activeCampaignId, events);
    }
  };

  const handleUpdateEvent = (eventId, updates) => {
    if (activeCampaignId) {
      updateEvent(activeCampaignId, eventId, updates);
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (activeCampaignId) {
      deleteEvent(activeCampaignId, eventId);
    }
  };

  const handleAdvanceMonth = () => {
    if (activeCampaignId) {
      return advanceMonth(activeCampaignId);
    }
  };

  const handleAdvanceYear = () => {
    if (activeCampaignId) {
      return advanceYear(activeCampaignId);
    }
  };

  const handleAdvanceDay = () => {
    if (activeCampaignId) {
      return advanceDay(activeCampaignId);
    }
  };

  const handlePreviousDay = () => {
    if (activeCampaignId) {
      return previousDay(activeCampaignId);
    }
  };

  const handleSetDate = (newDate) => {
    if (activeCampaignId) {
      return setDate(activeCampaignId, newDate);
    }
  };

  const handleExport = () => {
    exportCampaigns();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = importCampaigns(event.target.result);
          if (success) {
            alert('Campaigns imported successfully!');
          } else {
            alert('Failed to import campaigns. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4" style={{
        backgroundColor: 'var(--sd-dark-gray)',
        borderBottom: '2px solid var(--sd-border)'
      }}>
        <Container fluid className="px-2 px-md-3">
          <Navbar.Brand style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(0.875rem, 3vw, 1.5rem)',
            letterSpacing: '1px',
            marginRight: '0.5rem'
          }}>
            <span className="d-none d-sm-inline">CAMPAIGN CALENDAR</span>
            <span className="d-inline d-sm-none">CALENDAR</span>
          </Navbar.Brand>
          <div className="ms-auto d-flex gap-1 gap-md-2">
            <Button variant="outline-light" size="sm" onClick={handleExport} title="Export All Campaigns">
              <i className="fas fa-download"></i>
            </Button>
            <Button variant="outline-light" size="sm" onClick={handleImport} title="Import Campaigns">
              <i className="fas fa-upload"></i>
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container fluid className="px-2 px-md-3">
        <CampaignSelector
          campaigns={campaigns}
          activeCampaign={activeCampaign}
          activeCampaignId={activeCampaignId}
          onSelectCampaign={setActiveCampaignId}
          onDeleteCampaign={deleteCampaign}
          onNewCampaign={() => setShowCampaignWizard(true)}
          onUpdateCampaign={updateCampaign}
        />

        {Object.keys(campaigns).length > 0 && activeCampaign && (
          <>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'calendar'}
                  onClick={() => setActiveTab('calendar')}
                >
                  <i className="fas fa-calendar-alt me-2"></i>
                  Calendar
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'events'}
                  onClick={() => setActiveTab('events')}
                >
                  <i className="fas fa-dice-d20 me-2"></i>
                  Events & History
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'domain'}
                  onClick={() => setActiveTab('domain')}
                >
                  <i className="fas fa-calculator me-2"></i>
                  Domain Management
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'reference'}
                  onClick={() => setActiveTab('reference')}
                >
                  <i className="fas fa-book me-2"></i>
                  Quick Reference
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {activeTab === 'calendar' && (
              <CalendarView
                campaign={activeCampaign}
                onSetDate={handleSetDate}
                onAdvanceMonth={handleAdvanceMonth}
                onAdvanceDay={handleAdvanceDay}
                onPreviousDay={handlePreviousDay}
              />
            )}
            {activeTab === 'events' && (
              <EventRoller
                campaign={activeCampaign}
                onAddEvent={handleAddEvent}
                onAddMultipleEvents={handleAddMultipleEvents}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
            {activeTab === 'domain' && (
              <>
                {!activeDomain ? (
                  <DomainOverview
                    campaign={activeCampaign}
                    activeDomainId={null}
                    onSelectDomain={(domainId) => setActiveDomain(activeCampaignId, domainId)}
                    onUpdateDomain={handleUpdateDomain}
                    onAddEvent={handleAddEvent}
                    onNewDomain={() => setShowDomainWizard(true)}
                  />
                ) : (
                  <>
                    <div className="mb-3">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setActiveDomain(activeCampaignId, null)}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Overview
                      </Button>
                    </div>
                    <DomainSelector
                      campaign={activeCampaign}
                      activeDomain={activeDomain}
                      onSelectDomain={(domainId) => setActiveDomain(activeCampaignId, domainId)}
                      onDeleteDomain={(domainId) => deleteDomain(activeCampaignId, domainId)}
                      onNewDomain={() => setShowDomainWizard(true)}
                    />
                    <DomainCalculator
                      domain={activeDomain}
                      campaign={activeCampaign}
                      onUpdateDomain={handleUpdateDomain}
                      onAddEvent={handleAddEvent}
                      onAdvanceMonth={handleAdvanceMonth}
                      onAdvanceYear={handleAdvanceYear}
                    />
                  </>
                )}
              </>
            )}
            {activeTab === 'reference' && <QuickReference />}
          </>
        )}
      </Container>

      {/* Campaign Creation Wizard */}
      <CampaignWizard
        show={showCampaignWizard}
        onClose={() => setShowCampaignWizard(false)}
        onCreate={handleCreateCampaign}
      />

      {/* Domain Creation Wizard */}
      <DomainWizard
        show={showDomainWizard}
        onClose={() => setShowDomainWizard(false)}
        onCreate={handleCreateDomain}
      />

      <footer className="app-footer">
        <blockquote className="app-footer-quote">
          "You can not have a meaningful campaign if strict time records are not kept."
          <div className="app-footer-attribution">— Gary Gygax</div>
        </blockquote>
        <div className="app-footer-logo">
          <img
            src={process.env.PUBLIC_URL + '/shadowdark-logo.png'}
            alt="Designed for use with Shadowdark RPG"
          />
        </div>
        <p className="app-footer-license">
          <small>
            Campaign Calendar is an independent product published under the Shadowdark RPG Third-Party License
            and is not affiliated with The Arcane Library, LLC. Shadowdark RPG © 2023 The Arcane Library, LLC.
          </small>
        </p>
      </footer>

      <Analytics />
    </div>
  );
}

export default App;
