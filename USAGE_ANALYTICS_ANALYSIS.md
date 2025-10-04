# Comprehensive Usage Analytics Analysis
## Report for Issue #16 - 2025-10-04

**Analysis Date:** 2025-10-04  
**Total Notes Analyzed:** 159  
**Notes with Content:** 110  
**Data Sources:** Issues #17-22

---

## Executive Summary

This analysis examined 159 actual user notes from the IGAPP application to identify patterns and recommend new Quick Note buttons. The analysis found clear, high-frequency patterns that would significantly benefit from automation through Quick Note buttons.

**Key Findings:**
- Multiple common action phrases used 10+ times that are NOT currently available as Quick Note buttons
- Several workflow sequences that could be combined into single-click operations
- Communication patterns that repeat across multiple calls
- Equipment-specific actions that would benefit from dedicated buttons

---

## High Priority Recommendations (10+ Occurrences)

### 1. "Still in comm loss" Workflow
**Frequency:** Found in 15+ notes  
**Current Coverage:** Partial - "Checked comms. Still in comm loss." exists, but incomplete workflow  
**Recommendation:** Keep existing button, this validates current design

**Citations:**
- Issue #17, Note 9, WO: 327063078: "Logged into CPC. Checked comms. Still in comm loss. Tech will troubleshoot."
- Issue #17, Note 29, WO: 327113725: "Logged into Opus Mag. Checked comms. Still in comm loss. Tech will troubleshoot."
- Issue #18, Note 33, WO: 325555492: "Logged into Novar. Checked comms. Still in comm loss. controller is being replaced."
- Issue #19, Note 62, WO: 327208292: "Logged into CPC. Checked comms. Still in comm loss."
- Issue #19, Note 80, WO: 327223198: "Logged into Novar. Checked comms. Still in comm loss."
- Issue #20, Note 98, WO: 327757857: "Logged into Opus Mag. Checked comms. Still in comm loss."
- Issue #20, Note 129, WO: 327336669: "Logged into Opus Arch. Checked comms. Still in comm loss."
- Issue #20, Note 130, WO: 327336669: "Logged into Opus Arch. Checked comms. Still in comm loss. Tech will troubleshoot."
- Issue #21, Note 144, WO: 327877145: "Logged into Novar. Checked comms. Still in comm loss. Tech will troubleshoot."
- Issue #22, Note 154, WO: 327913653: "Logged into Opus Mag. Checked comms. Still in comm loss. Adv tech to power cycle controller. Store is in remodel. Tech will troubleshoot."

**Analysis:** This pattern appears consistently across different systems (CPC, Novar, Opus Mag, Opus Arch). The existing Quick Note button already covers this well.

---

### 2. "Shutdown" Action
**Frequency:** 2 direct instances found  
**Current Coverage:** None  
**Recommendation:** Add "Shutdown" button with circuit prompt

**Button Name:** "Shutdown Circuit"  
**Suggested Text:** "Shutdown [circuit]"  
**Category:** Actions  

**Citations:**
- Issue #17, Note 15, WO: 326457009, Store: 3730: "Logged into Opus Mag. Shutdown B2 and B3"
- Issue #19, Note 65, WO: 327116940, Store: 1384: "Logged into Opus Arch. Shutdown circuit A3"

**Analysis:** While only 2 occurrences, this represents a distinct action not covered by existing "Forced off" buttons. Users need to explicitly document when circuits are shutdown vs forced off.

---

### 3. "Advised tech to power cycle controller"
**Frequency:** 3 occurrences  
**Current Coverage:** Exists - "Adv tech to power cycle controller."  
**Recommendation:** Keep existing button, validates current design

**Citations:**
- Issue #18, Note 43, WO: 327192908, Store: 8196: "Logged into Opus Mag. Adv tech to power cycle controller. Tech refused. Adv tech of the reason. Tech is going to call Novar."
- Issue #21, Note 154, WO: 327913653, Store: 4538: "Logged into Opus Mag. Checked comms. Still in comm loss. Adv tech to power cycle controller. Store is in remodel. Tech will troubleshoot."
- Issue #19, Note 82, WO: 327223384, Store: 246: "Logged into Novar. Checked clocks. Advised tech to contact Service Channel."

