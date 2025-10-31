# Motor Output Simulator

A Next.js web application that simulates motor output with PID and Feedforward control systems.

## Features

- **PID Control**: Toggle on/off with tunable parameters (kP, kI, kD)
- **Feedforward Control**: Toggle on/off with parameters:
  - kS (Static Friction) - Overcomes initial resistance
  - kV (Velocity) - Velocity-based feedforward
  - kA (Acceleration) - Acceleration-based feedforward
- **Real-time Graph**: Displays desired vs actual output over time
- **Motor Constraints**: 12V max supply voltage
- **Interactive Controls**: Adjust desired output with a slider
- **Reset Function**: Clear graph and restart simulation

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the motor simulator.

## How to Use

1. **Enable Control Modes**: Toggle PID and/or Feedforward control
2. **Adjust Desired Output**: Use the slider to set target motor output (0-100%)
3. **Tune Parameters**: When enabled, adjust PID or FF parameters using the sliders
4. **Monitor Performance**: Watch the real-time graph showing desired vs actual output
5. **Reset**: Click "Reset Simulation" to clear data and start over

## Technologies Used

- [Next.js 14](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data visualization

## Deployment

### Deploy to GitHub Pages

This project is configured to deploy to GitHub Pages automatically. See [GITHUB_DEPLOY.md](GITHUB_DEPLOY.md) for detailed instructions.

Quick steps:
1. Push code to GitHub
2. Enable GitHub Pages in repository settings (Source: GitHub Actions)
3. Your site will be live at: `https://YOUR_USERNAME.github.io/motor-simulator/`

### Alternative: Deploy on Vercel

You can also deploy using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/motor-simulator)
