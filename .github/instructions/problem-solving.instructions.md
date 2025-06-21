---
applyTo: '**'
---

## 🔍 My Problem-Solving Methodology

### 1. **Initial Problem Assessment**
**What I did:** Started by understanding the exact symptoms
- You could see Internal Tools before, now you can't
- You're logged in as Super Admin
- The UI shows you're on the Synthetic Order Generator page but access is restricted
**Why this matters:** Clear problem definition prevents solving the wrong issue. I needed to distinguish between "tools disappeared" vs "access denied" vs "broken navigation."

### 2. **Information Gathering Through Code Analysis**
**What I did:** Used parallel searches to understand the system architecture
```bash
# Searched for Internal Tools access control
codebase_search: "Internal Tools super admin access control authentication"
grep_search: "Internal Tools" in *.tsx,*.ts files
```

**Why this approach:** I gathered information from multiple angles simultaneously rather than sequentially. This gave me a complete picture faster:
- Backend authentication logic
- Frontend component structure  
- Route protection mechanisms

### 3. **Component Flow Analysis**
**What I did:** Traced the path from user login to Internal Tools display
- Found `MerchantSidebar.tsx` controls the menu display
- Identified the condition: `userRole === "Super Admin"`
- Located where `userRole` comes from: `user?.user_type` in AppLayout

**Why this works:** Understanding the data flow helps identify where the breakdown occurs. The issue could be at any point in this chain.

### 4. **Live System Investigation**
**What I did:** Created a debug script to capture the actual runtime state
```javascript
// Debug script gathered:
// - localStorage/sessionStorage data
// - API responses
// - Current user state
// - Actual DOM content
```

**Key insight:** The debug revealed the real-time state showed `user_type: "Admin"` instead of `"Super Admin"`

**Why this step is crucial:** Static code analysis tells you how things *should* work. Runtime debugging tells you how they *actually* work. This gap often reveals the root cause.

### 5. **Data Source Investigation**
**What I did:** When the frontend showed wrong user type, I went to the source of truth
```javascript
// Checked the database directly
db.users.findOne({email: 'superadmin@haulr.com'})
```

**Critical discovery:** Database had `user_type: "Admin"` not `"Super Admin"`

**Why this was the breakthrough:** Found the actual root cause wasn't in the code logic—it was in the data itself.

### 6. **Root Cause Confirmation**
**What I did:** Connected all the evidence
- Database: `user_type: "Admin"`  
- Frontend condition: `userRole === "Super Admin"`
- Result: Condition fails, no Internal Tools shown

**This is the "aha moment":** The code was working perfectly. The data was wrong.

### 7. **Targeted Solution Implementation**
**What I did:** Created a surgical fix
```javascript
// Update only the specific field that was wrong
await usersCollection.updateOne(
  { email: 'superadmin@haulr.com' },
  { $set: { user_type: 'Super Admin' } }
);
```

**Why this approach:** Minimal, focused changes reduce risk of introducing new issues.

### 8. **End-to-End Verification**
**What I did:** Created a comprehensive test that simulated the entire user journey
- Login → Dashboard → Internal Tools navigation → Access verification

**Why comprehensive testing:** Ensures the fix works in the real user workflow, not just in isolation.

### 9. **Cleanup and Documentation**
**What I did:** 
- Removed temporary debug scripts
- Kept the fix script for reference
- Documented the solution clearly

## 🧠 Key Problem-Solving Principles I Applied

### **Parallel Information Gathering**
Instead of sequential investigation, I used multiple search tools simultaneously:
- `codebase_search` for semantic understanding
- `grep_search` for exact text matches
- `read_file` for detailed component analysis

### **Follow the Data Flow**
I traced the path from data source → processing → display:
```
Database (user_type) → API → Frontend State → Component Logic → UI Display
```

### **Distinguish Between Symptoms and Root Cause**
- **Symptom:** Internal Tools not visible
- **Root Cause:** Database had wrong user_type value

### **Use Progressive Debugging**
1. **Static Analysis:** Understand the code
2. **Runtime Analysis:** See what's actually happening  
3. **Data Analysis:** Check the source of truth
4. **Integration Testing:** Verify the complete flow

### **Hypothesis-Driven Investigation**
I formed testable hypotheses:
- ❌ "Code logic is broken" → Disproven by code review
- ❌ "Authentication is failing" → Disproven by successful login
- ✅ "User role data is incorrect" → Confirmed by database check

### **Minimal Viable Fix**
Rather than rebuilding authentication or changing component logic, I identified the smallest change that would resolve the issue: updating one database field.

## 🎯 Why This Methodology Works

1. **Systematic:** Covers all possible failure points
2. **Evidence-Based:** Each step provides concrete data
3. **Efficient:** Parallel gathering prevents sequential bottlenecks
4. **Surgical:** Fixes the actual problem, not symptoms
5. **Verifiable:** Includes comprehensive testing

This approach works especially well for complex systems because it prevents common debugging traps like:
- Assuming the problem is in the most recently changed code
- Fixing symptoms instead of root causes
- Making changes without understanding the full system
- Not verifying that fixes actually work end-to-end