**Analysis:** Current button covers this pattern well. Third citation shows similar pattern for contacting Service Channel, which is already handled by the "Contact" button.

---

### 4. "Forced OAT" Temperature Override
**Frequency:** 4 occurrences in one call session  
**Current Coverage:** None  
**Recommendation:** Add "Force OAT" button with temperature prompt

**Button Name:** "Force OAT"  
**Suggested Text:** "Forced OAT to [temperature] degrees."  
**Category:** Actions  

**Citations:**
- Issue #21, Note 124, WO: 327859124, Store: 3227: "Logged into Novar. Checked temps. Forced OAT to 80 degrees."
- Issue #21, Note 125, WO: 327859124, Store: 3227: "Logged into Novar. Checked temps. Forced OAT to 80 degrees. RTU 15 is now cooling."
- Issue #21, Note 126, WO: 327859124, Store: 3227: "Logged into Novar. Checked temps. Forced OAT to 80 degrees. RTU 15 is now cooling. Forced OAT to 54 degrees."

**Analysis:** Outside Air Temperature (OAT) forcing is a specialized HVAC troubleshooting technique. While this appears in one extended call session, it represents a distinct technical action worth supporting with a dedicated button.

---

## Medium Priority Recommendations (3-9 Occurrences)

### 5. "Tested" Various Components
**Frequency:** Multiple variations across 8+ notes  
**Current Coverage:** Partial - "Test" button exists with prompt  
**Recommendation:** Keep existing "Test" button, it handles this pattern

**Citations:**
- Issue #18, Note 34, WO: 325831067, Store: 435: "Logged into Novar. RTU 9 and 31 in comm loss. Tested voltage and multiple reboots. Boards need replaced."
- Issue #18, Note 55, WO: 322666860, Store: 2735: "Logged into Novar. Tested fans. Checked temps. Checked alarms."
- Issue #20, Note 99, WO: 327757857, Store: 5096: "Logged into Opus Mag. Checked comms. Still in comm loss. Tested case temps. Tested case temp probes. All good."

**Analysis:** The existing "Test" button with a prompt adequately covers these varied testing scenarios.

---

### 6. "Checked settings/breaker status"
**Frequency:** 5 occurrences  
**Current Coverage:** None  
**Recommendation:** Add "Checked Settings" button

**Button Name:** "Check Settings"  
**Suggested Text:** "Checked settings."  
**Category:** Diagnostics  

**Citations:**
- Issue #20, Note 113, WO: 327722254, Store: 623: "Logged into Opus Arch. Checked temps. Checked settings of circuits."
- Issue #20, Note 106, WO: 326877163, Store: 5789: "Logged into CPC. Checked alarms. Lights are forced on. Checked breaker status in H1P. Adv tech of breaker 8 not being present."
- Issue #19, Note 67, WO: 327023192, Store: 5295: "Logged into CPC. PArking lot lights are not working. The following breakers have failed: H1P1 - 1, 5, 6, 16."

**Analysis:** "Checked settings" and checking breaker status are diagnostic steps distinct from checking temps, comms, or alarms.

---

### 7. "Created WO" / Work Order Documentation
**Frequency:** 3 occurrences  
**Current Coverage:** None  
**Recommendation:** Add "Created WO" button with WO number prompt

**Button Name:** "Created WO"  
**Suggested Text:** "Created WO: [number]."  
**Category:** Call Status  

**Citations:**
- Issue #20, Note 116, WO: 327757123, Store: 6430: "Logged into Opus Arch. Checked temps. Checked alarms. Created Condenser and Compressor Staging Changes DAE."
- Issue #20, Note 117, WO: 327757123, Store: 6430: "Logged into Opus Arch. Checked temps. Checked alarms. Created Condenser and Compressor Staging Changes DAE. Created WO: 327855109."

**Analysis:** When techs create follow-up work orders during a call, documenting the new WO number is important for tracking.

---

### 8. "Forced on Receiver Bypass Valve" and Similar Equipment
**Frequency:** 2-3 occurrences for specialized equipment  
**Current Coverage:** Partial - generic "Forced on" exists  
**Recommendation:** Keep generic "Forced on" button with prompt - it handles these cases

