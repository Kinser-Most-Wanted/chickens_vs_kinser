=== SUGGESTED SPRINT GOALS ===

SPRINT: 5

SPRINT GOAL: Improve gameplay feel and user experience by introducing timing systems, visual feedback, and clearer state communication, transforming the current implementation from a functional prototype into a more readable and responsive game.

SOFTWARE ENGINEERING TOPICS: Problem Solving (timing systems and state transitions) SDLC (implementation and refinement) Agile & Scrum (incremental UX improvements, inspect and adapt) Source Control (continued integration practices) Testing (state validation, timing accuracy) Project Management (task breakdown, prioritization) Teamwork & Collaboration

SUPPORTING PBIs:

Priority: High
Title: Implement Placement Cooldown System - H
User Story:
As a player, I want a cooldown between placing the same unit type, so that placement decisions feel strategic and balanced

Acceptance Criteria:

Given a unit is placed and the same unit is selected again, when placement is attempted, then placement is blocked until the cooldown expires
Given a cooldown is active, when the player attempts placement, then the system prevents the action
Given the cooldown expires, when the player attempts placement, then placement succeeds
Given multiple unit types exist, when cooldowns are applied, then each unit type tracks its cooldown independently

Priority: High
Title: Add Visual Feedback for Cooldowns - H
User Story:
As a player, I want to see when a unit is on cooldown, so that I understand when it becomes available again

Acceptance Criteria:

Given a unit is on cooldown, when displayed in the UI, then it visually indicates an unavailable state
Given a cooldown is active, when time progresses, then the UI reflects the remaining cooldown duration
Given a cooldown completes, when the unit becomes available, then the UI updates immediately
Given multiple units exist, when cooldowns differ, then each unit displays its own cooldown state independently

Priority: High
Title: Introduce Pre-Wave Phase with Player Preparation - H
User Story:
As a player, I want time before a wave begins, so that I can prepare my setup and understand the game state

Acceptance Criteria:

Given a level starts, when initialized, then a delay occurs before enemies begin spawning
Given the delay is active, when the player interacts, then unit placement is allowed
Given the delay ends, when the wave begins, then enemy spawning starts
Given the UI is visible, when in the pre-wave phase, then the state is clearly communicated to the player

Priority: High
Title: Improve Placement Feedback (Success and Failure States) - H
User Story:
As a player, I want clear feedback when placing units, so that I understand why actions succeed or fail

Acceptance Criteria:

Given a valid placement, when the action is performed, then a success indicator is displayed
Given an invalid placement, when the action is attempted, then a failure indicator is displayed
Given placement fails, when feedback is shown, then it communicates the reason when applicable
Given repeated placement attempts, when feedback occurs, then it remains consistent and clear

Priority: Medium
Title: Add Enemy Presence Feedback per Row - M
User Story:
As a player, I want to know which rows contain enemies, so that I can make informed placement decisions

Acceptance Criteria:

Given enemies exist, when they are in a row, then the row visually indicates enemy presence
Given no enemies are in a row, when displayed, then the row appears neutral or inactive
Given enemies change state, when they enter or leave a row, then the feedback updates accordingly
Given multiple rows exist, when enemies are present, then each row reflects its own state independently

Priority: Medium
Title: Implement Final Wave Announcement System - M
User Story:
As a player, I want a clear indication of the final wave, so that I understand progression and urgency

Acceptance Criteria:

Given the final wave begins, when triggered, then a visible announcement appears on screen
Given the announcement is displayed, when time passes, then it remains visible long enough to be understood
Given the final wave ends, when completed, then the game transitions appropriately
Given multiple waves exist, when the current wave is not the final wave, then no announcement is shown

Priority: Medium
Title: Introduce Unit Readiness Feedback System - M
User Story:
As a player, I want to know when my units are ready to act, so that I can better understand timing and effectiveness

Acceptance Criteria:

Given a unit is active, when it is ready to perform its action, then a visual indicator is shown
Given a unit is not ready, when displayed, then it appears inactive or charging
Given the unit transitions to a ready state, when the state changes, then feedback updates immediately
Given multiple units exist, when states differ, then each unit reflects its own readiness independently
