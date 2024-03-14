# Backlog
1. Objective: Get the estimation board working locally
a. Get Effort working - DONE 
b. Be able to enter your name - DONE
c. Get clear working  - DONE 

2. Get the estimation board to work remotely for multiple users
- node.js with express running -DONE
- Gonna need a polling function - DONE
- Push the whole local user state (risk/effort/complexity) state up everytime. Only update your row with estimations. -- DONE 
- environment variables ! - DONE
- Fix refresh bug: (1) open app; enter new name "bobby" (2) enter a risk/effort (3) hit refresh... bobby is no longer the current user row... it's at the bottom and is uneditable - DONE
- data table - make columns sortable. - DONE

3. Fix usability and display issues
a. add some padding to the top and center all the things/fix spacing between clear and show button, add a background to the top row of the table - DONE
b. better png/card for hidden values. Better png/card for values not entered
c. Different png/display for hidden vs hidden and not entered - DONE
d. Disable the effort/risk/complexity buttons if the user has not put their username in && - // TODO: remove? how to handle if the user has not put in one of the three levels? -DONE
e. Updating username after the PUT creates a second username - DONE
f. My local user's estimations should always be visible to me - DONE
h. DONE Clear on user 1. User 2's values will not go away. Proposal: maintain a lastClearTimestamp on the local and the server. If the the value changes then clear the local user; setting everything to defaults
 - approach: have the backend maintain a timestamp: "lastClearTimestamp" and if the frontend gets an update updateFromBackend just check that 
    lastClearTimestmap !== the lastclearTimestamp on the server

4. TESTING!
- Edge cases: dont enter a username then click on effort/risk etc..., change username
- Edge case: username collisions
---- MVP ----
DONE 5. Allow for multiple boards
6. Re-integrate backend into this repo
7. Dev environment - dev database for local at least
DONE 8. Fix imports/exports estimators.js
9. Validation on boardname and username (both must be alphanumeric only and between 3 and 64 chars).Add same validation to backend
10. Clean up TODOs
11. Fix all the awaits in front of setBoard/getBoard
12. harden express js backend against exceptions (one exception kills whole server)
13. Harden backend: https://expressjs.com/en/advanced/best-practice-security.html


# Tech/Debt Issue Backlog
1. "id" should be the key we use instead of name; makes updating easier. ( Make the id the identifier/primary key instead of the username)
2. Switch from CRA to vite! omg... when did that die...?
3. Typescript
4. linting/autoformatting
5. cors fixes

BUG
1. BUG: If you put in an estimate before the first updateFromBackend fires you will lose your value that you entered (1) open app enter name (2) enter a risk of high (3) refresh the window (4) click on an effort of low (update from backend fires... you lose your value that you entered)