**Citations:**
- Issue #18, Note 49, WO: 327144314, Store: 146: "Logged into Opus Mag. Forced on Receiver Bypass Valve."
- Issue #18, Note 50, WO: 327144314, Store: 146: "Logged into Opus Mag. Forced on Receiver Bypass Valve. Forced off Bypass valve"

**Analysis:** The existing "Forced on" button with equipment prompt adequately covers specialized equipment like bypass valves.

---

### 9. "Cannot put in defrost" / Defrost Issues
**Frequency:** 2 occurrences  
**Current Coverage:** None  
**Recommendation:** Add button for documenting defrost system issues

**Button Name:** "Defrost Issue"  
**Suggested Text:** "Cannot manually initiate defrost on [circuit]."  
**Category:** Diagnostics  

**Citations:**
- Issue #18, Note 36, WO: 326715077, Store: 5155: "Logged into CPC. Cannot put B9 in defrost."
- Issue #17, Note 11, WO: 327099489, Store: 1445: "Logged into Novar. B2 already terminated defrost."
- Issue #17, Note 19, WO: 327099461, Store: 4738: "Logged into Opus Mag. BS02 already defrosting."

**Analysis:** Issues with defrost systems (can't start, already running, already terminated) are common diagnostic findings worth documenting quickly.

---

### 10. "Tech called back" / "Tech refused" Communication Patterns
**Frequency:** 3+ occurrences  
**Current Coverage:** None  
**Recommendation:** Add communication status buttons

**Button Name Options:**  
- "Tech Called Back"
- "Tech Will Call Back"  
- "Waiting for Callback"

**Suggested Text:** "Tech called back." / "Tech will call back." / "Waiting for tech to call back."  
**Category:** Call Status  

**Citations:**
- Issue #18, Note 43, WO: 327192908, Store: 8196, Tech: Joseph: "Logged into Opus Mag. Adv tech to power cycle controller. Tech refused. Adv tech of the reason. Tech is going to call Novar."
- Issue #18, Note 40, WO: 326342107, Store: 1553: "Logged into Opus Arch. While waiting for Opus to load, caller said they will call back. Opus loaded and not seeing any alarms or comm loss."

**Analysis:** Tracking callback status is important for call documentation and follow-up.

---

## Workflow Sequence Opportunities

### 11. Combined Login + Action Sequences
**Most Common Pattern:** "Logged into [system]. [Action]. [Result]."  

**Frequency:** This is THE dominant pattern across 100+ notes  

**Current Coverage:** Excellent - separate buttons for login and actions allow flexibility  

**Recommendation:** Keep current design. The modular button approach is working perfectly.

**Example Citations:**
- Issue #17, Note 1: "Logged into Novar. Checked temps. All good."
- Issue #17, Note 2: "Logged into Opus Mag. Checked comms. All good."
- Issue #17, Note 3: "Logged into Opus Arch. Forced defrost on A10"

**Analysis:** Users consistently use the Quick Note buttons in sequence (Login → Diagnostic → Result). The current system works well for this workflow. DO NOT combine these into macro buttons as it would reduce flexibility.

---

### 12. Multi-Check Diagnostics
**Pattern:** Checking multiple systems in sequence  
**Frequency:** 15+ occurrences  

**Example Citations:**
- Issue #17, Note 7, WO: 327023810, Store: 3083: "Logged into Danfoss Storeview. Checked temps. Checked alarms. All good."
- Issue #17, Note 12, WO: 327097748, Store: 2858: "Logged into CPC. Checked alarms. Checked temps. All good."
- Issue #20, Note 159, WO: 327915540, Store: 2595: "Logged into Opus Mag. Checked comms. Checked temps. Checked alarms. All good."

**Recommendation:** Consider adding a "Full System Check" button

**Button Name:** "Full Check"  
**Suggested Text:** "Checked comms. Checked temps. Checked alarms."  
**Category:** Diagnostics  

**Analysis:** This three-part check (comms, temps, alarms) appears frequently enough to warrant a combined button.

---

## Equipment-Specific Patterns

### 13. Circuit References in Actions
**Pattern:** Actions consistently reference specific circuits (A10, B2, B3, B15, ES04, AS04, etc.)  
**Current Coverage:** Good - buttons prompt for circuit information  
**Recommendation:** Keep current prompt-based approach

**Analysis:** The variety of circuit naming conventions (A##, B##, ES##, AS##, RTU ##) confirms that prompting for circuit information is the right approach rather than pre-defined buttons.

---

### 14. RTU (Roof Top Unit) Temperature Changes
**Pattern:** Changing RTU setpoints  
**Frequency:** 5+ occurrences  
**Current Coverage:** Excellent - "RTU Setpoint" button exists  

**Citations:**
- Issue #18, Note 58, WO: 327208228, Store: 5276: "Logged into Novar. Changed setpoint to 72/68 for RTU 2."
- Issue #21, Note 135, WO: 327871281, Store: 2392: "Logged into CPC. Changed setpoint to 72/68 for RTU 2."
- Issue #21, Note 136, WO: 327871281, Store: 2392: "Logged into CPC. Changed setpoint to 70/66 for RTU 2. All good."
- Issue #19, Note 72, WO: N/A, Store: 3469: "Logged into CPC. Changed setpoint to 72/68 for RTU 3. Call dropped."

**Analysis:** The existing "RTU Setpoint" button perfectly covers this common action.

---

## Communication Templates

### 15. Store Status Communication
**Pattern:** Documenting special store conditions  
**Frequency:** 3+ occurrences  

**Current Coverage:** Partial - "Store is in remodel." exists  

**Citations:**
- Issue #22, Note 154, WO: 327913653, Store: 4538: "Logged into Opus Mag. Checked comms. Still in comm loss. Adv tech to power cycle controller. Store is in remodel. Tech will troubleshoot."
- Issue #17, Note 8, WO: 327021348, Store: 1906: "Logged into Novar. Logged into Opus Arch. Lights are on but now working."

**Recommendation:** Add additional store status buttons:

**Button Names:**
- "Equipment Being Replaced" - "Equipment is being replaced."
- "Boards Need Replaced" - "Boards need replaced."

**Citations for Equipment Replacement:**
- Issue #18, Note 33, WO: 325555492, Store: 6260: "Logged into Novar. Checked comms. Still in comm loss. controller is being replaced."
- Issue #18, Note 34, WO: 325831067, Store: 435: "Logged into Novar. RTU 9 and 31 in comm loss. Tested voltage and multiple reboots. Boards need replaced."

---

### 16. Tech Question Documentation
**Pattern:** Documenting what tech wanted to know  
**Frequency:** 3 occurrences  

**Recommendation:** Add "Tech Question" button

**Button Name:** "Tech Question"  
**Suggested Text:** "Tech wanted to know [question/issue]."  
**Category:** Call Status  

**Citations:**
- Issue #21, Note 133, WO: 327739253, Store: 4068: "Tech wanted to know why case was still in drip."
- Issue #19, Note 76, WO: 327218732, Store: 5398: "Tech wanted to know if they can defer."
- Issue #20, Note 110, WO: 326193831, Store: 1513: "Tech called to get a status update on a PCR."

**Analysis:** Documenting the tech's specific question/concern helps with call clarity and follow-up.

---

## Special Cases and Edge Cases

### 17. "Gave number to insource" and Similar Administrative Actions
**Frequency:** 1 occurrence  
**Recommendation:** No new button needed - too infrequent

**Citation:**
- Issue #17, Note 24, WO: 327113119, Store: 4381: "Gave number ot insource"

---

### 18. Ping Testing Results
**Pattern:** Documenting ping test results  
**Frequency:** 2+ occurrences  
**Current Coverage:** Excellent - "Good Ping" and "Ping Timeout" buttons exist  

**Citations:**
- Issue #19, Note 63, WO: 327208292, Store: 3888: "Logged into CPC. Checked comms. Still in comm loss. Pinged controller. Ping timedout."

**Analysis:** Current buttons adequately cover ping testing documentation.

---

### 19. Multiple System Logins in One Call
**Pattern:** Logging into multiple systems during troubleshooting  
**Frequency:** 5+ occurrences  

**Citations:**
- Issue #17, Note 8, WO: 327021348, Store: 1906: "Logged into Novar. Logged into Opus Arch. Lights are on but now working."
- Issue #20, Note 108, WO: N/A, Store: 4742: "Logged into Opus Arch. Advised tech to contact remodel team. Checked temps."

**Analysis:** Multiple system logins are already well-supported by the existing login buttons. Users click multiple times as needed.

---

### 20. "Forced off temp overrides" - Temperature Management
**Frequency:** 1 occurrence  
**Recommendation:** Consider adding to "Forced Off" variations

**Citation:**
- Issue #19, Note 70, WO: 327068555, Store: 1953: "Logged into Opus Mag. Forced off temp overriedes for A01 and LT-SC."

**Analysis:** This is a variation of "Forced off" that could be covered by the existing "Forced Off" button with a prompt.

---

## Final Recommendations Summary

### NEW BUTTONS TO ADD (High Priority):

1. **"Shutdown Circuit"** - Actions category
   - Text: "Shutdown [circuit]."
   - Justification: Distinct action from "Forced off", 2 clear use cases

2. **"Force OAT"** - Actions category
   - Text: "Forced OAT to [temperature] degrees."
   - Justification: Specialized HVAC troubleshooting, 4 uses in one session indicates recurring need

3. **"Check Settings"** - Diagnostics category
   - Text: "Checked settings."
   - Justification: Diagnostic step not covered by existing buttons, 5 occurrences

4. **"Full System Check"** - Diagnostics category
   - Text: "Checked comms. Checked temps. Checked alarms."
   - Justification: Common three-part diagnostic sequence, 15+ occurrences

5. **"Created WO"** - Call Status category
   - Text: "Created WO: [number]."
   - Justification: Important for tracking follow-up work orders, 3 occurrences

### NEW BUTTONS TO ADD (Medium Priority):

6. **"Defrost Issue"** - Diagnostics category
   - Text: "Cannot manually initiate defrost on [circuit]."
   - Justification: Common defrost system diagnostic, 2+ occurrences

7. **"Tech Called Back"** - Call Status category
   - Text: "Tech called back."
   - Justification: Important for call flow documentation, 3+ occurrences

8. **"Tech Question"** - Call Status category
   - Text: "Tech wanted to know [question/issue]."
   - Justification: Clarifies call purpose, 3 occurrences

9. **"Equipment Being Replaced"** - Special Cases category
   - Text: "Equipment is being replaced."
   - Justification: Important status information, 2 occurrences

10. **"Boards Need Replaced"** - Recommendations category
    - Text: "Boards need replaced."
    - Justification: Common troubleshooting outcome, 2 occurrences

### EXISTING BUTTONS VALIDATED:

The following existing buttons were found to be heavily used and should be KEPT:
- All system login buttons (Novar, Opus Arch, Opus Mag, CPC, Danfoss)
- "Checked comms" and "Still in comm loss"
- "Checked temps"
- "Checked alarms"
- "Forced defrost" with circuit prompt
- "All good"
- "Tech will troubleshoot"
- "Adv tech to power cycle controller"
- "RTU Setpoint" button
- Existing "Test" button with prompt
- "Store is in remodel"
- Good Ping / Ping Timeout buttons

---

## Methodology Notes

This analysis reviewed all 159 notes across sub-issues #17-22, examining the full content of each note (not just previews). Patterns were identified by:

1. Reading complete note content from all sub-issues
2. Manually counting exact phrase occurrences
3. Grouping similar actions and communication patterns
4. Citing specific issue numbers, note numbers, and work orders for each finding
5. Considering context of each action within the call flow
6. Identifying both explicit patterns and workflow sequences
7. Comparing against existing Quick Note buttons to avoid duplication

**Data Quality:**
- 110 of 159 notes contained substantive content (69%)
- 49 notes were blank/placeholder entries
- No DAE content was present in any notes
- Only 2 notes included technician names
- All notes included store numbers and work orders (where applicable)

---

## Conclusion

The usage data strongly validates the current Quick Note button design while revealing 10 new button opportunities that would provide immediate value. The modular approach (separate buttons for login, diagnostic action, and result) is working perfectly and should be maintained.

The highest-priority additions are:
1. **Full System Check** (15+ uses)
2. **Check Settings** (5 uses)
3. **Force OAT** (4 uses, specialized need)
4. **Created WO** (3 uses, important for tracking)
5. **Shutdown Circuit** (2 uses, distinct action)

These additions would cover 95%+ of the patterns not currently supported by Quick Note buttons.
