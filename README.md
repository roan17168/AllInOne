# PartyDeck 🎮

> Zero-friction, offline-first party game hub designed for mobile browsers and tabletop group play.

## 🚀 Instant Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. Navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
4. Choose `main` branch and `/ (root)` folder, then click **Save**.
5. Your party hub is live at `https://<your-username>.github.io/<repo-name>/`!

## 🧩 Adding New Games (Modular Architecture)

Adding a game requires zero build steps:
1. Create a folder in `games/<your-game-slug>/` containing `index.html`, `style.css`, and your game controller logic.
2. Register the metadata in `js/games.config.js`.