# Option Strategy Simulator

An interactive visualizations tool for analyzing Option strategies using the Black-Scholes model.
Features real-time ROI projections, IV variation analysis, and Greeks visualization.

## Features

- **Real-time Simulation**: Adjust Price, Target, Expiry, and IV to see instant updates.
- **Scenario Analysis**: Visualize ROI if the price hits the target on specific days (30, 60... 360).
- **Interactive Charts**: Responsive Area Charts visualizing P/L zones (Deep ITM vs ATM vs Deep OTM).
- **Greeks & Pricing**: Automatic calculation of Delta, Gamma, Theta, and simulated option prices.

## Tech Stack

- **React** (Vite)
- **Recharts** (Visualization)
- **Lucide React** (Icons)
- **Vite** (Build Tool)

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Locally**
    ```bash
    npm run dev
    ```

3.  **Build**
    ```bash
    npm run build
    ```

## Deployment

This project is configured for **GitHub Pages** deployment via GitHub Actions.

1.  Create a new repository on GitHub.
2.  Push this code to the repository.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
3.  Go to **Settings > Pages** in your repository.
4.  Under **Build and deployment**, select **Source: GitHub Actions**.
5.  The `Deploy to GitHub Pages` workflow (in `.github/workflows/deploy.yml`) will run automatically.

### Configuration

- **Vite Base Path**: The `vite.config.js` is set to `base: './'`. This usually works for standard deployments. If you deploy to a subdirectory (e.g., `user.github.io/repo/`), ensure this matches or stays relative.
