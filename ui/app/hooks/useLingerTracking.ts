'use client';

import { useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface LingerData {
  id: string;
  time: number;
  enter_count: number;
  type: string;
}

export interface LingerEvent {
  event: string;
  properties: {
    organization_id: string;
    visitor_id: string;
    session_id: string;
    payload: Record<string, LingerData>;
  };
}

interface TrackedCard {
  id: string;
  startTime: number;
  totalTime: number;
  enterCount: number;
  isVisible: boolean;
}

export function useLingerTracking(sessionId: string, visitorId: string = '6ee0e958-adb0-49b4-8415-31556bef71e9') {
  const trackedCards = useRef<Map<string, TrackedCard>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Initialize Intersection Observer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute('data-card-id');
          if (!cardId) return;

          const tracked = trackedCards.current.get(cardId);
          
          if (entry.isIntersecting) {
            // Card became visible
            if (tracked) {
              if (!tracked.isVisible) {
                tracked.startTime = now;
                tracked.enterCount += 1;
                tracked.isVisible = true;
              }
            } else {
              // First time seeing this card
              trackedCards.current.set(cardId, {
                id: cardId,
                startTime: now,
                totalTime: 0,
                enterCount: 1,
                isVisible: true
              });
            }
          } else {
            // Card became invisible
            if (tracked && tracked.isVisible) {
              const timeSpent = (now - tracked.startTime) / 1000; // Convert to seconds
              tracked.totalTime += timeSpent;
              tracked.isVisible = false;
            }
          }
        });
      },
      {
        threshold: 0.5, // Card is considered visible when 50% is in view
        rootMargin: '0px'
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Function to register a card element for tracking
  const trackCard = useCallback((cardId: string, element: HTMLElement) => {
    if (!observerRef.current) return;

    // Store element reference
    elementRefs.current.set(cardId, element);
    
    // Add data attribute for identification
    element.setAttribute('data-card-id', cardId);
    
    // Start observing
    observerRef.current.observe(element);
  }, []);

  // Function to unregister a card element
  const untrackCard = useCallback((cardId: string) => {
    const element = elementRefs.current.get(cardId);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
    
    elementRefs.current.delete(cardId);
    
    // Update final time for visible cards before removing
    const tracked = trackedCards.current.get(cardId);
    if (tracked && tracked.isVisible) {
      const now = Date.now();
      const timeSpent = (now - tracked.startTime) / 1000;
      tracked.totalTime += timeSpent;
      tracked.isVisible = false;
    }
  }, []);

  // Function to get current linger metrics as a single grouped event
  const getLingerMetrics = useCallback((): LingerEvent | null => {
    const now = Date.now();
    const payload: Record<string, LingerData> = {};
    
    // Update times for currently visible cards
    trackedCards.current.forEach((tracked, cardId) => {
      if (tracked.isVisible) {
        const timeSpent = (now - tracked.startTime) / 1000;
        tracked.totalTime += timeSpent;
        tracked.startTime = now; // Reset start time
      }
      // Only include cards that have been viewed for some time
      if (tracked.totalTime > 0.1) { // Minimum 100ms
        // Extract actual book ID from tracking ID (format: bookId#index)
        const actualBookId = cardId.includes('#') ? cardId.split('#')[0] : cardId;
        
        // Generate a unique key for this card view session
        const randomkey = `${uuidv4()}`;
        
        payload[randomkey] = {
          id: actualBookId, // Use the actual book ID for the API
          time: Math.round(tracked.totalTime * 100) / 100, // Round to 2 decimal places
          enter_count: tracked.enterCount,
          type: 'product_detail_card'
        };
      }
    });

    // Return null if no meaningful data
    if (Object.keys(payload).length === 0) {
      return null;
    }

    return {
      event: 'feed linger metrics',
      properties: {
        organization_id: 'Bookly',
        visitor_id: visitorId,
        session_id: sessionId,
        payload
      }
    };
  }, [sessionId, visitorId]);

  // Function to reset tracking data (useful for new searches)
  const resetTracking = useCallback(() => {
    // Update final times for visible cards
    const now = Date.now();
    trackedCards.current.forEach((tracked) => {
      if (tracked.isVisible) {
        const timeSpent = (now - tracked.startTime) / 1000;
        tracked.totalTime += timeSpent;
        tracked.isVisible = false;
      }
    });
    
    // Clear all tracking data
    trackedCards.current.clear();
  }, []);

  return {
    trackCard,
    untrackCard,
    getLingerMetrics,
    resetTracking
  };
}
