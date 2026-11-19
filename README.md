<div align="center">

<img src="resources/icon.png" alt="Ping Monitor logo" width="120" />

# Ping Monitor

**Is it your network, your ISP, or the internet in between?**<br />
A free, open-source network monitor that pings YouTube, Facebook, Zoom and anything else around the
clock, graphs every latency spike and dropped packet, and shows the hop-by-hop path so you can see
exactly where the problem is.

[![Latest release](https://img.shields.io/github/v/release/live-miracles/ping-monitor?label=release&color=4f8cff)](https://github.com/live-miracles/ping-monitor/releases/latest)
[![CI](https://img.shields.io/github/actions/workflow/status/live-miracles/ping-monitor/ci.yml?branch=main&label=CI)](https://github.com/live-miracles/ping-monitor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/live-miracles/ping-monitor)](LICENSE)
[![Stars](https://img.shields.io/github/stars/live-miracles/ping-monitor?style=flat)](https://github.com/live-miracles/ping-monitor/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/live-miracles/ping-monitor)](https://github.com/live-miracles/ping-monitor/commits/main)
[![Platform](https://img.shields.io/badge/installer-Windows-0078d4?logo=windows&logoColor=white)](#install)
[![Electron](https://img.shields.io/badge/Electron-33-47848f?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/live-miracles/ping-monitor/pulls)

[**Download for Windows**](https://github.com/live-miracles/ping-monitor/releases/latest) ·
[How it works](#how-it-works) · [Features](#features) · [Build from source](#build-from-source) ·
[Architecture](docs/ARCHITECTURE.md)

</div>

---

## Why it exists

We run live streams from a studio. When viewers report buffering or glitches, the first question is
always the same: **is it us, or is it them?**

For a long time we answered that with two commercial tools: a PingPlotter-style latency graph,
and ThousandEyes-style path visibility on Grafana dashboards. They work, but they are expensive,
and for a single studio that just wants to know why a stream stuttered, most of their features go
unused.

So we built the part we actually needed, and made it free. Ping Monitor is a small desktop app
you install once and leave running. Later, when something went wrong, you open the graph, find the
moment, and see what happened.

> Ping Monitor is an independent project. It is not affiliated with PingPlotter or ThousandEyes,
> and those names belong to their respective owners. It covers one job, continuous latency and path
> monitoring from one machine, and is not a full replacement for their wider feature sets.

## How it works

Add the destinations your stream depends on, for example `youtube.com`, `facebook.com` and
`zoom.us`, plus your own router and a public DNS like `8.8.8.8`. Ping Monitor pings each one every
second and runs a traceroute to each every 30 seconds. Then read the graphs:

| What the graphs show                                | What it probably means                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Only **one** destination drops (say, YouTube)       | The problem is on that platform's side, or on the route to it. Probably not your studio.                           |
| **All** destinations drop at the same moment        | The problem is local: your network, your router, or your ISP link.                                                 |
| Drops begin at a **specific hop** in the path graph | That hop (with its hostname and owning ISP shown) is where it breaks. Your gateway, your ISP, or somewhere beyond. |

That last row is the point of the Network Path view: it separates _"our provider's link is
broken"_ from _"something outside our ISP, on the way to YouTube, is broken"_, so you know whether
to call your provider or just wait.

## Features

- **Continuous ping**, once a second per target by default (adjustable from 200 ms to 5 minutes),
  with latency and packet loss charted live.
- **Look back in time.** Zoom in on the last 5 minutes to 2 hours of live data, or switch to
  **24 hours, 7 days or 30 days** of stored history. Every lost ping is drawn as a red bar on the
  latency line, so a glitch at 21:14 last night is easy to find.
- **Network Path view**: every hop between you and the target as a branching graph, colored by
  loss and latency. Hops show their hostname and the **organization / ISP that owns the address**,
  so you can name the link that failed. Load-balanced routes show up as parallel branches.
- **Route table**: an MTR-style hop table with per-hop loss % and latency trend, aggregated over
  recent runs so a flaky hop looks different from one that dropped a single probe.
- **Overview tab**: all your targets side by side, either overlaid on one chart or each on its own,
  live or from history. Compare YouTube against Zoom against your gateway at a glance.
- **Alerts**: native desktop notifications when packet loss or latency crosses a threshold you
  set, and again when it recovers.
- **Always on**: closes to the system tray and keeps monitoring in the background, so the graph has
  no gaps when you need it.
- **Local and private**: history lives in a SQLite database on your machine. Export it, or import
  someone else's export to browse read-only. The only outbound lookup besides the probes themselves
  is the ISP/organization name of public hop addresses, via [ip-api.com](https://ip-api.com).
- **Self-updating**: checks GitHub releases and updates in place.

## Install

### Windows

1. Download `Ping-Monitor-Setup-<version>.exe` from the
   [latest release](https://github.com/live-miracles/ping-monitor/releases/latest).
2. Run it. It installs per user, with no admin rights needed, and starts Ping Monitor.
3. Add a few targets with **+ Add Target** and leave it running.

The installer is currently unsigned, so Windows SmartScreen may warn you the first time. Choose
**More info**, then **Run anyway**.

### macOS and Linux

Only a Windows installer is published right now. The app itself is cross-platform, with macOS
(`dmg`) and Linux (`AppImage`) targets configured, so you can [build it from source](#build-from-source).
On those systems probes use the OS `ping` and `traceroute` commands.

## Tips for a streaming studio

- Monitor **the platforms you stream to** (YouTube, Facebook, Twitch, and so on) and **the tools
  you use to collaborate** (Zoom, Teams, and so on). Add your **local gateway** and a public
  resolver (`1.1.1.1`, `8.8.8.8`) as controls: if the gateway is clean but everything beyond it
  drops, it's your ISP; if the gateway itself drops, it's inside the studio.
- Set a **loss alert** (for example 5%) on each target so you hear about trouble as it happens,
  not after the stream.
- After an incident, use the **Latency** chart to find the time, then the **Network Path** for the
  same window to see which hop was unhealthy.
- Run it on a machine that is **always on and wired**, so Wi-Fi on the monitor doesn't create its
  own noise.

## Build from source

Requires Node.js 22 or newer.

```bash
git clone https://github.com/live-miracles/ping-monitor.git
cd ping-monitor
npm install      # also generates the Prisma client and rebuilds better-sqlite3 for Electron
npm run dev      # run the app with hot reload
npm run build:win   # or build:mac / build:linux, to produce an installer in dist/
```

Releases are built by GitHub Actions whenever a `v*` tag is pushed.

## Documentation

- [Architecture and development notes](docs/ARCHITECTURE.md): process layout, IPC contract, database
  design, how the network engine and alerting work.
- The in-app **Help** entry in the sidebar walks through each view.

## Contributing

Issues and pull requests are welcome. Please run the checks CI runs before opening a PR:

```bash
npm run format:check && npm run typecheck && npm test
```

## Keywords

ping monitor, network monitoring, latency monitor, packet loss, traceroute, MTR, network path
visualization, ISP troubleshooting, live streaming network diagnostics, PingPlotter alternative,
ThousandEyes alternative, Electron, React, TypeScript, SQLite.

## License

[MIT](LICENSE)
