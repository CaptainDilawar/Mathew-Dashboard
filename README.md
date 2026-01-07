# Lead Generation Dashboard

This is a full-stack web application that serves as a dashboard for visualizing lead generation data. It provides an interactive interface to view data from Google Sheets or uploaded CSV files, displaying charts and tables for analysis.

## Features

- **User Authentication**: A simple login page to protect the dashboard. Credentials are managed via an environment file on the backend.
- **Data Visualization**: Interactive charts (Bar, Pie, Line) powered by Chart.js to display key metrics like:
  - Leads per category
  - Companies founded per year
  - Top job positions
- **Google Sheets Integration**: Securely load data directly from your Google Sheets. The application authenticates with the Google Sheets API on the backend.
- **CSV Upload**: Upload your own CSV files containing lead or company data.
- **Mock Data Generation**: Generate random data to quickly see the dashboard's capabilities without needing your own data.
- **Data Table**: View, filter, and sort company data in a paginated table.
- **Data Export**: Export chart data to CSV or the charts themselves as PNG images.
- **AI Chatbot**: An integrated chatbot to assist with data-related queries.

## Tech Stack

- **Frontend**:
  - React (with Vite)
  - Material-UI (MUI) for components and styling
  - Chart.js for data visualization
  - Papa Parse for CSV parsing

- **Backend**:
  - Node.js
  - Express.js for the server and API
  - Google APIs Client Library (`googleapis`) for Google Sheets integration
  - `@google-cloud/local-auth` for handling OAuth 2.0 flow locally.
  - `dotenv` for managing environment variables.

---

## Local Development Setup

Follow these steps to run the application on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- `npm` (usually comes with Node.js)

### 1. Backend Setup

First, set up the backend server.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Google API Credentials:**
    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project or select an existing one.
    - Enable the **Google Drive API** and **Google Sheets API**.
    - Go to "Credentials" and create a new **OAuth 2.0 Client ID**.
    - When asked for the application type, select **Desktop app**. This is the easiest way to run it locally.
    - After creation, click the "Download JSON" button.
    - Rename the downloaded file to `credentials.json` and place it inside the `backend` directory.

4.  **Set up Application Login Credentials:**
    - In the `backend` directory, create a file named `.env`.
    - Add the following content to it. You can change the username and password to whatever you like.
      ```
      APP_USERNAME=admin
      APP_PASSWORD=password
      ```

5.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001`. The first time you access data from Google Sheets, it will open a browser window for you to authenticate. After that, a `token.json` file will be created to keep you logged in.

### 2. Frontend Setup

Now, set up the frontend application in a **new terminal window**.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```

4.  **Access the application:**
    - The command will output a local URL (usually `http://localhost:5173`). Open this URL in your web browser.
    - You will be greeted with the login screen. Use the credentials you set in the `backend/.env` file.

You are now ready to use the Lead Generation Dashboard locally!