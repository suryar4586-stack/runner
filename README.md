 # 🏃 Dash Runner

 An original, frontend-only 3-lane endless runner game -built with ** React + Vite **,no backend,no database,no external assets.Inspired by the *genere* of endless runners,but not a clone of any specific game:no copied names,characters,maps ,or sounds.

 ---
 ## Quick Start
 
 ```bash
 npm install
 npm run dev
 ```

 Open **http://localhost:5173** - the game is playable immediately.

 To build a production bundle:
 ```bash 
 npm run build 
 npm run preview # preview the production build locally
```

---
## Project Structure

```
runner-game/
|___package.json
|___index.html
|___src/
     |__main.jsx  ->  React entry point
     |__App.jsx   -> all game logic(loop,state,rendering)
     |__App.css   -> all styling (screens,lanes,animations)
```

---

## Controls

|Action |Desktop | Mobile |
|---|---|---|
|Move left|`<-` or `A`|Left button |
|Move right|`->` or `D`|Right button|
|Jump|`↑` or `W`, or `Space` |Jump button |

Touch controls automatically appear on screen <= 768px wide and are hidden on desktop.

---

## How it works

### Game loop

A single `requestAnimationFrame` loop in `App.jsx` runs every frame while`screen === 'playing'`. Each tick it:
1.Increase speed (ramps from `BASE_SPEED` to `MAX_SPEED` over `SPEED_RAMP_TIME` ms,then caps).
2. Increase score (faster as speed increases).
3.Mover every obstacle/coin closer to the player by decrementing a `distance` value.
4.Spawns new obstacles/coins at intervals (obstacle spwan rate increase with score).
5.Checks collisions and coin pickups
6.Removes anything that has passed the player.
7.Pushes updated numbers into React state for the HUD.

### The "3D road" illusion
Obstacles and coins dont have an x/y position - they only have a `lane`(0,1,2) and a `distance`(1000->0,far->close).Two small helper functions convert that into screen coordinates:

`distanceToTop(distance)`-> vertical position (far =near top,close=near bottom)
`distanceToScale(distance)`->size(far =small,close=large)

This is what creates the perspective effect with zero physics or 3D libraries.

### Collision detection 
A collision only counts when **all three** are true:
- Object is in the **same lane** as the player
- Object's `distance` is close to `PLAYER_DISTANCE`(within a small window)
- Player is **not currently jumping**

## performance 
Most game data (obstalces,coins,speed,score)lives in `useRef`,not `useState` - so updating it every fram doesn't trigger unnecessary React re-renders.Only the HUD values and a `forceRender` counter actually cause the UI to update.

---

### tech stack
  - **React 18** -UI and game screens
  - **Vite** -dev server & bundler
  -**Plain CSS** -all visuals,animations and responsive layout
  -**No external game libraries**-collision detection ,spawing, and rendering are all hadn-written

  ---

  ### Adding Future Features
  |Feature| Approach|
  |---|---|
  | **Power-ups**| Add a `kind` field to spawned coins(`shield`,`magent`,`slow`).Track an `activePowerUp`ref with a timer that temporarily disables collision or auto-collects coins.|
  |**character skins**|Save a `skin` string to `localStorage`.Swap`.player-body`'s background gradient based on it .Add a skin picker to the start screen.|
  |**LeaderBoard**| Requires a backend simple Express + SQLite API with `POST/scores` and `GET/scores/top10`,called from `endGame()`.|
  |**Login System**| Backend with JWT auth-register/login endpoints,
  store token in `localStorage`,attach it when submitting scores.|
  |**Saved progress**| Once login exists, add`GET/progresss`and`PUT/progress` endpoints to persist best score ,total coins and unlocked skins per user.|
  |**Backend API**| Node + Express + SQLite is enough for all of the above.Deploy seprately (Render,Railway,FLy.io) and point this frontend's `fetch` calls at its URL.|
  None of these are required for the core games -it's fully playable as-is with zero backend.

  ---
  ## License 
  this is original work for personal/educational use.No copyrighted characters,names,logos or assets from any existing game are used.