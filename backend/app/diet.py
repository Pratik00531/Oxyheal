"""
Diet Plan Generator for Lung Health

Generates personalized weekly diet plans based on:
- Lung cancer screening results
- Symptoms detected
- Risk factors (smoking history, etc.)
- Report findings (nodules, inflammation, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

from .supabase_client import supabase
from .dependencies import get_current_user

router = APIRouter(prefix="/diet", tags=["diet"])


# Pydantic Models
class Meal(BaseModel):
    name: str
    items: List[str]
    benefits: str
    time: str


class DayPlan(BaseModel):
    day: str
    breakfast: Meal
    lunch: Meal
    snack: Meal
    dinner: Meal


class DietPlan(BaseModel):
    id: str
    user_id: str
    assessment_id: str
    week_plan: List[DayPlan]
    recommended_foods: List[str]
    foods_to_avoid: List[str]
    health_tips: List[str]
    generated_for: str  # condition type
    created_at: str


# Diet Generation Logic
def analyze_assessment_for_diet(assessment: dict) -> Dict[str, any]:
    """Analyze lung cancer assessment to determine dietary needs"""
    
    conditions = []
    keywords = []
    
    # Get report data
    symptoms = assessment.get('symptoms', [])
    smoking_history = assessment.get('smoking_history', '')
    ldct_reports = assessment.get('ldct_reports', [])
    
    # Analyze smoking history
    if smoking_history in ['current', 'former']:
        conditions.append('smoker')
        keywords.append('smoking')
    
    # Analyze symptoms
    symptom_list = symptoms if isinstance(symptoms, list) else []
    for symptom in symptom_list:
        symptom_lower = symptom.lower()
        if 'cough' in symptom_lower or 'mucus' in symptom_lower:
            conditions.append('mucus')
            keywords.append('cough')
        if 'breath' in symptom_lower or 'shortness' in symptom_lower:
            conditions.append('breathlessness')
            keywords.append('breathlessness')
        if 'fatigue' in symptom_lower or 'tired' in symptom_lower:
            conditions.append('fatigue')
            keywords.append('fatigue')
    
    # Analyze LDCT reports for findings
    for report in ldct_reports:
        findings = report.get('findings', '').lower()
        lung_rads = report.get('lung_rads', 0)
        
        # Check for inflammation/infection
        if any(word in findings for word in ['opacity', 'infiltration', 'consolidation', 'infection', 'bronchitis', 'pneumonia', 'inflammation']):
            conditions.append('inflammation')
            keywords.append('inflammation')
        
        # Check for nodules/suspicious findings
        if any(word in findings for word in ['nodule', 'lesion', 'mass', 'suspicious', 'abnormal']):
            conditions.append('nodules')
            keywords.append('nodules')
        
        # High Lung-RADS suggests more serious findings
        if lung_rads >= 3:
            if 'nodules' not in conditions:
                conditions.append('nodules')
                keywords.append('suspicious_findings')
    
    # If no specific conditions, it's routine/mild
    if not conditions:
        conditions.append('routine')
        keywords.append('wellness')
    
    return {
        'conditions': list(set(conditions)),
        'keywords': list(set(keywords))
    }


def get_recommended_foods(conditions: List[str]) -> List[str]:
    """Get recommended foods based on conditions"""
    
    recommendations = set()
    
    # Anti-inflammatory foods
    if 'inflammation' in conditions:
        recommendations.update([
            'Turmeric (curcumin reduces inflammation)',
            'Ginger tea (anti-inflammatory)',
            'Garlic (antimicrobial)',
            'Tulsi/Holy Basil tea',
            'Warm vegetable soup',
            'Broccoli & leafy greens',
            'Citrus fruits (vitamin C)',
            'Papaya, kiwi, strawberries',
            'Honey + warm water',
            'Tomato rasam'
        ])
    
    # Lung detox for smokers
    if 'smoker' in conditions:
        recommendations.update([
            'Beetroot juice',
            'Pomegranate juice',
            'Carrot juice',
            'Warm lemon water',
            'Green tea',
            'Tulsi tea',
            'Spinach, kale, moringa',
            'Walnuts & almonds',
            'High-fiber foods',
            'Ginger-honey tea'
        ])
    
    # Antioxidant-rich for nodules
    if 'nodules' in conditions:
        recommendations.update([
            'Berries (blueberry, strawberry, raspberry)',
            'Grapes (resveratrol)',
            'Broccoli, cauliflower, cabbage',
            'Tomatoes (lycopene)',
            'Carrots & sweet potatoes',
            'Green tea',
            'Turmeric',
            'Chia seeds, flax seeds',
            'Whole grains',
            'Lentils & legumes',
            'Olive oil'
        ])
    
    # Energy-boosting for breathlessness
    if 'breathlessness' in conditions or 'fatigue' in conditions:
        recommendations.update([
            'Iron-rich: spinach, beans, beetroot',
            'Magnesium: nuts, seeds',
            'Vitamin C: oranges, kiwi, amla',
            'Warm soups',
            'Banana + peanut butter',
            'Oats + fruits',
            'Protein: eggs, paneer, lentils'
        ])
    
    # Mucus-clearing foods
    if 'mucus' in conditions:
        recommendations.update([
            'Ginger',
            'Pepper + turmeric milk',
            'Warm water frequently',
            'Honey',
            'Herbal tea',
            'Pineapple (bromelain enzyme)'
        ])
    
    # General wellness (routine)
    if 'routine' in conditions or not recommendations:
        recommendations.update([
            'Mixed vegetable khichdi',
            'Moong dal soup',
            'Spinach sabji',
            'Chapati + dal + sabji',
            'Fresh fruit bowl',
            'Oats + nuts',
            'Lemon-ginger water',
            'Tulsi tea',
            'Steamed vegetables',
            'Sprouts salad'
        ])
    
    return sorted(list(recommendations))


def get_foods_to_avoid(conditions: List[str]) -> List[str]:
    """Get foods to avoid based on conditions"""
    
    avoid = set()
    
    # Common to all lung patients
    avoid.update([
        'Smoking/Tobacco',
        'Alcohol',
        'Fried foods',
        'Processed meats (sausages, salami)',
        'Carbonated drinks',
        'Packaged snacks (chips, etc.)',
        'Excessive sugar',
        'Ice-cold beverages',
        'Maida products (refined flour)'
    ])
    
    # Inflammation/infection specific
    if 'inflammation' in conditions:
        avoid.update([
            'Dairy products (can thicken mucus)',
            'Cold foods/drinks',
            'Ice cream',
            'Excessive spicy, oily foods'
        ])
    
    # Smoker specific
    if 'smoker' in conditions:
        avoid.update([
            'Red meat',
            'Processed foods'
        ])
    
    # Nodules specific
    if 'nodules' in conditions:
        avoid.update([
            'High-fat foods',
            'Excessive salt'
        ])
    
    # Breathlessness specific
    if 'breathlessness' in conditions or 'fatigue' in conditions:
        avoid.update([
            'Heavy meals',
            'Greasy food',
            'Excessive coffee'
        ])
    
    # Mucus specific
    if 'mucus' in conditions:
        avoid.update([
            'Milk & dairy',
            'Bananas (for some people)'
        ])
    
    return sorted(list(avoid))


def generate_weekly_plan(conditions: List[str]) -> List[DayPlan]:
    """Generate 7-day meal plan based on conditions"""
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    # Base meal templates (will be customized based on conditions)
    breakfast_options = []
    lunch_options = []
    snack_options = []
    dinner_options = []
    
    # Customize meals based on conditions
    if 'inflammation' in conditions:
        breakfast_options = [
            {'name': 'Anti-Inflammatory Breakfast', 'items': ['Oats with turmeric', 'Ginger tea', 'Honey', 'Strawberries'], 'benefits': 'Reduces inflammation, soothes airways'},
            {'name': 'Healing Morning Bowl', 'items': ['Warm vegetable poha', 'Tulsi tea', 'Papaya slices'], 'benefits': 'Anti-inflammatory, vitamin C boost'},
            {'name': 'Immunity Breakfast', 'items': ['Whole wheat toast', 'Scrambled eggs with garlic', 'Citrus fruit'], 'benefits': 'Antimicrobial, protein-rich'}
        ]
        lunch_options = [
            {'name': 'Healing Lunch', 'items': ['Brown rice', 'Turmeric dal', 'Steamed broccoli', 'Tomato soup'], 'benefits': 'Anti-inflammatory, easy to digest'},
            {'name': 'Soothing Meal', 'items': ['Vegetable khichdi', 'Spinach sabji', 'Warm lemon water'], 'benefits': 'Gentle on system, reduces inflammation'},
            {'name': 'Comfort Lunch', 'items': ['Chapati', 'Moong dal', 'Ginger-garlic vegetables', 'Rasam'], 'benefits': 'Warming spices, soothes throat'}
        ]
    
    elif 'smoker' in conditions:
        breakfast_options = [
            {'name': 'Detox Breakfast', 'items': ['Beetroot juice', 'Oats with walnuts', 'Green tea'], 'benefits': 'Lung detox, removes toxins'},
            {'name': 'Cleansing Bowl', 'items': ['Carrot juice', 'Whole grain toast', 'Almonds', 'Pomegranate'], 'benefits': 'Antioxidants, lung cleansing'},
            {'name': 'Purifying Morning', 'items': ['Warm lemon water', 'Spinach paratha', 'Ginger tea'], 'benefits': 'Detoxifies, high fiber'}
        ]
        lunch_options = [
            {'name': 'Detox Lunch', 'items': ['Brown rice', 'Kale sabji', 'Lentil soup', 'Beetroot salad'], 'benefits': 'Removes toxins, lung health'},
            {'name': 'Cleansing Meal', 'items': ['Quinoa', 'Moringa curry', 'Spinach dal', 'Green salad'], 'benefits': 'Fiber-rich, lung detox'},
            {'name': 'Purifying Thali', 'items': ['Chapati', 'Mixed dal', 'Leafy greens', 'Carrot sabji'], 'benefits': 'Antioxidants, cleansing'}
        ]
    
    elif 'nodules' in conditions:
        breakfast_options = [
            {'name': 'Antioxidant Breakfast', 'items': ['Berry smoothie', 'Chia seeds', 'Whole grain toast', 'Green tea'], 'benefits': 'Cancer-protective, antioxidants'},
            {'name': 'Protective Morning', 'items': ['Oats with flax seeds', 'Blueberries', 'Walnuts', 'Tulsi tea'], 'benefits': 'Anti-cancer nutrients'},
            {'name': 'Nourishing Start', 'items': ['Whole wheat paratha', 'Paneer with turmeric', 'Grapes'], 'benefits': 'Resveratrol, protein'}
        ]
        lunch_options = [
            {'name': 'Protective Lunch', 'items': ['Brown rice', 'Broccoli curry', 'Tomato dal', 'Cabbage salad'], 'benefits': 'Cancer-protective vegetables'},
            {'name': 'Antioxidant Thali', 'items': ['Chapati', 'Cauliflower sabji', 'Lentils', 'Carrot salad', 'Green tea'], 'benefits': 'Lycopene, antioxidants'},
            {'name': 'Wholesome Meal', 'items': ['Quinoa', 'Mixed vegetables', 'Sweet potato curry', 'Olive oil dressing'], 'benefits': 'Whole grains, beta-carotene'}
        ]
    
    elif 'breathlessness' in conditions or 'fatigue' in conditions:
        breakfast_options = [
            {'name': 'Energy Breakfast', 'items': ['Oats with banana', 'Peanut butter', 'Almonds', 'Orange juice'], 'benefits': 'Energy boost, iron-rich'},
            {'name': 'Power Morning', 'items': ['Scrambled eggs', 'Spinach toast', 'Beetroot juice'], 'benefits': 'Iron, protein, oxygen support'},
            {'name': 'Strength Bowl', 'items': ['Whole grain cereal', 'Nuts', 'Kiwi', 'Amla juice'], 'benefits': 'Vitamin C, magnesium'}
        ]
        lunch_options = [
            {'name': 'Energy Lunch', 'items': ['Brown rice', 'Spinach dal', 'Beans curry', 'Beetroot salad'], 'benefits': 'Iron-rich, energy-boosting'},
            {'name': 'Power Thali', 'items': ['Chapati', 'Paneer curry', 'Lentils', 'Green vegetables'], 'benefits': 'Protein, magnesium'},
            {'name': 'Strength Meal', 'items': ['Quinoa', 'Egg curry', 'Spinach sabji', 'Warm soup'], 'benefits': 'Protein, iron, easy to digest'}
        ]
    
    else:  # Routine/wellness
        breakfast_options = [
            {'name': 'Healthy Breakfast', 'items': ['Oats with fruits', 'Ginger lemon tea', 'Nuts'], 'benefits': 'Balanced nutrition, immunity'},
            {'name': 'Wholesome Morning', 'items': ['Whole wheat paratha', 'Paneer', 'Fruit bowl'], 'benefits': 'Protein, vitamins'},
            {'name': 'Fresh Start', 'items': ['Vegetable poha', 'Tulsi tea', 'Apple'], 'benefits': 'Light, nutritious'}
        ]
        lunch_options = [
            {'name': 'Balanced Lunch', 'items': ['Brown rice/Chapati', 'Dal', 'Steamed vegetables', 'Spinach sabji'], 'benefits': 'Complete nutrition'},
            {'name': 'Wellness Thali', 'items': ['Chapati', 'Moong dal', 'Mixed vegetables', 'Salad'], 'benefits': 'Fiber, vitamins, minerals'},
            {'name': 'Healthy Meal', 'items': ['Khichdi', 'Vegetables', 'Curd', 'Lemon water'], 'benefits': 'Easy digestion, probiotics'}
        ]
    
    # Universal snacks and dinners (lighter versions of lunch)
    snack_options = [
        {'name': 'Healthy Snack', 'items': ['Walnuts & almonds', 'Green tea', 'Apple'], 'benefits': 'Antioxidants, healthy fats'},
        {'name': 'Evening Munch', 'items': ['Carrot sticks', 'Hummus', 'Herbal tea'], 'benefits': 'Fiber, protein'},
        {'name': 'Light Bite', 'items': ['Fruit smoothie', 'Handful of nuts', 'Dates'], 'benefits': 'Energy, vitamins'},
        {'name': 'Tea Time', 'items': ['Sprouts salad', 'Green tea', 'Orange'], 'benefits': 'Protein, vitamin C'},
        {'name': 'Refresh Break', 'items': ['Roasted chickpeas', 'Tulsi tea', 'Berries'], 'benefits': 'Protein, antioxidants'}
    ]
    
    dinner_options = [
        {'name': 'Light Dinner', 'items': ['Vegetable soup', 'Moong dal', 'Light chapati'], 'benefits': 'Easy to digest, light on stomach'},
        {'name': 'Evening Meal', 'items': ['Steamed vegetables', 'Brown rice', 'Lentil curry'], 'benefits': 'Nutritious, light'},
        {'name': 'Night Bowl', 'items': ['Vegetable khichdi', 'Steamed broccoli', 'Warm water'], 'benefits': 'Gentle, soothing'},
        {'name': 'Soothing Dinner', 'items': ['Tomato soup', 'Chapati', 'Spinach sabji'], 'benefits': 'Light, nutritious'},
        {'name': 'Comfort Meal', 'items': ['Mixed dal', 'Cauliflower curry', 'Chapati'], 'benefits': 'Protein-rich, easy digestion'}
    ]
    
    # Generate 7-day plan
    week_plan = []
    for i, day in enumerate(days):
        day_plan = DayPlan(
            day=day,
            breakfast=Meal(
                name=breakfast_options[i % len(breakfast_options)]['name'],
                items=breakfast_options[i % len(breakfast_options)]['items'],
                benefits=breakfast_options[i % len(breakfast_options)]['benefits'],
                time='7:00 AM - 8:00 AM'
            ),
            lunch=Meal(
                name=lunch_options[i % len(lunch_options)]['name'],
                items=lunch_options[i % len(lunch_options)]['items'],
                benefits=lunch_options[i % len(lunch_options)]['benefits'],
                time='12:00 PM - 1:00 PM'
            ),
            snack=Meal(
                name=snack_options[i % len(snack_options)]['name'],
                items=snack_options[i % len(snack_options)]['items'],
                benefits=snack_options[i % len(snack_options)]['benefits'],
                time='4:00 PM - 5:00 PM'
            ),
            dinner=Meal(
                name=dinner_options[i % len(dinner_options)]['name'],
                items=dinner_options[i % len(dinner_options)]['items'],
                benefits=dinner_options[i % len(dinner_options)]['benefits'],
                time='7:00 PM - 8:00 PM'
            )
        )
        week_plan.append(day_plan)
    
    return week_plan


def get_health_tips(conditions: List[str]) -> List[str]:
    """Get health tips based on conditions"""
    
    tips = [
        'Drink 8-10 glasses of warm water daily',
        'Avoid smoking and secondhand smoke',
        'Practice deep breathing exercises daily',
        'Get adequate sleep (7-8 hours)',
        'Avoid processed and packaged foods',
        'Eat meals at regular times',
        'Chew food slowly and thoroughly'
    ]
    
    if 'inflammation' in conditions:
        tips.extend([
            'Consume warm foods and beverages',
            'Add turmeric to your daily meals',
            'Practice steam inhalation',
            'Avoid cold and dairy products temporarily'
        ])
    
    if 'smoker' in conditions:
        tips.extend([
            'Start with detox juices every morning',
            'Increase fiber intake to remove toxins',
            'Consider nicotine replacement therapy',
            'Join a smoking cessation program'
        ])
    
    if 'nodules' in conditions:
        tips.extend([
            'Focus on colorful fruits and vegetables',
            'Include cruciferous vegetables daily',
            'Limit processed meat consumption',
            'Regular follow-up with your doctor'
        ])
    
    if 'breathlessness' in conditions:
        tips.extend([
            'Eat smaller, frequent meals',
            'Avoid lying down immediately after eating',
            'Include iron-rich foods daily',
            'Practice pursed-lip breathing'
        ])
    
    if 'mucus' in conditions:
        tips.extend([
            'Stay well-hydrated with warm liquids',
            'Avoid dairy until mucus clears',
            'Use honey as a natural expectorant',
            'Practice controlled coughing'
        ])
    
    return tips


# API Endpoints
@router.get("/plan")
async def get_diet_plan(user_id: str = Depends(get_current_user)):
    """Get user's diet plan (requires completed assessment)"""
    try:
        # Get latest lung cancer assessment
        assessment_result = supabase.table("lung_cancer_assessments")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        if not assessment_result.data:
            raise HTTPException(
                status_code=404, 
                detail="No lung cancer screening found. Please complete screening first."
            )
        
        assessment = assessment_result.data[0]
        assessment_id = assessment['id']
        
        # Check if diet plan already exists for this assessment
        existing_plan = supabase.table("diet_plans")\
            .select("*")\
            .eq("assessment_id", assessment_id)\
            .execute()
        
        if existing_plan.data:
            return existing_plan.data[0]
        
        # Analyze assessment and generate diet plan
        analysis = analyze_assessment_for_diet(assessment)
        conditions = analysis['conditions']
        
        # Generate components
        recommended_foods = get_recommended_foods(conditions)
        foods_to_avoid = get_foods_to_avoid(conditions)
        week_plan = generate_weekly_plan(conditions)
        health_tips = get_health_tips(conditions)
        
        # Create diet plan
        diet_plan_data = {
            "user_id": user_id,
            "assessment_id": assessment_id,
            "week_plan": [day.dict() for day in week_plan],
            "recommended_foods": recommended_foods,
            "foods_to_avoid": foods_to_avoid,
            "health_tips": health_tips,
            "generated_for": ', '.join(conditions),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Save to database
        result = supabase.table("diet_plans").insert(diet_plan_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create diet plan")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate diet plan: {str(e)}")


@router.get("/check-eligibility")
async def check_diet_eligibility(user_id: str = Depends(get_current_user)):
    """Check if user is eligible for diet plan (has completed screening)"""
    try:
        assessment_result = supabase.table("lung_cancer_assessments")\
            .select("id, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        has_screening = bool(assessment_result.data)
        
        return {
            "eligible": has_screening,
            "message": "Complete lung cancer screening to unlock personalized diet plan" if not has_screening else "Diet plan available",
            "assessment_id": assessment_result.data[0]['id'] if has_screening else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check eligibility: {str(e)}")
