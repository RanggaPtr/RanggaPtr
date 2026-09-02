# RanggaPtr Jungle Profile — Setup

## 1. Copy files
Copy everything from this starter pack into the root of:

`RanggaPtr/RanggaPtr`

Final structure:

```text
RanggaPtr/
├── README.md
├── assets/
│   └── gorilla-intro.svg
├── docs/
│   ├── index.html
│   ├── style.css
│   └── game.js
└── .github/
    └── workflows/
        └── jungle-snake.yml
```

## 2. Commit
Suggested commit:

`feat(profile): launch jungle gorilla profile`

## 3. Enable GitHub Actions write access
Repository:

`Settings → Actions → General → Workflow permissions`

Select:

`Read and write permissions`

Save.

## 4. Generate contribution snake
Open:

`Actions → Jungle Contribution Snake → Run workflow`

Wait until the run is green.

The workflow will create/update an `output` branch with:

- `github-snake.svg`
- `github-snake-dark.svg`

## 5. Enable the playable Gorilla Jungle Run
Open:

`Settings → Pages`

Set:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

Click Save.

The game URL should become:

`https://ranggaptr.github.io/RanggaPtr/`

GitHub can take a short time to publish the first deployment.

## 6. Test
Open:

- Profile: `https://github.com/RanggaPtr`
- Game: `https://ranggaptr.github.io/RanggaPtr/`

Expected behavior:

### GitHub profile
- Jungle hero is immediately visible.
- Gorilla beats its chest.
- Gorilla runs out of the banner.
- Contribution snake animates.
- README stays short.

### Game page
- Intro overlay plays once on each page load.
- Gorilla chest-beats and runs away.
- Press Start Run.
- `Space`, `↑`, or tap = jump.
- `↓` = duck.
- Collect bananas.
- Avoid bugs and tree stumps.
- High score is stored in the browser.

## Important limitation
GitHub README cannot execute JavaScript or open a true popup over GitHub's UI.

The animated SVG hero is therefore the profile-side "Discord decoration" effect.
The full interactive animation/game runs on GitHub Pages after the visitor presses PLAY.
