# Sprints and Product Backlog

---

## 🚀 Sprint 1

### 🎯 Sprint Goal
Establish a reliable development foundation by defining a structured version control workflow, creating a reproducible development environment, and producing essential design documentation to support future implementation.

### 📚 Software Engineering Topics
- Source Control (branching, merging, collaboration)
- SDLC (design, planning, preparation)
- Agile & Scrum (team workflow, iteration readiness)
- Project Management (process definition, coordination)
- Teamwork & Collaboration

### 📌 Supporting PBIs

#### 🔴 High Priority

**User Story:**  
As a developer, I want to define a branching and merging strategy, so that the team follows a consistent and conflict-free workflow.

**Acceptance Criteria:**
- A documented branching strategy exists (e.g., main, dev, feature branches)
- The workflow defines how and when branches are created, merged, and deleted
- The team can explain the workflow during demonstration
- The workflow is accessible to all team members

---

**User Story:**  
As a developer, I want to use a structured version control system, so that I can work independently without conflicts and safely integrate code.

**Acceptance Criteria:**
- A shared repository is created and accessible to all team members
- Each team member creates at least one branch and commits changes
- At least one pull request is created, reviewed, and merged
- Merge conflicts (if any) are resolved and demonstrated
- All contributions can be viewed from a single machine

---

#### 🟡 Medium Priority

**User Story:**  
As a developer, I want a consistent and reproducible development environment, so that I can reliably demonstrate functionality without setup issues.

**Acceptance Criteria:**
- A documented setup process exists
- A new machine can follow the steps and run the project successfully
- The environment is used during the sprint demonstration
- No undocumented setup steps are required

---

**User Story:**  
As a team, we want to define how completed work will be demonstrated, so that we can clearly verify acceptance criteria are met.

**Acceptance Criteria:**
- A documented demonstration process exists
- The process defines what must be shown for each completed PBI
- The team follows this process during a mock or real demo
- The demonstration proves at least one completed PBI

---

#### 🟢 Low Priority

**User Story:**  
As a developer, I want to create foundational design documents, so that I can clearly understand system structure before implementation.

**Acceptance Criteria:**
- At least one system-level design document is created
- At least one feature-level design document is created
- Documents map to at least three functional requirements
- Documents are accessible to all team members
- The team can explain the design during demonstration

---

## 🚀 Sprint 2

### 🎯 Sprint Goal
Build a minimal playable vertical slice of the game by implementing a basic UI, a single-lane interaction system, and a simple gameplay loop, while introducing an initial testing approach to validate functionality.

### 📚 Software Engineering Topics
- Problem Solving (game loop logic, interaction design)
- SDLC (implementation + early testing)
- Agile & Scrum (iterative delivery of a working slice)
- Source Control (continued use of branching + collaboration)
- Testing (introduction to validation strategies)
- Teamwork & Collaboration

### 📌 Supporting PBIs

#### 🔴 High Priority

**User Story:**  
As a player, I want to see a game canvas with basic visual elements, so that I can understand where gameplay occurs.

**Acceptance Criteria:**
- A game canvas is rendered within the browser
- Canvas size follows constraints (400x400 or 800x400)
- At least one visible UI element is present (background, boundary, or placeholder)
- The canvas renders in at least one desktop browser and one mobile-compatible view
- The game loads without errors when opened

---

**User Story:**  
As a developer, I want a single-lane grid system, so that entities can be placed and managed consistently.

**Acceptance Criteria:**
- A single lane is represented visually or logically on the canvas
- At least one valid placement position exists
- Invalid placements outside the lane are prevented
- The grid structure can be reused for future expansion
- The team can demonstrate placing an entity in the lane

---

**User Story:**  
As a player, I want to place a unit on the grid, so that I can interact with the game.

**Acceptance Criteria:**
- A click or tap allows placement of a unit on a valid grid position
- The unit appears visibly on the canvas after placement
- Placement only works within valid positions
- Placement behavior (single vs multiple units) is defined and demonstrated
- The interaction works in at least one browser

---

#### 🟡 Medium Priority

**User Story:**  
As a player, I want a unit to interact with an enemy, so that the game has meaningful behavior.

**Acceptance Criteria:**
- At least one enemy entity exists in the game
- At least one unit can affect the enemy (damage, block, or similar)
- The interaction produces a visible or measurable result
- The interaction is demonstrated during sprint review
- The behavior is consistent across multiple runs

---

**User Story:**  
As a developer, I want to document how gameplay functionality will be tested, so that we can verify correctness and prepare for future testing.

**Acceptance Criteria:**
- A testing document exists outlining how features will be validated
- At least two test scenarios are defined (e.g., placement, interaction)
- At least one simple test (manual or automated) is demonstrated
- Expected vs actual results are clearly shown
- The document is accessible to the team

---

**User Story:**  
As a team, we want a playable vertical slice, so that we can demonstrate a working game loop.

**Acceptance Criteria:**
- The game can be launched in a browser
- A user can place a unit and observe interaction with an enemy
- The demo follows the defined demonstration strategy from Sprint 1
- The demo runs without crashes during presentation
- The team can walk through the full interaction during review

---

## 📦 Product Backlog

### 🔴 High Priority
1. Define branching and merging strategy  
2. Implement version control workflow  
3. Game canvas and UI foundation  
4. Single-lane grid system  
5. Unit placement system  

### 🟡 Medium Priority
6. Development environment setup  
7. Demonstration strategy definition  
8. Basic gameplay interaction (unit vs enemy)  
9. Testing documentation and example  
10. Playable vertical slice integration  

### 🟢 Low Priority
11. Foundational design documentation  

---
