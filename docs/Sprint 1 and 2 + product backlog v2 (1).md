# **\=== SUGGESTED SPRINT GOALS \===**

---

## **SPRINT: 1**

### **SPRINT GOAL:**

Establish a collaborative development foundation by implementing version control practices, initializing the game canvas and grid system, integrating team UI contributions, and demonstrating a working client-server connection.

---

### **SOFTWARE ENGINEERING TOPICS:**

* Source Control (branching, merging, collaboration)  
* SDLC (design \+ early implementation)  
* Agile & Scrum (team collaboration, demo readiness)  
* Project Management (coordination, integration)  
* Teamwork & Collaboration

---

## **SUPPORTING PBIs:**

---

### **Priority: High**

**User Story:**  
 As a developer, I want to use a structured version control workflow, so that I can collaborate without conflicts and integrate code safely.

**Acceptance Criteria:**

* A shared repository is created and accessible  
* A branching strategy is defined and documented  
* Each team member creates at least one branch and commit  
* At least one merge per team member is completed  
* The project can be cloned and run from a single machine  
* The team demonstrates the workflow during review

---

### **Priority: High**

**User Story:**  
 As a player, I want to see a game canvas in the browser, so that gameplay can be visually represented.

**Acceptance Criteria:**

* A canvas is rendered in the browser using JavaScript  
* Canvas size follows constraints (400x400 or 800x400)  
* The canvas loads without errors  
* A basic render/update loop is initialized

---

### **Priority: High**

**User Story:**  
 As a developer, I want a single-lane grid system, so that entities can be placed consistently.

**Acceptance Criteria:**

* A single lane is visually or logically represented  
* Grid coordinates map correctly to screen positions  
* At least one valid placement position exists  
* Invalid placements are prevented  
* The grid structure supports future expansion

---

### **Priority: High**

**User Story:**  
 As a development team, we want each member to contribute a UI element or UI design, so that we can collaboratively build the interface and validate integration.

**Acceptance Criteria:**

* Each team member contributes:  
  * A functional UI element OR  
  * A UI design document  
* At least 2 functional UI elements are visible on the canvas  
* All contributions are committed via version control workflow  
* All changes are merged into the main branch  
* The full project runs on a single machine with all contributions visible  
* No unresolved merge conflicts remain

---

### **Priority: Medium**

**User Story:**  
 As a developer, I want to establish a basic client-server connection, so that future gameplay logic can be supported.

**Acceptance Criteria:**

* Client connects to server successfully  
* Server responds to at least one request  
* Connection is demonstrated during sprint review  
* No runtime errors occur during connection

---

---

# **\=== SUGGESTED SPRINT GOALS \===**

---

## **SPRINT: 2**

### **SPRINT GOAL:**

Build a minimal interactive gameplay slice by enabling user input, grid-based placement, entity behavior, and a basic game loop with initial client-server synchronization.

---

### **SOFTWARE ENGINEERING TOPICS:**

* Problem Solving (game logic and interaction)  
* SDLC (implementation \+ validation)  
* Agile & Scrum (incremental delivery of working software)  
* Source Control (continued collaboration practices)  
* Testing (early validation of functionality)  
* Teamwork & Collaboration

---

## **SUPPORTING PBIs:**

---

### **Priority: High**

**User Story:**  
 As a developer, I want to render game entities on the grid, so that gameplay elements are visible.

**Acceptance Criteria:**

* At least one entity type is rendered on the grid  
* Entity positions align with grid coordinates  
* Multiple entities can exist without errors  
* Rendering is consistent across multiple runs

---

### **Priority: High**

**User Story:**  
 As a player, I want to place entities on the grid, so that I can interact with the game.

**Acceptance Criteria:**

* User input (click/tap) is detected  
* Input maps correctly to grid cells  
* Entities can be placed in valid positions  
* Invalid placements are prevented  
* Placement is demonstrated during review

---

### **Priority: High**

**User Story:**  
 As a developer, I want to handle user input, so that interactions trigger gameplay logic.

**Acceptance Criteria:**

* Mouse/touch input is detected  
* Input triggers placement or interaction logic  
* Input handling works consistently across runs

---

### **Priority: Medium**

**User Story:**  
 As a developer, I want a basic game loop, so that the game updates over time.

**Acceptance Criteria:**

* A repeating update loop is implemented  
* Entities update on each cycle  
* The loop runs without crashes or freezes  
* Loop behavior is observable during demo

---

### **Priority: Medium**

**User Story:**  
 As a developer, I want entities to have basic behavior, so that gameplay begins to emerge.

**Acceptance Criteria:**

* At least one entity has a defined behavior (move, idle, or state change)  
* Behavior updates through the game loop  
* Behavior produces visible or measurable results  
* Behavior is consistent across multiple runs

---

---

# **\=== PRODUCT BACKLOG \===**

### **🔴 High Priority**

1. Version control workflow setup and demonstration  
2. Game canvas initialization  
3. Single-lane grid system  
4. Team UI contribution and integration  
5. Render entities on grid  
6. Grid-based placement system  
7. User input handling

---

### **🟡 Medium Priority**

8. Client-server connection setup  
9. Basic game loop  
10. Basic entity behavior

---

### **🟢 Low Priority**

11. Additional UI/UX improvements  
12. Multi-lane expansion  
13. Additional entity types  
14. Performance optimization and refactoring