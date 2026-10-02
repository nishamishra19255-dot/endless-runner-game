* {
  box-sizing: border-box;
}

:root {
  --bg-1: #070b18;
  --bg-2: #121a2f;
  --panel: rgba(15, 18, 30, 0.82);
  --panel-border: rgba(255, 255, 255, 0.12);
  --cyan: #66e0ff;
  --purple: #9b7bff;
  --pink: #ff5fd2;
  --gold: #ffd76a;
  --text: #edf5ff;
  --muted: #b7c3e6;
  --danger: #ff5c7b;
  --success: #7ef8b9;
  --track: #1a2038;
  --track-dark: #0e1220;
}

html, body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top, #2a1e52 0%, #171c2e 28%, #090d17 65%, #04070d 100%);
  font-family: Arial, Helvetica, sans-serif;
  color: var(--text);
}

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 18px;
}

button {
  font: inherit;
}

.app-shell {
  width: min(100%, 500px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 8px 14px;
}

.brand {
  font-size: clamp(1.1rem, 2vw, 1.7rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hud {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hud-box {
  min-width: 76px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(8, 11, 20, 0.56);
  border: 1px solid var(--panel-border);
  text-align: center;
}

.hud-box span {
  display: block;
  font-size: 0.62rem;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.hud-box strong {
  font-size: 1rem;
}

.game-wrap {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.42);
  background: linear-gradient(180deg, #0d1327 0%, #0d1020 100%);
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  background: linear-gradient(180deg, #10204a 0%, #101729 42%, #0a0916 100%);
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(2, 5, 12, 0.42);
  backdrop-filter: blur(3px);
  transition: opacity 0.2s ease;
}

.overlay.hidden {
  display: none;
}

.panel {
  width: min(82%, 310px);
  background: rgba(10, 14, 24, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  padding: 28px 22px;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: var(--cyan);
  text-transform: uppercase;
}

.panel h1,
.panel h2 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 7vw, 2.5rem);
}

.panel p {
  color: var(--muted);
  line-height: 1.5;
  margin: 0 0 18px;
}

.primary-btn {
  border: none;
  border-radius: 14px;
  padding: 12px 22px;
  background: linear-gradient(135deg, var(--purple), var(--pink));
  color: white;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.primary-btn:hover {
  filter: brightness(1.08);
}

.primary-btn:active {
  transform: translateY(1px) scale(0.99);
}

.controls {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.control-btn {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(12, 17, 27, 0.8);
  color: var(--text);
  font-weight: 700;
  font-size: 0.92rem;
  padding: 14px 10px;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.control-btn:active {
  transform: scale(0.96);
  border-color: rgba(255, 255, 255, 0.22);
}

@media (max-width: 420px) {
  body {
    padding: 12px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .hud {
    width: 100%;
    justify-content: flex-start;
  }
}
