# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Donkey Kong is a classic arcade game reimplemented using **pure vanilla JavaScript (ES6+)** with no build tools, frameworks, or dependencies. The entire game runs in the browser using the HTML5 Canvas 2D API.

## Development Workflow

### Running the Game

Simply open `index.html` in a web browser. No build process, server, or installation required.

For live development with auto-refresh, use a simple HTTP server:

```bash
python -m http.server 8000
# or
npx serve
```

### Testing Changes

1. Edit JavaScript files in the `js/` directory
2. Refresh browser to see changes
3. Use browser DevTools Console for debugging
4. Check canvas rendering and performance in browser DevTools

## Architecture

### Module Loading System

The project uses **manual script ordering** in `index.html` (lines 17-41). Scripts must be loaded in dependency order:

1. **Utilities** (Vector2D, Constants) - Foundation classes
2. **Systems** (InputHandler, Renderer, Physics, CollisionDetector, AudioManager) - Core game systems
3. **Entities** (Platform, Ladder, Player, Barrel, DonkeyKong, Princess, Hammer) - Game objects
4. **Level** - Level construction
5. **GameState & main.js** - State management and entry point

**Critical**: When adding new files, add script tags to `index.html` in the correct dependency order.

### Core Systems

- **Canvas Rendering**: All graphics rendered via HTML5 Canvas 2D API at 1280×720 resolution
- **Game Loop**: Uses `requestAnimationFrame()` for smooth 60 FPS gameplay (see Constants.TARGET_FPS)
- **Physics**: Custom gravity system (980 px/s²) with collision detection
- **Input**: Keyboard event handling for arrow keys and spacebar
- **State Management**: Simple state machine with 5 states defined in `Constants.js`:
  - `STATE_MENU`, `STATE_PLAYING`, `STATE_PAUSED`, `STATE_LEVEL_COMPLETE`, `STATE_GAME_OVER`

### Constants System

**All game parameters are centralized** in `js/utils/Constants.js`:

- Physics values (gravity, jump velocity, friction)
- Entity dimensions and speeds
- Platform heights and positions
- Scoring rules
- Game timing (FPS, level time limit, invincibility duration)
- Colors (retro arcade palette)
- Audio levels

The Constants object is **frozen** to prevent accidental modification. Always reference constants rather than hardcoding values.

### Coordinate System

- Origin (0,0) is top-left corner of canvas
- Y-axis increases downward (standard canvas orientation)
- Platform heights measured from top (e.g., PLATFORM_GROUND: 670, PLATFORM_TOP: 120)
- All positions and dimensions in pixels

### File Organization Pattern

When creating new game entities or systems, follow this structure:

**Entities** (`js/entities/`):

- Should have update() and render() methods
- Use Constants for all configurable values
- Handle their own collision logic
- Example: Player.js, Barrel.js

**Systems** (`js/systems/`):

- Provide services to entities (rendering, physics, input)
- Stateless where possible
- Example: CollisionDetector.js, Physics.js

**Utilities** (`js/utils/`):

- Pure functions and reusable classes
- No game-specific logic
- Example: Vector2D.js, Constants.js

## Styling

The game uses a **retro arcade aesthetic**:

- CSS file: `styles.css`
- Dark theme with scanline overlay effect
- Pixel-perfect rendering (image-rendering: pixelated, no canvas smoothing)
- Animated glowing red border for CRT monitor feel
- Responsive breakpoints: 1400px (desktop), 768px (tablet), 480px (mobile)

## Git Workflow

Repository: `bearded-wizard/donkey-kong`

This project follows **Semantic Versioning** and **Keep a Changelog** conventions:

- Document all changes in CHANGELOG.md
- Use semantic version tags (v0.1.0, v0.2.0, etc.)
- See existing CHANGELOG.md for format examples

## Browser Compatibility

Requires modern browsers with ES6+ support:

- Classes and const/let
- Arrow functions
- Template literals
- Canvas 2D API
- requestAnimationFrame

No transpilation or polyfills - keep the codebase simple and dependency-free.

## Performance Considerations

- Game runs at 60 FPS (Constants.TARGET_FPS)
- Optimize render calls - avoid unnecessary canvas operations
- Limit active entities (e.g., MAX_BARRELS: 8)
- Profile using browser DevTools Performance tab
- Watch for frame drops during barrel spawning or collision detection

## Future Development Notes

Current roadmap items (see README.md):

- Multiple levels
- Sound effects and music (AudioManager system stub exists)
- Hammer power-up (constants defined, entity stub exists)
- High score persistence (localStorage)
- Mobile touch controls
- Animated sprites

**Important**: When implementing features, check if constants already exist in Constants.js before adding new configuration values.
