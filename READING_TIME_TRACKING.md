# Reading Time Tracking System

This document explains how the reading time tracking system works in the Dewey application.

## Overview

The reading time tracking system captures how long users spend viewing book cards and stores this data in memory. This data is then sent to the recommendation API when requesting feed updates, allowing the system to learn from user engagement patterns.

## Components

### 1. `useReadingTime` Hook (`/ui/app/hooks/useReadingTime.ts`)

A custom React hook that manages reading time tracking:

**Features:**
- Tracks reading time for individual books
- Stores data in memory using a global Map
- Handles mouse enter/leave events
- Pauses tracking when page becomes hidden
- Provides utilities to get, clear, and manage reading times

**Key Functions:**
- `startReading(bookId)`: Start tracking time for a book
- `stopReading(bookId)`: Stop tracking time for a book
- `getReadingTime(bookId)`: Get total reading time for a book
- `getAllReadingTimes()`: Get all reading times as an object
- `clearReadingTime(bookId)`: Clear reading time for a specific book
- `clearAllReadingTimes()`: Clear all reading times

### 2. Updated Card Component (`/ui/app/components/Card.tsx`)

The Card component now includes reading time tracking:

**Features:**
- Automatically starts tracking when mouse enters the card
- Stops tracking when mouse leaves the card
- Displays reading time in seconds on the card
- Shows reading time indicator in bottom-left corner

**Visual Indicators:**
- Reading time counter appears in bottom-left corner of card image
- Shows time in seconds (e.g., "5s", "12s")
- Only appears when reading time > 0

### 3. Updated Types (`/ui/app/types/book.ts`)

Added new types for reading time tracking in the correct API format:

```typescript
interface FeedLingerPayload {
  [payloadId: string]: { // UUID4 generated on client
    enter_count: number;
    id: string; // The actual book ID
    time: number; // in seconds
    type: string;
  };
}

interface FeedLingerEvent {
  event: string;
  properties: {
    organization_id: string;
    visitor_id: string;
    session_id: string;
    payload: FeedLingerPayload;
  };
}

interface RecommendationRequest {
  // ... existing fields
  events?: FeedLingerEvent[];
}
```

### 4. Updated Recommendation Hook (`/ui/app/hooks/useRecommendations.ts`)

Enhanced to collect and send reading time data:

**Features:**
- Collects reading time events before making API requests
- Sends reading time data with feed update requests
- Provides utilities to access reading time events
- Includes reading time data in both `fetchRecommendations` and `loadMore` functions

**New Functions:**
- `getFeedLingerEvents()`: Get all feed linger events in the correct API format
- `clearReadingTimeEvents()`: Clear all reading time events

### 5. Updated Recommendation Service (`/ui/app/services/recommendationService.ts`)

Modified to include reading time events in API requests:

**Changes:**
- Accepts `events` parameter with `FeedLingerEvent[]` format
- Sends feed linger events in the correct API format
- Logs events for debugging

## How It Works

### 1. User Interaction
1. User hovers over a book card
2. `onMouseEnter` event triggers `startReading(bookId)`
3. Reading time tracking begins

### 2. Time Tracking
1. System records start time when tracking begins
2. Continuously calculates elapsed time
3. When user stops hovering, `onMouseLeave` triggers `stopReading(bookId)`
4. Total reading time is accumulated and stored

### 3. Data Storage
- Reading time data is stored in memory using a global Map
- Data persists across component re-renders
- Data is cleared when explicitly requested or page is refreshed

### 4. API Integration
1. When requesting feed updates, system collects all reading time data
2. Reading time data is formatted as `FeedLingerEvent` objects with the correct structure
3. Events are sent to the API as `events` in the request body
4. API can use this data to improve recommendations based on user engagement patterns

## Usage Example

```typescript
// In a component
const { getFeedLingerEvents, clearReadingTimeEvents } = useRecommendations(sessionId, params);

// Get current feed linger events
const events = getFeedLingerEvents();
console.log('Feed linger events:', events);

// Clear all reading time data
clearReadingTimeEvents();
```

## API Request Format

When making feed requests, feed linger events are included in the request body:

```json
{
  "page": 1,
  "batch_count": 10,
  "events": [
    {
      "event": "feed linger metrics",
      "properties": {
        "organization_id": "fly_finder",
        "visitor_id": "6ee0e958-adb0-49b4-8415-31556bef71e9",
        "session_id": "d9a510fb-10a9-4c76-981e-9988559142f8",
        "payload": {
          "9bc3bfb0-5ef8-4594-aa85-93c36afd1188": {
            "enter_count": 1,
            "id": "27Y0",
            "time": 6.8,
            "type": "product_detail_card"
          },
          "2f48fa05-3089-483a-bd2e-a75bc4d1ba40": {
            "enter_count": 1,
            "id": "3MS8",
            "time": 6.84,
            "type": "product_detail_card"
          }
        }
      }
    }
  ],
  "search_prompt": ""
}
```

## Benefits

1. **User Engagement Insights**: Track which books users spend more time viewing
2. **Improved Recommendations**: Use reading time data to personalize recommendations
3. **Real-time Feedback**: Visual indicators show users their engagement
4. **Memory Efficient**: Data stored in memory, no database required
5. **Automatic Integration**: Seamlessly integrated with existing feed system

## Technical Notes

- Reading time is measured in milliseconds internally but converted to seconds for API
- System tracks enter_count (number of times user hovered over a card)
- System handles page visibility changes (pauses tracking when tab is hidden)
- Only one book can be tracked at a time (hovering over a new book stops previous tracking)
- Feed linger events are automatically included in all feed requests
- Visual indicators update in real-time as users interact with cards
- Uses dummy visitor ID: "6ee0e958-adb0-49b4-8415-31556bef71e9"
- Organization ID is set to "bookly"
- Payload keys are UUID4s generated on the client side
- The `id` field contains the actual book ID

## Future Enhancements

Potential improvements could include:
- Persist reading time data in localStorage
- Add reading time analytics dashboard
- Implement reading time thresholds for "read" status
- Add reading time trends and insights
- Export reading time data for analysis
