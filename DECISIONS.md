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
