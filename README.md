# Ethos Chess (Local Edition)

A standalone chess application built for the Ethos platform. Play against a computer opponent with all game data stored locally in your browser.

## Features
- **AI Opponent:** Play against a computer player using a minimax algorithm.
- **Local Storage:** Your games and history are saved in your browser's `localStorage`.
- **Ethos Identity:** Authenticate using your Ethos profile via Privy.
- **Responsive Design:** Full-width, mobile-friendly UI built with Tailwind CSS v4.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   Create a `.env` file with your Privy App ID:
   ```
   VITE_PRIVY_APP_ID=your_app_id
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Testing
Run the unit tests for chess logic:
```bash
npm run test
```
