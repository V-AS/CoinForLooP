# CoinForLooP - AI-Powered Personal Finance Manager

CoinForLooP is an intelligent personal finance management system that helps users track expenses, set financial goals, and receive AI-powered insights about their spending habits. The application uses AI to provide personalized financial advice and savings plans.

## Features

- **Expense Tracking**: Log and categorize your expenses
- **Financial Dashboard**: Visualize spending patterns with interactive charts
- **Goal Planning**: Set and track progress toward financial goals
- **AI-Powered Insights**: Get personalized financial advice and monthly spending analysis
- **Budget Monitoring**: Compare income to expenses to stay on track

## System Architecture

CoinFlow consists of three main components:

1. **Frontend**: React-based web application
2. **Backend**: FastAPI with SQLite database
3. **Inference Bridge**: Separate service that connects to AI models

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│   Frontend  │────▶│   Backend   │────▶│  Inference  │────▶│    OpenAI   │
│  (React.js) │◀────│  (FastAPI)  │◀────│   Bridge    │◀────│     API     │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- OpenAI API key (for AI features)

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/V-AS/CoinForLooP.git
cd CoinForLooP
```

### Backend Setup

1. Create and activate a virtual environment:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install fastapi uvicorn sqlalchemy python-dotenv pydantic requests python-multipart
pip install -r requirements.txt
```

3. Create `.env` file (or update existing):

```ini
# FastAPI settings
PORT=8000
HOST=0.0.0.0

# Inference bridge connection
INFERENCE_URL=http://localhost:8001

# For development only
DEBUG=True
```

4. Start the backend server:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000    
```

### Frontend Setup
Need to open a new terminal window
1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm start
```

### Inference Bridge Setup

1. Create and activate a virtual environment:
Need to open a new terminal window
```bash
cd inference_bridge
python -m venv .venv
source .venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create `.env` file:

```ini
# OpenAI API Settings
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini  # or other available model

# Server settings
PORT=8001
HOST=0.0.0.0

# For development only
DEBUG=True
```

4. Start the inference bridge:

```bash
cd .. # Go back to the root directory
python inference_bridge/main.py
```

## Usage

1. Access the web application at `http://localhost:3000`
2. Set your monthly income
3. Start tracking expenses by recording transactions
4. Create financial goals and get AI-generated plans
5. View monthly AI summaries and insights about your spending habits

## Development

### Project Structure

```
coinflow/
├── backend/                            # FastAPI backend
│   ├── app/
│   │   ├── models.py                   # SQLAlchemy data models
│   │   ├── database.py                 # Database configuration
│   │   └── routers/                    # API endpoints
│   └── requirements.txt
├── frontend/                           # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/                 # React components
│   │   ├── styles/                     # CSS styles
│   │   └── api.js                      # API client
│   └── package.json
└── inference_bridge/                   # LLM inference service
    ├── client/                         # LLM provider integration (OpenAI client)
    ├── controllers/                    # Request handlers
    │   ├── goal_controller.py          # Controller for goal-related inference requests
    │   └── summary_controller.py       # Controller for monthly summary inference requests
    ├── data/                           # Data models
    │   ├── request/                    # Request schemas for AI model input
    │   └── response/                   # Response schemas for AI model output
    ├── processors/                     
    │   ├── goal_processor.py           # Prepares relevant data and calls LLM for goals
    │   └── summary_processor.py        # Prepares relevant data and calls LLM for summaries
    ├── prompt_builder/                 # Prompt templates for LLM interactions
    ├── exception/                      # Custom exceptions for inference bridge
    └── utils/                          # Utility functions
        └── retry_async.py              # Automatic retry logic for LLM requests
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
