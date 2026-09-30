# Architecture Decisions

PHASE 0 - Creating folder and intsalling the required libraires

1. Created CLIENT folder for the client side ui , basically for react code. Installedd required libraries.
2. Created SERVER folder for the server side backend , basically for the logic and api calls etc. Installed required libraries like express, CORS, dotenv, wesocket etc.....

PHASE-1:
####### STEP:1 #######

1. Wrote basic codes for express.js server just to check whether it is running on prot 3000 or not.
2. Created questiions.js file to store the array of objects for questions in the beginning cause we dont have a database yet to get the questions , it is just for testing.
3. Using in-memory/hardcoded data removes database complexity so I can first understand rooms, players, events, and game state.

##### STEP:2--- Use an in-memory Map for active rooms

**Decision:**  
Active quiz rooms will be stored in a JavaScript `Map`.

**Why:**  
Rooms in Phase 1 only need temporary server-side state. A `Map` allows us to use the room code as the key and efficiently find a room when a player joins.

**Rejected:**  
An array of room objects.

**Reason rejected:**  
An array would require searching through the collection to find a room by its code. `Map` is a better fit for key-based room lookup.

**Limitation:**  
All rooms disappear when the server restarts because the state exists only in memory.

##### STEP:3--Separate Express app configuration from server startup

**Decision:**  
Express configuration lives in `src/app.js`, while `server.js` is responsible for starting the HTTP server.

**Why:**  
This separates application configuration from server startup and makes the Express application easier to test and maintain.

**Structure:**

- `src/app.js` → Express app, middleware, routes
- `server.js` → HTTP server and port

**Rejected:**  
Putting `app.listen()` directly inside `app.js`.

**Reason rejected:**  
It couples application configuration with starting the network server and makes testing the Express application less clean.

---

### 4. Use Socket.IO for real-time quiz communication

**Decision:**  
We will use Socket.IO for real-time communication between the React clients and the Node.js server.

**Why:**  
A live quiz requires the server to immediately communicate events such as players joining, questions starting, and answers being submitted. HTTP request/response is useful for operations such as creating a room, but Socket.IO provides persistent connections and event-based communication for the live parts of the game.

**Rejected:**  
Polling with repeated HTTP requests.

**Reason rejected:**  
Polling would require clients to repeatedly ask the server for updates, creating unnecessary requests and introducing delays between state changes and client updates.

---

### 5. Keep application rooms separate from Socket.IO rooms

**Decision:**  
QUIZZY will maintain its own room state in a JavaScript `Map`, while Socket.IO rooms will be used only to group connected sockets for broadcasting.

**Why:**  
The QUIZZY room contains application state such as the room code, players, and game status. A Socket.IO room only groups socket connections. Keeping these concepts separate makes the application state independent from the communication mechanism.

**Example:**

QUIZZY room:

```text
254870
├── players
└── status
```
