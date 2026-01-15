import { useState, useEffect } from 'react';
import { getDefaultCalendarConfig, advanceDate, getNextMonth } from '../utils/dateUtils';

const STORAGE_KEY = 'shadowdark_domains';
const ACTIVE_DOMAIN_KEY = 'shadowdark_active_domain';

export const useDomainManager = () => {
  const [domains, setDomains] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [activeDomainId, setActiveDomainId] = useState(() => {
    return localStorage.getItem(ACTIVE_DOMAIN_KEY) || null;
  });

  // Save domains to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
  }, [domains]);

  // Save active domain ID
  useEffect(() => {
    if (activeDomainId) {
      localStorage.setItem(ACTIVE_DOMAIN_KEY, activeDomainId);
    }
  }, [activeDomainId]);

  const createDomain = (domainData) => {
    const id = Date.now().toString();
    const newDomain = {
      id,
      createdAt: new Date().toISOString(),
      ...domainData,
      // Initialize structures
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
      // NEW: Calendar configuration
      calendarConfig: domainData.calendarConfig || getDefaultCalendarConfig(),
      // NEW: Current date tracking (replaces currentYear/currentMonth)
      currentDate: domainData.currentDate || {
        year: 1,
        month: 1,
        day: 1,
        isSpecialDay: false,
        specialDayIndex: null,
        specialDayOffset: null
      },
      eventHistory: [],
      notes: ''
    };

    setDomains(prev => ({ ...prev, [id]: newDomain }));
    setActiveDomainId(id);
    return id;
  };

  const updateDomain = (id, updates) => {
    setDomains(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates, updatedAt: new Date().toISOString() }
    }));
  };

  const deleteDomain = (id) => {
    setDomains(prev => {
      const newDomains = { ...prev };
      delete newDomains[id];
      return newDomains;
    });
    if (activeDomainId === id) {
      const remainingIds = Object.keys(domains).filter(domainId => domainId !== id);
      setActiveDomainId(remainingIds.length > 0 ? remainingIds[0] : null);
    }
  };

  const addEvent = (id, event) => {
    const domain = domains[id];
    if (!domain) return;

    const newEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      // NEW: Use full date object instead of separate year/month
      date: event.date || {
        year: domain.currentDate.year,
        month: domain.currentDate.month,
        day: domain.currentDate.day,
        isSpecialDay: domain.currentDate.isSpecialDay || false,
        specialDayIndex: domain.currentDate.specialDayIndex || null,
        specialDayOffset: domain.currentDate.specialDayOffset || null
      }
    };

    updateDomain(id, {
      eventHistory: [...domain.eventHistory, newEvent]
    });
  };

  const calculatePopulationGrowth = (currentPop) => {
    let growthRate = 0;
    
    // Growth rate based on population size
    if (currentPop <= 100) growthRate = 0.25;
    else if (currentPop <= 200) growthRate = 0.20;
    else if (currentPop <= 300) growthRate = 0.15;
    else if (currentPop <= 400) growthRate = 0.10;
    else if (currentPop <= 500) growthRate = 0.05;
    else growthRate = 0.01 + (Math.random() * 0.04); // 1-5% for 500+
    
    const growth = Math.floor(currentPop * growthRate);
    const randomChange = Math.floor(Math.random() * 21) - 10; // -10 to +10
    
    return Math.max(0, currentPop + growth + randomChange);
  };

  const advanceMonth = (id) => {
    const domain = domains[id];
    if (!domain) return;

    // Use date utility to advance to next month
    const newDate = getNextMonth(domain.currentDate, domain.calendarConfig);

    // Calculate population growth
    const newPopulation = calculatePopulationGrowth(domain.population || 0);

    updateDomain(id, {
      currentDate: newDate,
      population: newPopulation
    });

    return {
      month: newDate.month,
      year: newDate.year,
      isNewYear: newDate.month === 1,
      populationChange: newPopulation - (domain.population || 0)
    };
  };

  const advanceYear = (id) => {
    const domain = domains[id];
    if (!domain) return;

    const newDate = {
      year: domain.currentDate.year + 1,
      month: 1,
      day: 1,
      isSpecialDay: false,
      specialDayIndex: null,
      specialDayOffset: null
    };

    updateDomain(id, {
      currentDate: newDate
    });

    return newDate.year;
  };

  // NEW: Advance by one day
  const advanceDay = (id) => {
    const domain = domains[id];
    if (!domain) return;

    const newDate = advanceDate(domain.currentDate, domain.calendarConfig);

    updateDomain(id, {
      currentDate: newDate
    });

    return newDate;
  };

  // NEW: Set date to a specific value
  const setDate = (id, newDate) => {
    const domain = domains[id];
    if (!domain) return;

    updateDomain(id, {
      currentDate: newDate
    });

    return newDate;
  };

  const exportDomains = () => {
    const dataStr = JSON.stringify(domains, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shadowdark-domains-${Date.now()}.json`;
    link.click();
  };

  const importDomains = (jsonData) => {
    try {
      const imported = JSON.parse(jsonData);
      setDomains(imported);
      const firstId = Object.keys(imported)[0];
      if (firstId) setActiveDomainId(firstId);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  };

  const activeDomain = activeDomainId ? domains[activeDomainId] : null;

  return {
    domains,
    activeDomain,
    activeDomainId,
    setActiveDomainId,
    createDomain,
    updateDomain,
    deleteDomain,
    addEvent,
    advanceMonth,
    advanceYear,
    advanceDay, // NEW
    setDate, // NEW
    exportDomains,
    importDomains
  };
};
