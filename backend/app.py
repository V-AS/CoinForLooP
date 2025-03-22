# app.py
import os
import json
import secrets
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))

# Enable CORS for frontend
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Initialize database
db = SQLAlchemy(app)

# Set up OpenAI
# openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
# OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo')
openai_client = 1
PENAI_MODEL = 2
# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade="all, delete-orphan")
    goals = db.relationship('Goal', backref='user', lazy=True, cascade="all, delete-orphan")

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    expense_date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    target_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    plans = db.relationship('Plan', backref='goal', lazy=True, cascade="all, delete-orphan")

class Plan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goal.id'), nullable=False)
    plan_text = db.Column(db.Text, nullable=False)
    monthly_saving = db.Column(db.Float, nullable=False)
    recommendations = db.Column(db.Text)  # Stored as JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions
def get_current_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

# AI Service
def generate_goal_plan(goal, expenses):
    """Generate an AI savings plan for a goal based on expenses"""
    # Calculate total and average monthly expenses
    if not expenses:
        avg_monthly_expense = 0
        categories = {}
    else:
        total_expenses = sum(e.amount for e in expenses)
        # Get unique months in the expense data
        expense_dates = [e.expense_date for e in expenses]
        if expense_dates:
            earliest_date = min(expense_dates)
            latest_date = max(expense_dates)
            month_diff = (latest_date.year - earliest_date.year) * 12 + (latest_date.month - earliest_date.month) + 1
            num_months = max(1, month_diff)
        else:
            num_months = 1
        avg_monthly_expense = total_expenses / num_months
        
        # Group expenses by category
        categories = {}
        for expense in expenses:
            if expense.category not in categories:
                categories[expense.category] = 0
            categories[expense.category] += expense.amount
    
    # Calculate months until goal date
    today = datetime.now().date()
    if goal.target_date <= today:
        months_until_goal = 1  # Avoid division by zero
    else:
        days_until_goal = (goal.target_date - today).days
        months_until_goal = max(1, round(days_until_goal / 30))
    
    # Calculate required monthly saving
    remaining_amount = goal.target_amount - goal.current_amount
    base_monthly_saving = remaining_amount / months_until_goal
    
    # Format the prompt for OpenAI
    prompt = f"""
    You are a financial planning assistant. Help create a savings plan for the following goal:
    
    GOAL:
    - Name: {goal.name}
    - Target Amount: ${goal.target_amount:.2f}
    - Target Date: {goal.target_date.strftime('%Y-%m-%d')}
    - Current Progress: ${goal.current_amount:.2f} (${(goal.target_amount - goal.current_amount):.2f} remaining)
    - Months until target date: {months_until_goal}
    
    FINANCIAL INFORMATION:
    - Average Monthly Expenses: ${avg_monthly_expense:.2f}
    - Expense Categories: {json.dumps(categories)}
    
    Create a realistic savings plan to reach this goal by the target date. Include:
    1. A clear explanation of the plan
    2. How much to save monthly
    3. 3-5 specific recommendations to help achieve this goal
    
    Provide your response in JSON format:
    {{
      "plan_text": "Your detailed plan explanation",
      "monthly_saving": 300.50,
      "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    }}
    """
    
    # Get completion from OpenAI
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a financial planning AI assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        # Parse the response
        content = response.choices[0].message.content.strip()
        
        # Try to parse as JSON
        try:
            result = json.loads(content)
            return result
        except json.JSONDecodeError:
            # Fallback if not valid JSON
            return {
                "plan_text": content,
                "monthly_saving": base_monthly_saving,
                "recommendations": ["Save regularly", "Track your expenses", "Look for ways to reduce costs"]
            }
            
    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Fallback plan if API fails
        return {
            "plan_text": "Could not generate AI plan. Here's a basic savings plan instead: Save a consistent amount each month to reach your goal.",
            "monthly_saving": base_monthly_saving,
            "recommendations": ["Save regularly", "Track your expenses", "Look for ways to reduce costs"]
        }

