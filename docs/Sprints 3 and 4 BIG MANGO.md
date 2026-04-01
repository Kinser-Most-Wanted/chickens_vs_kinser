# **\=== SUGGESTED SPRINT GOALS \===**

---

## **SPRINT: 3**

### **SPRINT GOAL:**

Enhance usability and system functionality by implementing persistent game state, configurable settings, and core gameplay controls while refining the user interface.

---

### **SOFTWARE ENGINEERING TOPICS:**

* State Management (saving/loading game data)  
* File Handling (local storage, config files)  
* SDLC (feature expansion and validation)  
* Agile & Scrum (incremental feature delivery)  
* Testing (validating persistence and configs)  
* Teamwork & Collaboration  
  ---

  ## **SUPPORTING PBIs:**

  ---

  ### **Priority: High**

**User Story:**  
As a player, I want to save my game progress into one of multiple slots, so that I can return to my game later.

**Acceptance Criteria:**

* Player can save to one of three save slots  
* Each save slot stores independent data  
* Save data persists after restarting the application  
* Saved data includes grid state, currency, and progression  
* Save functionality works without errors during demo  
  ---

  ### **Priority: High**

**User Story:**  
As a player, I want to load a saved game at startup, so that I can continue from previous progress.

**Acceptance Criteria:**

* Three save slots are displayed at startup  
* Player can select an existing save or start a new game  
* Game state restores correctly from selected save  
* No errors occur during load process  
  ---

  ### **Priority: High**

**User Story:**  
As a player, I want to modify game settings through a config file, so that I can customize gameplay.

**Acceptance Criteria:**

* Config file is editable outside the game  
* Config changes can be reloaded during runtime  
* Config controls include gameplay-related values (e.g., speed, grid size)  
* Invalid configurations are handled without crashing  
  ---

  ### **Priority: High**

**User Story:**  
As a player, I want to pause and resume the game, so that I can control gameplay flow.

**Acceptance Criteria:**

* Game pauses completely when activated  
* No updates occur while paused  
* Resume restores gameplay correctly  
* Pause/resume is demonstrated during review  
  ---

  ### **Priority: Medium**

**User Story:**  
As a player, I want to speed up gameplay, so that I can progress faster when desired.

**Acceptance Criteria:**

* Fast-forward toggle is available  
* Game speed increases when activated  
* Game logic remains stable at increased speed  
  ---

  ### **Priority: Medium**

**User Story:**  
As a developer, I want to organize the UI layout, so that the interface is clear and usable.

**Acceptance Criteria:**

* UI elements are grouped logically (controls, game area, indicators)  
* UI does not obstruct gameplay  
* Layout is consistent across runs  
  ---

  ### **Priority: Medium**

**User Story:**  
As a player, I want to see wave progression, so that I understand my progress in the game.

**Acceptance Criteria:**

* A visual progress indicator is displayed  
* Progress updates in real time  
* Progress reflects current wave accurately  
  ---

  ---

  # **\=== SUGGESTED SPRINT GOALS \===**

  ---

  ## **SPRINT: 4**

  ### **SPRINT GOAL:**

Expand gameplay depth by implementing core mechanics, progression systems, and dynamic difficulty to create a functional and engaging game loop.

---

### **SOFTWARE ENGINEERING TOPICS:**

* Game Logic Design (combat, progression, scaling)  
* Algorithmic Thinking (wave scaling, lane expansion)  
* SDLC (feature completion and refinement)  
* Agile & Scrum (delivering a playable product increment)  
* Testing (gameplay validation and edge cases)  
* Teamwork & Collaboration  
  ---

  ## **SUPPORTING PBIs:**

  ---

  ### **Priority: High**

**User Story:**  
As a player, I want to place characters on the grid, so that I can interact with gameplay strategically.

**Acceptance Criteria:**

* Characters can be placed on valid grid tiles  
* Invalid placements are prevented  
* Placement updates the game state immediately  
* Placement works consistently across runs  
  ---

  ### **Priority: High**

**User Story:**  
As a developer, I want characters to interact with enemies, so that gameplay mechanics are functional.

**Acceptance Criteria:**

* At least one character can damage an enemy  
* Enemies respond correctly to interactions  
* Combat integrates with the game loop  
* Behavior is consistent across runs  
  ---

  ### **Priority: High**

**User Story:**  
As a player, I want a currency system, so that I can earn and use resources during gameplay.

**Acceptance Criteria:**

* Currency is earned during gameplay  
* Multiple currency types are tracked  
* Currency values persist through save/load  
* Currency is displayed in the UI  
  ---

  ### **Priority: High**

**User Story:**  
As a player, I want increasing difficulty, so that the game becomes more challenging over time.

**Acceptance Criteria:**

* Enemy speed increases over time  
* Spawn rates scale with progression  
* Difficulty progression is noticeable  
* Game remains playable  
  ---

  ### **Priority: High**

**User Story:**  
As a player, I want the number of lanes to expand as I progress, so that gameplay evolves.

**Acceptance Criteria:**

* Game starts with three lanes  
* Additional lanes unlock based on progression  
* UI adjusts correctly to expanded grid  
* No errors occur during expansion  
  ---

  ### **Priority: Medium**

**User Story:**  
As a player, I want a lane-clearing mechanic, so that I have a last line of defense.

**Acceptance Criteria:**

* Mechanic activates when enemies reach the end  
* Clears all enemies in that lane  
* Limited to one use per lane  
  ---

  ### **Priority: Medium**

**User Story:**  
As a player, I want to quickly restart the game, so that I can try again without delay.

**Acceptance Criteria:**

* Game resets instantly  
* All state returns to initial conditions  
* No residual data remains  
  ---

  ---

  # **\=== PRODUCT BACKLOG \===**

  ### **🔴 High Priority**

1. Save system with three slots  
2. Load system and startup selection  
3. Runtime config system (reloadable)  
4. Pause and resume functionality  
5. Character placement system  
6. Combat / interaction system  
7. Currency system implementation  
8. Enemy wave scaling system  
9. Dynamic lane expansion system  
   ---

   ### **🟡 Medium Priority**

10. UI layout organization  
11. Fast-forward system  
12. Wave progress indicator  
13. Lane-clearing mechanic (attack helicopter)  
14. Quick restart system  
    ---

    ### **🟢 Low Priority**

15. Additional UI polish  
16. Additional gameplay balancing  
17. Extended configuration options
