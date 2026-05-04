---

## ⚙️ Installation & Setup

### 1. Database Setup
1.  Open **MySQL Workbench**.
2.  Import the `db.sql` file located in the `database/` folder.
3.  Ensure the MySQL service is running on your machine.

### 2. Backend Setup
1.  Navigate to the backend folder: `cd brickyield-backend`.
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install dependencies: `pip install -r requirements.txt`.
4.  Run the server: `uvicorn main:app --reload`.

### 3. Frontend Setup
1.  Navigate to the frontend folder: `cd brickyield-frontend`.
2.  Install dependencies: `npm install`.
3.  Start the development server: `npm run dev`.
4.  Open the provided local URL (typically `http://localhost:5173`) in your browser[cite: 1].

---

## 📄 License
This project was developedI understand. Here is the downloadable `README.md` file for your project.

[README.md](sandbox:/mnt/data/README.md)

---
**File Contents Preview:**

# BrickYield: Fractional Real Estate Platform

BrickYield is a specialized fractional real estate platform designed to bridge the gap between property developers and individual investors. The platform enables investors to purchase fractional shares of high-value properties while allowing developers to manage their portfolio, tenants, and revenue streams effectively.

---

## 🚀 Key Features

### For Investors
*   **Property Marketplace**: Browse and purchase fractional shares of residential and commercial properties.
*   **Portfolio Dashboard**: Visualize investment allocation through interactive pie charts and portfolio bubbles[cite: 1].
*   **Financial History**: A dedicated tab to track all share purchase transactions and dividend payouts received[cite: 1].
*   **Real-time Wallet**: Monitor current balance and total passive earnings[cite: 1].

### For Developers
*   **Portfolio Management**: View detailed financials, tenant information, and lease agreements for all listed properties[cite: 1].
*   **Revenue Tracking**: Access a specialized "Financial History" tab to monitor rental revenue records and collection status[cite: 1].
*   **Financial Oversight**: Monitor net income, expenses, and dividend distribution per share[cite: 1].

### For Administrators
*   **User Verification**: Manage and verify KYC status for new investors and developers.
*   **Automated Payouts**: Execute annual dividend distributions based on share ownership records.
*   **System Reports**: Generate high-level overviews of total users, revenue, and property performance using data visualization[cite: 1].

---

## 🛠️ Tech Stack

*   **Frontend**: React.js with Vite, Recharts (for data visualization)[cite: 1].
*   **Backend**: FastAPI (Python).
*   **Database**: MySQL with stored procedures for complex financial logic.
*   **Authentication**: JWT (JSON Web Tokens) for secure session management.

---

## 📁 Project Structure
```text
brickyield/
├── brickyield-frontend/     # React source code & Vite config
│   ├── src/
│   │   ├── App.jsx          # Main application logic & UI
│   │   └── ...
│   └── package.json
├── brickyield-backend/      # FastAPI server & logic
│   ├── main.py              # Entry point
│   ├── database.py          # MySQL connection setup
│   ├── routers/             # API endpoints (investor, developer, admin)
│   └── requirements.txt
└── database/
    └── schema.sql           # Database export including tables & procedures
