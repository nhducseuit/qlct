# QLTC Backend

Backend service for the Quản Lý Chi Tiêu (QLTC) application, built with NestJS and Prisma.

## Prerequisites

- Node.js (version specified in `package.json` or latest LTS)
- npm or yarn
- PostgreSQL database server running

## Setup Instructions

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd qltc-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Prisma and Database:**

    *   **Install Prisma CLI and Client (if not already in `package.json`):**
        ```bash
        npm install prisma --save-dev
        npm install @prisma/client
        ```

    *   **Initialize Prisma (if the `prisma` folder and `schema.prisma` don't exist):**
        This command creates the `prisma` directory, a basic `schema.prisma` file, and a `.env` file for your database connection string.
        ```bash
        npx prisma init
        ```

    *   **Configure Database Connection:**
        Open the `.env` file in the project root and update the `DATABASE_URL` with your PostgreSQL connection string.
        Example:
        ```env
        DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/qltc_db"
        ```
        Replace `youruser`, `yourpassword`, `localhost`, `5432`, and `qltc_db` with your actual database credentials and details.

    *   **Apply Database Migrations:**
        This command inspects your `prisma/schema.prisma` file and applies any pending migrations to create or update your database tables. For the initial setup, it will create all tables.
        ```bash
        npx prisma migrate dev --name init
        ```
        *(Replace `--name init` with a more descriptive name for subsequent migrations, e.g., `--name add_new_feature`)*

4.  **Run the application (development mode):**
    ```bash
    npm run start:dev
    ```

The backend server should now be running, typically on `http://localhost:3000`.

---

*(Further sections like API Endpoints, Environment Variables, etc., can be added here.)*