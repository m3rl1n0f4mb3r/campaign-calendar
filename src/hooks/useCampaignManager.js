import { useState, useEffect } from 'react';
import { getDefaultCalendarConfig, advanceDate, previousDate, getNextMonth } from '../utils/dateUtils';

const STORAGE_KEY = 'shadowdark_campaigns';
const ACTIVE_CAMPAIGN_KEY = 'shadowdark_active_campaign';

export const useCampaignManager = () => {
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [activeCampaignId, setActiveCampaignId] = useState(() => {
    return localStorage.getItem(ACTIVE_CAMPAIGN_KEY) || null;
  });

  // Save campaigns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  // Save active campaign ID
  useEffect(() => {
    if (activeCampaignId) {
      localStorage.setItem(ACTIVE_CAMPAIGN_KEY, activeCampaignId);
    }
  }, [activeCampaignId]);

  // ============================================================================
  // CAMPAIGN OPERATIONS
  // ============================================================================

  const createCampaign = (campaignData) => {
    const id = Date.now().toString();

    // Deep clone calendar config to avoid shared references between campaigns
    const calendarConfig = campaignData.calendarConfig
      ? JSON.parse(JSON.stringify(campaignData.calendarConfig))
      : getDefaultCalendarConfig();

    // Deep clone current date if provided
    const currentDate = campaignData.currentDate
      ? JSON.parse(JSON.stringify(campaignData.currentDate))
      : {
          year: 1,
          month: 1,
          day: 1,
          isSpecialDay: false,
          specialDayIndex: null,
          specialDayOffset: null
        };

    const newCampaign = {
      id,
      name: campaignData.name || 'New Campaign',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Campaign-wide calendar configuration
      calendarConfig,

      // Campaign-wide current date
      currentDate,

      // Campaign-wide event history
      eventHistory: [],

      // Domains within this campaign
      domains: {},

      // Currently selected domain in this campaign
      activeDomainId: null,

      notes: ''
    };

    setCampaigns(prev => ({ ...prev, [id]: newCampaign }));
    setActiveCampaignId(id);
    return id;
  };

  const updateCampaign = (id, updates) => {
    setCampaigns(prev => {
      // Deep clone updates to avoid shared references (especially for arrays like specialDays)
      const clonedUpdates = JSON.parse(JSON.stringify(updates));
      return {
        ...prev,
        [id]: { ...prev[id], ...clonedUpdates, updatedAt: new Date().toISOString() }
      };
    });
  };

  const deleteCampaign = (id) => {
    setCampaigns(prev => {
      const newCampaigns = { ...prev };
      delete newCampaigns[id];
      return newCampaigns;
    });
    if (activeCampaignId === id) {
      const remainingIds = Object.keys(campaigns).filter(campaignId => campaignId !== id);
      setActiveCampaignId(remainingIds.length > 0 ? remainingIds[0] : null);
    }
  };

  // ============================================================================
  // DOMAIN OPERATIONS (within a campaign)
  // ============================================================================

  const createDomain = (campaignId, domainData) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return null;

    const domainId = Date.now().toString();
    const newDomain = {
      id: domainId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Domain-specific data
      name: domainData.name || 'New Domain',
      rulerName: domainData.rulerName || '',
      rulerClass: domainData.rulerClass || 'Fighter',
      rulerLevel: domainData.rulerLevel || 4,
      domainType: domainData.domainType || 'wilderness',

      population: domainData.population || 0,
      resources: domainData.resources || { animal: 0, vegetable: 0, mineral: 0 },
      taxRate: domainData.taxRate || 4,

      staff: domainData.staff || {
        seneschal: 0,
        castellan: 0,
        chiefSteward: 0,
        guardCaptain: 0,
        reeve: 0,
        chaplain: 0,
        engineer: 0,
        servitors: 0
      },

      troops: domainData.troops || {
        normalMen: 0,
        archers: 0,
        footmenLight: 0,
        footmenHeavy: 0,
        crossbowmen: 0,
        longbowmen: 0,
        horsemanLight: 0,
        horsemanMedium: 0,
        horsemanHeavy: 0
      },

      confidence: domainData.confidence || {
        baseLevel: 0,
        currentLevel: 0,
        abilityTotal: 0
      },

      notes: ''
    };

    const updatedDomains = {
      ...campaign.domains,
      [domainId]: newDomain
    };

    updateCampaign(campaignId, {
      domains: updatedDomains,
      activeDomainId: domainId // Auto-select newly created domain
    });

    return domainId;
  };

  const updateDomain = (campaignId, domainId, updates) => {
    const campaign = campaigns[campaignId];
    if (!campaign || !campaign.domains[domainId]) return;

    const updatedDomains = {
      ...campaign.domains,
      [domainId]: {
        ...campaign.domains[domainId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };

    updateCampaign(campaignId, { domains: updatedDomains });
  };

  const deleteDomain = (campaignId, domainId) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const updatedDomains = { ...campaign.domains };
    delete updatedDomains[domainId];

    const remainingDomainIds = Object.keys(updatedDomains);
    const newActiveDomainId = campaign.activeDomainId === domainId
      ? (remainingDomainIds.length > 0 ? remainingDomainIds[0] : null)
      : campaign.activeDomainId;

    // Clean up events associated with this domain
    const updatedEvents = campaign.eventHistory.filter(event => event.domainId !== domainId);

    updateCampaign(campaignId, {
      domains: updatedDomains,
      activeDomainId: newActiveDomainId,
      eventHistory: updatedEvents
    });
  };

  const setActiveDomain = (campaignId, domainId) => {
    updateCampaign(campaignId, { activeDomainId: domainId });
  };

  // ============================================================================
  // EVENT OPERATIONS (campaign-wide)
  // ============================================================================

  const addEvent = (campaignId, event) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const newEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      date: event.date || {
        year: campaign.currentDate.year,
        month: campaign.currentDate.month,
        day: campaign.currentDate.day,
        isSpecialDay: campaign.currentDate.isSpecialDay || false,
        specialDayIndex: campaign.currentDate.specialDayIndex || null,
        specialDayOffset: campaign.currentDate.specialDayOffset || null
      }
    };

    updateCampaign(campaignId, {
      eventHistory: [...campaign.eventHistory, newEvent]
    });
  };

  const addMultipleEvents = (campaignId, events) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const newEvents = events.map((event, index) => ({
      ...event,
      id: `${Date.now()}-${index}`,
      timestamp: new Date().toISOString(),
      date: event.date || {
        year: campaign.currentDate.year,
        month: campaign.currentDate.month,
        day: campaign.currentDate.day,
        isSpecialDay: campaign.currentDate.isSpecialDay || false,
        specialDayIndex: campaign.currentDate.specialDayIndex || null,
        specialDayOffset: campaign.currentDate.specialDayOffset || null
      }
    }));

    updateCampaign(campaignId, {
      eventHistory: [...campaign.eventHistory, ...newEvents]
    });
  };

  const updateEvent = (campaignId, eventId, updates) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const updatedEvents = campaign.eventHistory.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    );

    updateCampaign(campaignId, {
      eventHistory: updatedEvents
    });
  };

  const deleteEvent = (campaignId, eventId) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const updatedEvents = campaign.eventHistory.filter(event => event.id !== eventId);

    updateCampaign(campaignId, {
      eventHistory: updatedEvents
    });
  };

  // ============================================================================
  // DATE/TIME OPERATIONS (campaign-wide)
  // ============================================================================

  const calculatePopulationGrowth = (currentPop) => {
    let growthRate = 0;

    if (currentPop <= 100) growthRate = 0.25;
    else if (currentPop <= 200) growthRate = 0.20;
    else if (currentPop <= 300) growthRate = 0.15;
    else if (currentPop <= 400) growthRate = 0.10;
    else if (currentPop <= 500) growthRate = 0.05;
    else growthRate = 0.01 + (Math.random() * 0.04);

    const growth = Math.floor(currentPop * growthRate);
    const randomChange = Math.floor(Math.random() * 21) - 10;

    return Math.max(0, currentPop + growth + randomChange);
  };

  const advanceDay = (campaignId) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const newDate = advanceDate(campaign.currentDate, campaign.calendarConfig);

    updateCampaign(campaignId, {
      currentDate: newDate
    });

    return newDate;
  };

  const previousDay = (campaignId) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const newDate = previousDate(campaign.currentDate, campaign.calendarConfig);

    updateCampaign(campaignId, {
      currentDate: newDate
    });

    return newDate;
  };

  const advanceMonth = (campaignId) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const newDate = getNextMonth(campaign.currentDate, campaign.calendarConfig);

    // Update population for ALL domains in the campaign
    const updatedDomains = {};
    Object.keys(campaign.domains).forEach(domainId => {
      const domain = campaign.domains[domainId];
      const newPopulation = calculatePopulationGrowth(domain.population || 0);
      updatedDomains[domainId] = {
        ...domain,
        population: newPopulation
      };
    });

    updateCampaign(campaignId, {
      currentDate: newDate,
      domains: updatedDomains
    });

    return {
      month: newDate.month,
      year: newDate.year,
      isNewYear: newDate.month === 1
    };
  };

  const advanceYear = (campaignId) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    const newDate = {
      year: campaign.currentDate.year + 1,
      month: 1,
      day: 1,
      isSpecialDay: false,
      specialDayIndex: null,
      specialDayOffset: null
    };

    updateCampaign(campaignId, {
      currentDate: newDate
    });

    return newDate.year;
  };

  const setDate = (campaignId, newDate) => {
    const campaign = campaigns[campaignId];
    if (!campaign) return;

    updateCampaign(campaignId, {
      currentDate: newDate
    });

    return newDate;
  };

  // ============================================================================
  // EXPORT/IMPORT
  // ============================================================================

  const exportCampaigns = () => {
    const dataStr = JSON.stringify(campaigns, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shadowdark-campaigns-${Date.now()}.json`;
    link.click();
  };

  const importCampaigns = (jsonData) => {
    try {
      const imported = JSON.parse(jsonData);
      setCampaigns(imported);
      const firstId = Object.keys(imported)[0];
      if (firstId) setActiveCampaignId(firstId);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  };

  // ============================================================================
  // CONVENIENCE GETTERS
  // ============================================================================

  const activeCampaign = activeCampaignId ? campaigns[activeCampaignId] : null;
  const activeDomain = activeCampaign && activeCampaign.activeDomainId
    ? activeCampaign.domains[activeCampaign.activeDomainId]
    : null;

  return {
    // Campaign operations
    campaigns,
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    createCampaign,
    updateCampaign,
    deleteCampaign,

    // Domain operations
    activeDomain,
    createDomain,
    updateDomain,
    deleteDomain,
    setActiveDomain,

    // Event operations
    addEvent,
    addMultipleEvents,
    updateEvent,
    deleteEvent,

    // Date/time operations
    advanceDay,
    previousDay,
    advanceMonth,
    advanceYear,
    setDate,

    // Import/export
    exportCampaigns,
    importCampaigns
  };
};
