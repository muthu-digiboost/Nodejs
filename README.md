# 🚀 CI/CD Testing Pipeline Overview

This document outlines the standard stages and tools used for validating code quality and functionality within our Continuous Integration (CI) environment. The pipeline is structured to ensure fast feedback and thorough coverage, moving from static checks to full end-to-end user flow simulation.

## ✅ Typical CI Pipeline Execution Order

Our pipeline executes tests in the following sequence, prioritized by speed and dependency:

1.  **Code Quality & Validation** (Linting, Static Analysis)
2.  **Unit Tests** (Isolated component checks)
3.  **Database Connection & Schema** (Connectivity, Migrations)
4.  **Integration Tests** (Module communication, DB interactions)
5.  **API / HTTP Tests** (Endpoint validation)
6.  **(Optional)** **E2E, Security, Performance**

| Stage | Focus | Priority & Speed |
| :--- | :--- | :--- |
| **1-2** | Syntax, Style, and Core Logic | ⚡️ **Fast** (Pre-commit / Build) |
| **3-5** | System-level Functionality & Integrations | ⏱️ **Medium** (Core CI Build) |
| **6-8** | User Experience and Production Readiness | 🐢 **Slow** (Staging / Release Build) |

***

## 1. 🔍 Basic Code Quality & Validation

This stage focuses on code style adherence, potential bugs, and type safety before the code is executed.

| Check Type | Description | Example Tools |
| :--- | :--- | :--- |
| **Linting** | Enforces code style, finds basic syntax errors. | **ESLint** (JS), **PHPStan** / **Psalm** (PHP), **Flake8** (Python) |
| **Static Analysis** | Checks for type errors, undefined variables, unused imports *without* running the code. | *(Often integrated into the above tools)* |
| **Code Style** | Automatic formatting to maintain consistent style. | **Prettier**, **PHP-CS-Fixer**, **Black** |

***

## 2. 🧪 Unit Testing

Runs small, isolated tests on individual functions or classes *without* external dependencies.

* **Goal:** Test core business logic (e.g., calculating a discount, verifying a specific algorithm).
* **Method:** Utilizes **mocks/stubs** to simulate external services (DB, APIs) to ensure speed and isolation.

***

## 3. 💾 Database-related Testing (Integration Stage Start)

Ensures the application correctly interacts with the data layer.

| Test Type | Objective | Example CI Command / Action |
| :--- | :--- | :--- |
| **Connection Test** | Confirms CI can connect to DB (MySQL/Postgres/SQLite). | `php bin/console doctrine:database:create --if-not-exists` |
| **Schema & Migration** | Confirms all database migrations run successfully and the schema is valid. | `php bin/console doctrine:migrations:migrate --no-interaction` |
| **Insert & Query** | Inserts temporary dummy data, queries it back, and asserts correctness. | `INSERT INTO users ...` → Assert row count. |
| **Rollback / Transaction** | Ensures data integrity by wrapping tests in a transaction and rolling back. | *Ensures DB stays clean after each test.* |

***

## 4. 🧩 Integration Testing

Tests how multiple modules or services work together, typically involving the application logic and the database.

* **Example 1:** Hit `/api/login` endpoint and verify a user session entry is correctly created in the database.
* **Example 2:** Send a `POST /orders` request and confirm that the stock level decreases in the inventory table.

***

## 5. 🌐 API / HTTP Testing

Validates the public-facing REST/GraphQL endpoints.

* **Checks:** Authentication, request validation, correct response structure, and status codes.
* **Example Tools:** **PHPUnit** + Symfony HttpClient (PHP), **Jest** + Supertest (Node.js), **Postman/Newman** collections.

***

## 6. 🛣️ End-to-End (E2E) Testing

Simulates the complete real user flow, integrating the frontend, backend, and database.

* **User Flow Example:** **Register** → **Login** → **Add to Cart** → **Checkout** → **Verify DB updates** (e.g., a confirmed order record).
* **Example Tools:** **Cypress**, **Playwright**, **Behat**.

***

## 7. 🔒 Security Testing

Focuses on application security and dependency vulnerabilities.

* **Dependency Scanning:** Checks for known vulnerabilities in third-party libraries (e.g., GitHub **Dependabot**, **Snyk**).
* **Vulnerability Testing:** Running basic tests to check for common exploits like SQL injection and Cross-Site Scripting (XSS).

***

## 8. 📊 Performance Testing (Optional)

Load and stress testing to ensure the application handles expected traffic. This is typically run in a dedicated **Staging** environment.

* **Goal:** Measure API response times and system stability under high concurrent load.
* **Example Tools:** **Apache JMeter**, **k6**.