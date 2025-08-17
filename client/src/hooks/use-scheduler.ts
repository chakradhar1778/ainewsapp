import { useState, useEffect, useCallback } from "react";

export function useScheduler() {
  const [triggerTime, setTriggerTime] = useState("06:00");
  const [lastTriggeredDate, setLastTriggeredDate] = useState<string>("");
  const [isSchedulerActive, setIsSchedulerActive] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedTriggerTime = localStorage.getItem('ai-news-trigger-time');
    if (savedTriggerTime) {
      setTriggerTime(savedTriggerTime);
    }

    const savedLastTriggered = localStorage.getItem('ai-news-last-triggered-date');
    if (savedLastTriggered) {
      setLastTriggeredDate(savedLastTriggered);
    }
  }, []);

  // Save trigger time to localStorage
  const updateTriggerTime = useCallback((time: string) => {
    setTriggerTime(time);
    localStorage.setItem('ai-news-trigger-time', time);
  }, []);

  // Check if it's time to trigger
  const checkTriggerTime = useCallback(() => {
    const now = new Date();
    const currentTimeIST = now.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const currentDateIST = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // Check if it's trigger time and we haven't triggered today
    if (currentTimeIST === triggerTime && lastTriggeredDate !== currentDateIST) {
      return true;
    }
    return false;
  }, [triggerTime, lastTriggeredDate]);

  // Manual trigger function
  const manualTrigger = useCallback(async () => {
    try {
      const response = await fetch('/api/triggered-articles');
      if (response.ok) {
        const data = await response.json();
        const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        setLastTriggeredDate(currentDate);
        localStorage.setItem('ai-news-last-triggered-date', currentDate);
        return data;
      }
    } catch (error) {
      console.error('Manual trigger failed:', error);
    }
  }, []);

  // Auto trigger function
  const autoTrigger = useCallback(async () => {
    if (checkTriggerTime()) {
      console.log('Auto-triggering daily fetch...');
      return await manualTrigger();
    }
  }, [checkTriggerTime, manualTrigger]);

  // Set up scheduler with setInterval fallback
  useEffect(() => {
    if (!isSchedulerActive) return;

    // Check every minute for trigger time
    const interval = setInterval(() => {
      autoTrigger();
    }, 60000);

    // Also check immediately
    autoTrigger();

    return () => clearInterval(interval);
  }, [autoTrigger, isSchedulerActive]);

  // Start scheduler when component mounts
  useEffect(() => {
    setIsSchedulerActive(true);
  }, []);

  return {
    triggerTime,
    updateTriggerTime,
    lastTriggeredDate,
    manualTrigger,
    isSchedulerActive
  };
}