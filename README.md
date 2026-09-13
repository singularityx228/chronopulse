# TimerX - ChronoPulse

**Live online stopwatch / countdown timer / 1v1 VS arena**

[![Demo](https://raw.githubusercontent.com/singularityx228/chronopulse/master/og-image.png)](https://singularityx228.github.io/chronopulse/)

## What is it?
- **Millisecond-precision stopwatch** that runs entirely in the browser.
- **Countdown timer** with custom target times.
- **Live Turkey clock** that updates every second.
- **Real-time multiplayer arena** (MQTT-based) where you can battle the AI TiMi bot or other players.
- **Multiple game modes** - Normal, Ultra-Low, Ultra, Guess, Overstep, etc.
- **Multi-language UI** (TR / EN / ES) and PWA installation support.
- **Graphics-performance preset menu** (Ultra Low to Ultra) that automatically saves the choice to localStorage.

## Why this repo?
- Demonstrates **pure-client-side performance optimizations** (GPU acceleration, throttled updates, memoised formatters).
- Shows **real-time MQTT sync** for leaderboards and VS matchmaking without any backend server.
- Provides a **fully responsive Tailwind UI** with dark-mode ready design.
- Great starter for learning **WebSockets, PWA, and high-precision timing** in JavaScript.

## Security & privacy
- All **frontend code is obfuscated**; reverse-engineering is deliberately hard.
- The **core game logic (MQTT broker, bot AI) runs on the client**, so no secret keys or server-side code are exposed.
- No tracking libraries or third-party analytics are included.

## Play now!
Visit the live site, pick a graphics preset, and start a stopwatch or a VS battle. The UI automatically remembers your settings across devices.

**https://singularityx228.github.io/chronopulse/**

---
*Built with love by **singularityx228** - a hobbyist who loves precise timers and fast web experiences.*