# API Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
        
    new_user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    session['user_id'] = new_user.id
    
    return jsonify({"message": "User registered successfully", "user_id": new_user.id, "username": username}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401
        
    session['user_id'] = user.id
    
    return jsonify({"message": "Login successful", "user_id": user.id, "username": username}), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/user', methods=['GET'])
def get_user():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    return jsonify({
        "id": user.id,
        "username": user.username
    }), 200

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    if request.method == 'POST':
        data = request.json
        
        try:
            new_expense = Expense(
                user_id=user.id,
                category=data.get('category'),
                amount=float(data.get('amount')),
                description=data.get('description', ''),
                expense_date=datetime.strptime(data.get('expense_date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').date()
            )
            
            db.session.add(new_expense)
            db.session.commit()
            
            return jsonify({
                "id": new_expense.id,
                "category": new_expense.category,
                "amount": new_expense.amount,
                "description": new_expense.description,
                "expense_date": new_expense.expense_date.strftime('%Y-%m-%d')
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    else:  # GET
        # Optional query parameters
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Expense.query.filter_by(user_id=user.id)
        
        if category:
            query = query.filter_by(category=category)
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Expense.expense_date >= start)
            
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Expense.expense_date <= end)
        
        expenses = query.order_by(Expense.expense_date.desc()).all()
        
        return jsonify([{
            "id": e.id,
            "category": e.category,
            "amount": e.amount,
            "description": e.description,
            "expense_date": e.expense_date.strftime('%Y-%m-%d')
        } for e in expenses]), 200

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    expense = Expense.query.get(expense_id)
    if not expense or expense.user_id != user.id:
        return jsonify({"error": "Expense not found"}), 404
    
    db.session.delete(expense)
    db.session.commit()
    
    return jsonify({"message": "Expense deleted successfully"}), 200

@app.route('/api/categories', methods=['GET'])
def get_categories():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    # Get unique categories from user's expenses
    categories = db.session.query(Expense.category)\
                          .filter(Expense.user_id == user.id)\
                          .distinct()\
                          .all()
    
    # Extract category names from results
    category_list = [category[0] for category in categories]
    
    # Add default categories if user has no expenses yet
    if not category_list:
        category_list = ["Housing", "Food", "Transportation", "Entertainment", "Utilities", "Healthcare", "Shopping", "Other"]
    
    return jsonify(category_list), 200

@app.route('/api/goals', methods=['GET', 'POST'])
def handle_goals():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    if request.method == 'POST':
        data = request.json
        
        try:
            new_goal = Goal(
                user_id=user.id,
                name=data.get('name'),
                target_amount=float(data.get('target_amount')),
                current_amount=float(data.get('current_amount', 0)),
                target_date=datetime.strptime(data.get('target_date'), '%Y-%m-%d').date()
            )
            
            db.session.add(new_goal)
            db.session.commit()
            
            return jsonify({
                "id": new_goal.id,
                "name": new_goal.name,
                "target_amount": new_goal.target_amount,
                "current_amount": new_goal.current_amount,
                "target_date": new_goal.target_date.strftime('%Y-%m-%d')
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    else:  # GET
        goals = Goal.query.filter_by(user_id=user.id).all()
        return jsonify([{
            "id": g.id,
            "name": g.name,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "target_date": g.target_date.strftime('%Y-%m-%d')
        } for g in goals]), 200

@app.route('/api/goals/<int:goal_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_goal(goal_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    goal = Goal.query.get(goal_id)
    if not goal or goal.user_id != user.id:
        return jsonify({"error": "Goal not found"}), 404
    
    if request.method == 'GET':
        return jsonify({
            "id": goal.id,
            "name": goal.name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "target_date": goal.target_date.strftime('%Y-%m-%d')
        }), 200
    
    elif request.method == 'PUT':
        data = request.json
        
        try:
            if 'name' in data:
                goal.name = data['name']
            if 'target_amount' in data:
                goal.target_amount = float(data['target_amount'])
            if 'current_amount' in data:
                goal.current_amount = float(data['current_amount'])
            if 'target_date' in data:
                goal.target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
            
            db.session.commit()
            
            return jsonify({
                "id": goal.id,
                "name": goal.name,
                "target_amount": goal.target_amount,
                "current_amount": goal.current_amount,
                "target_date": goal.target_date.strftime('%Y-%m-%d')
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    
    elif request.method == 'DELETE':
        db.session.delete(goal)
        db.session.commit()
        
        return jsonify({"message": "Goal deleted successfully"}), 200

@app.route('/api/goals/<int:goal_id>/plan', methods=['GET', 'POST'])
def handle_goal_plan(goal_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    goal = Goal.query.get(goal_id)
    if not goal or goal.user_id != user.id:
        return jsonify({"error": "Goal not found"}), 404
    
    if request.method == 'POST':
        # Get user's expenses (last 3 months)
        three_months_ago = datetime.now().date() - timedelta(days=90)
        expenses = Expense.query.filter(
            Expense.user_id == user.id,
            Expense.expense_date >= three_months_ago
        ).all()
        
        # Generate AI plan
        plan_data = generate_goal_plan(goal, expenses)
        
        # Save the plan
        new_plan = Plan(
            goal_id=goal.id,
            plan_text=plan_data.get('plan_text'),
            monthly_saving=plan_data.get('monthly_saving'),
            recommendations=json.dumps(plan_data.get('recommendations', []))
        )
        
        db.session.add(new_plan)
        db.session.commit()
        
        return jsonify({
            "id": new_plan.id,
            "plan_text": new_plan.plan_text,
            "monthly_saving": new_plan.monthly_saving,
            "recommendations": json.loads(new_plan.recommendations),
            "created_at": new_plan.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }), 201
    
    else:  # GET
        plan = Plan.query.filter_by(goal_id=goal_id).order_by(Plan.created_at.desc()).first()
        
        if not plan:
            return jsonify({"error": "No plan found for this goal"}), 404
        
        return jsonify({
            "id": plan.id,
            "plan_text": plan.plan_text,
            "monthly_saving": plan.monthly_saving,
            "recommendations": json.loads(plan.recommendations),
            "created_at": plan.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }), 200

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    # Get recent expenses
    recent_expenses = Expense.query.filter_by(user_id=user.id)\
                                  .order_by(Expense.expense_date.desc())\
                                  .limit(5)\
                                  .all()
    
    # Get expense statistics
    total_expenses = db.session.query(db.func.sum(Expense.amount))\
                              .filter(Expense.user_id == user.id)\
                              .scalar() or 0
    
    expense_count = Expense.query.filter_by(user_id=user.id).count()
    avg_expense = total_expenses / expense_count if expense_count > 0 else 0
    
    # Get expense breakdown by category
    category_expenses = db.session.query(
                            Expense.category, 
                            db.func.sum(Expense.amount).label('total')
                        )\
                        .filter(Expense.user_id == user.id)\
                        .group_by(Expense.category)\
                        .all()
                        
    categories_data = {category: float(total) for category, total in category_expenses}
    
    # Get goals overview
    goals = Goal.query.filter_by(user_id=user.id).all()
    goals_data = [{
        "id": g.id,
        "name": g.name,
        "target_amount": g.target_amount,
        "current_amount": g.current_amount,
        "target_date": g.target_date.strftime('%Y-%m-%d'),
        "progress": (g.current_amount / g.target_amount) * 100 if g.target_amount > 0 else 0
    } for g in goals]
    
    # Get monthly expense totals for the last 6 months
    six_months_ago = datetime.now().date() - timedelta(days=180)
    monthly_expenses = db.session.query(
                            db.func.strftime('%Y-%m', Expense.expense_date).label('month'),
                            db.func.sum(Expense.amount).label('total')
                        )\
                        .filter(Expense.user_id == user.id, Expense.expense_date >= six_months_ago)\
                        .group_by('month')\
                        .order_by('month')\
                        .all()
                        
    monthly_data = {month: float(total) for month, total in monthly_expenses}
    
    return jsonify({
        "expenses": {
            "recent": [{
                "id": e.id,
                "category": e.category,
                "amount": e.amount,
                "description": e.description,
                "expense_date": e.expense_date.strftime('%Y-%m-%d')
            } for e in recent_expenses],
            "total": total_expenses,
            "average": avg_expense,
            "by_category": categories_data,
            "monthly": monthly_data
        },
        "goals": goals_data
    }), 200

# Create database if it doesn't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # Set debug=False for production
    app.run(debug=True)