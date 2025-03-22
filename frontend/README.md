# AI Financial Planner

An intelligent expense tracking and financial goal planning application with AI-powered savings recommendations.

## Features

- **Expense Tracking**: Record and categorize daily expenses
- **Financial Goal Setting**: Create and track progress toward financial goals
- **AI Savings Plans**: Get personalized AI-generated savings plans based on your spending patterns
- **Financial Insights**: Visualize spending patterns and track progress through charts and statistics
- **Responsive UI**: Works seamlessly on both desktop and mobile devices

## Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite
- **Authentication**: Session-based authentication
- **AI Integration**: OpenAI API

### Frontend
- **Framework**: React
- **UI Library**: Chakra UI
- **State Management**: React Context API
- **Routing**: React Router
- **Charts**: Chart.js with React-Chartjs-2
- **HTTP Client**: Axios

## Project Setup

### Prerequisites
- Python 3.7+
- Node.js 14+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   SECRET_KEY=your_secret_key_here
   FLASK_APP=app.py
   FLASK_ENV=development
   ```

6. Run the Flask application:
   ```
   flask run
   ```
   The backend will be available at http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The frontend will be available at http://localhost:3000

## Development Guide

### Folder Structure

```
ai-financial-planner/
├── backend/                 # Flask backend
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (create this)
│
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json         # Node.js dependencies
│
└── README.md                # Project documentation
```

### Backend API Endpoints

#### Authentication
- `POST /api/register`: Register a new user
- `POST /api/login`: User login
- `POST /api/logout`: User logout
- `GET /api/user`: Get current user information

#### Expenses
- `GET /api/expenses`: Get all expenses (with optional filters)
- `POST /api/expenses`: Add a new expense
- `DELETE /api/expenses/:id`: Delete an expense
- `GET /api/categories`: Get expense categories

#### Goals
- `GET /api/goals`: Get all goals
- `POST /api/goals`: Create a new goal
- `GET /api/goals/:id`: Get a specific goal
- `PUT /api/goals/:id`: Update a goal
- `DELETE /api/goals/:id`: Delete a goal
- `GET /api/goals/:id/plan`: Get AI plan for a goal
- `POST /api/goals/:id/plan`: Generate a new AI plan

#### Dashboard
- `GET /api/dashboard`: Get dashboard data

### AI Integration

The AI functionality is implemented in the `generate_goal_plan` function in `app.py`. It:

1. Analyzes the user's spending patterns from their expense history
2. Considers the goal amount and timeline
3. Calculates a realistic monthly saving amount
4. Provides personalized recommendations based on spending habits
5. Returns a detailed savings plan

## Deployment Options

### Quick Deployment for Hackathon Demo

#### Backend
- **Replit**: Create a Python Repl and paste the Flask code
- **Python Anywhere**: Quick Flask hosting with free tier

#### Frontend
- **Vercel**: Connect to your GitHub repo for instant deployment
- **Netlify**: Similar to Vercel, with drag-and-drop deployment

### Production Deployment

#### Backend
1. Set `debug=False` in `app.py`
2. Use Gunicorn to serve the Flask app
3. Consider using a more robust database like PostgreSQL

#### Frontend
1. Build the production version: `npm run build`
2. Serve the static files from a CDN or web server

## Extending the Project

### Potential Enhancements
- Add more sophisticated AI analysis of spending patterns
- Implement recurring expenses and income tracking
- Add budget setting and monitoring
- Implement data export/import functionality
- Add social features (sharing goals, etc.)
- Integrate with bank accounts for automatic expense tracking

## Troubleshooting

### Common Issues

- **CORS errors**: Ensure Flask-CORS is properly configured
- **Authentication issues**: Check that session cookies are being properly set/sent
- **OpenAI API errors**: Verify your API key and check for rate limits
- **Database issues**: Check that SQLite file permissions are correct

## Hackathon Demo Tips

1. **Prepare sample data**: Add some example expenses and goals for your demo
2. **Highlight the AI**: Focus on the intelligent recommendations and personalized plans
3. **Prepare a short script**: Show the expense tracking → goal setting → AI plan generation flow
4. **Have a backup plan**: If the OpenAI API has issues, have some pre-generated plans ready

## License

This project is available for use under the MIT License.