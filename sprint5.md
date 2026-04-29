# Sprint 5 - Product Backlog

## Sprint Goal
Transform the current tech demo into a responsive and readable gameplay experience by introducing timing systems, player feedback, and clearer state communication

---

## PBI-5.1 - Implement Placement Cooldown System
**Priority:** High

### User Story
As a player, I want a cooldown between placing the same unit type, so that placement decisions feel strategic and balanced

### Acceptance Criteria
- Given a unit is placed, when the same unit is selected again, then placement is blocked until cooldown expires
- Given a cooldown is active, when the player attempts placement, then the system prevents the action
- Given cooldown expires, when the player attempts placement, then placement succeeds
- Given multiple unit types exist, when cooldown is applied, then it is tracked independently per unit type

---

## PBI-5.2 - Add Visual Feedback for Cooldowns
**Priority:** High

### User Story
As a player, I want to see when a unit is on cooldown, so that I understand when it becomes available again

### Acceptance Criteria
- Given a unit is on cooldown, when displayed in the UI, then it visually indicates unavailable state
- Given cooldown is active, when time progresses, then the UI reflects remaining cooldown
- Given cooldown completes, when the unit becomes available, then the UI updates immediately
- Given multiple units exist, when cooldowns differ, then each displays its own state independently

---

## PBI-5.3 - Introduce Pre-Wave Phase with Player Preparation
**Priority:** High

### User Story
As a player, I want time before a wave begins, so that I can prepare my setup and understand the game state

### Acceptance Criteria
- Given a level starts, when initialized, then a delay occurs before enemies spawn
- Given the delay is active, when the player interacts, then placement is allowed
- Given the delay ends, when the wave begins, then enemy spawning starts
- Given the UI is visible, when in pre-wave phase, then the state is clearly communicated

---

## PBI-5.4 - Improve Placement Feedback
**Priority:** High

### User Story
As a player, I want clear feedback when placing units, so that I understand why actions succeed or fail

### Acceptance Criteria
- Given a valid placement, when performed, then a success indicator is shown
- Given invalid placement, when attempted, then a failure indicator is shown
- Given placement fails, when feedback is shown, then it indicates the reason if applicable
- Given repeated attempts, when feedback occurs, then it remains consistent and clear

---

## PBI-5.5 - Add Enemy Presence Feedback per Row
**Priority:** Medium

### User Story
As a player, I want to know which rows contain enemies, so that I can make informed placement decisions

### Acceptance Criteria
- Given enemies exist, when they are in a row, then the row visually indicates enemy presence
- Given no enemies are in a row, when displayed, then the row appears inactive or neutral
- Given enemies move, when state changes, then feedback updates
- Given multiple rows exist, when enemies are present, then each row reflects its own state

---

## PBI-5.6 - Implement Final Wave Announcement System
**Priority:** Medium

### User Story
As a player, I want a clear indication of the final wave, so that I understand progression and urgency

### Acceptance Criteria
- Given the final wave begins, when triggered, then a visible announcement appears
- Given the announcement is shown, when time passes, then it remains visible long enough to be understood
- Given the final wave ends, when completed, then the game transitions appropriately
- Given multiple waves exist, when not final wave, then no announcement is shown

---

## PBI-5.7 - Introduce Unit Readiness Feedback System
**Priority:** Medium

### User Story
As a player, I want to know when my units are ready to act, so that I can better understand timing and effectiveness

### Acceptance Criteria
- Given a unit is active, when it is ready to perform its action, then a visual indicator is shown
- Given a unit is not ready, when displayed, then it appears inactive or charging
- Given the unit transitions to ready, when state changes, then feedback updates immediately
- Given multiple units exist, when states differ, then each unit reflects its own readiness
