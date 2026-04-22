# Zayanori Ecom Backend Deployment & Testing

## 🐳 Docker Deployment
To run the entire stack (API + Database) using Docker:

1. Make sure you have Docker and Docker Compose installed.
2. Run the following command in the `backend/` directory:
   ```bash
   docker-compose up --build
   ```
3. The API will be available at `http://localhost:8000`.
4. The database will persist in a docker volume called `postgres_data`.

## 🚀 API Testing (Postman)
We have generated a standard OpenAPI 3.0 specification file for easy testing.

1. Locate the file: `backend/zayanori_api_docs.json`.
2. Open **Postman**.
3. Click **Import** (top left).
4. Drag and drop `zayanori_api_docs.json` into the import window.
5. Postman will automatically generate a complete Collection with:
   - All v1 endpoints (Auth, Products, Cart, Orders, etc.)
   - Pre-defined Request Bodies (JSON)
   - Parameter descriptions
   - Schemas for responses

## 🛠 Manual Setup (Local)
If you prefer running without Docker:
1. Create a virtual environment: `python -m venv env`
2. Activate it: `source env/bin/activate`
3. Install deps: `pip install -r requirements.txt`
4. Run: `python run.py`
