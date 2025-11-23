# Labor Market Intelligence - Complete Sample Data Population Script
# Run this in Django shell: python manage.py shell < populate_labor_market_complete.py
# Or copy-paste into Django shell

from labor_market.models import *
from datetime import datetime, timedelta, date
from django.utils import timezone
import random
from decimal import Decimal

print("=" * 70)
print("LABOR MARKET INTELLIGENCE - COMPLETE DATA POPULATION")
print("=" * 70)

# Clear existing data (optional)
print("\n🗑️  Clearing existing data...")
CareerPathRecommendation.objects.all().delete()
EmergingRole.objects.all().delete()
CompanyInsight.objects.all().delete()
SkillDemand.objects.all().delete()
JobMarketTrend.objects.all().delete()
SalaryData.objects.all().delete()
JobRole.objects.all().delete()
Industry.objects.all().delete()
print("✓ Existing data cleared")

# ============================================================================
# PART 1: INDUSTRIES
# ============================================================================
print("\n" + "=" * 70)
print("PART 1: Creating Industries")
print("=" * 70)

# Parent Industries
parent_industries = [
    ('Technology & IT', 'Software development, IT services, cloud computing, and tech innovation', 15.5, 8500000),
    ('Finance & Banking', 'Financial services, banking, investment, and fintech', 8.2, 6200000),
    ('Healthcare & Life Sciences', 'Medical services, pharmaceuticals, biotech, and health IT', 12.3, 9800000),
    ('Education & Training', 'Educational institutions, e-learning, and corporate training', 6.5, 4500000),
    ('Manufacturing & Engineering', 'Industrial manufacturing, engineering services, and automation', 4.8, 7200000),
    ('Retail & E-commerce', 'Retail stores, online shopping, and consumer goods', 10.2, 5900000),
    ('Consulting & Professional Services', 'Business consulting, advisory services, and professional firms', 9.5, 3800000),
    ('Media & Entertainment', 'Digital media, entertainment, gaming, and content creation', 11.8, 2900000),
]

industry_objects = {}
for name, desc, growth, jobs in parent_industries:
    industry = Industry.objects.create(
        name=name,
        description=desc,
        growth_rate=growth,
        total_jobs=jobs,
        parent_industry=None
    )
    industry_objects[name] = industry
    print(f"✓ Created: {name}")

# Sub-industries
sub_industries = [
    ('Software Development', 'Custom software, web, and mobile application development', 18.5, 2800000, 'Technology & IT'),
    ('Cybersecurity', 'Information security, threat detection, and security consulting', 22.3, 950000, 'Technology & IT'),
    ('Cloud Computing', 'Cloud infrastructure, SaaS, PaaS, and cloud services', 25.7, 1200000, 'Technology & IT'),
    ('Artificial Intelligence & ML', 'Machine learning, AI research, and intelligent systems', 32.5, 680000, 'Technology & IT'),
    ('FinTech', 'Financial technology, digital banking, and payment solutions', 28.2, 850000, 'Finance & Banking'),
    ('Health IT', 'Healthcare software, medical devices, and health tech', 19.5, 780000, 'Healthcare & Life Sciences'),
]

for name, desc, growth, jobs, parent_name in sub_industries:
    parent = industry_objects.get(parent_name)
    sub_industry = Industry.objects.create(
        name=name,
        description=desc,
        growth_rate=growth,
        total_jobs=jobs,
        parent_industry=parent
    )
    industry_objects[name] = sub_industry
    print(f"✓ Created: {name} (under {parent_name})")

print(f"\n✅ Total Industries: {Industry.objects.count()}")

# ============================================================================
# PART 2: JOB ROLES
# ============================================================================
print("\n" + "=" * 70)
print("PART 2: Creating Job Roles")
print("=" * 70)

job_roles_data = [
    ('Full Stack Developer', 'Software Development', 'Build complete web applications', ['JavaScript', 'React', 'Node.js', 'SQL'], 'Mid-level', 95000, 18.5, True),
    ('Frontend Developer', 'Software Development', 'Create responsive user interfaces', ['HTML', 'CSS', 'JavaScript', 'React'], 'Entry-level', 78000, 16.2, True),
    ('Backend Developer', 'Software Development', 'Design server-side logic and APIs', ['Python', 'Java', 'SQL', 'REST APIs'], 'Mid-level', 98000, 17.8, True),
    ('DevOps Engineer', 'Cloud Computing', 'Automate infrastructure and CI/CD', ['Linux', 'Docker', 'Kubernetes', 'AWS'], 'Senior', 115000, 25.3, True),
    ('Cloud Architect', 'Cloud Computing', 'Design scalable cloud infrastructure', ['AWS', 'Azure', 'Architecture', 'Security'], 'Senior', 145000, 28.7, True),
    ('Machine Learning Engineer', 'Artificial Intelligence & ML', 'Build and deploy ML models', ['Python', 'TensorFlow', 'PyTorch', 'ML'], 'Senior', 135000, 32.5, True),
    ('Data Scientist', 'Artificial Intelligence & ML', 'Analyze data and build models', ['Python', 'Statistics', 'ML', 'SQL'], 'Mid-level', 120000, 28.5, True),
    ('Cybersecurity Analyst', 'Cybersecurity', 'Monitor security threats', ['Network Security', 'SIEM', 'Threat Analysis'], 'Mid-level', 95000, 22.8, True),
    ('Security Engineer', 'Cybersecurity', 'Design security systems', ['Security Architecture', 'Penetration Testing', 'Cryptography'], 'Senior', 125000, 26.5, True),
    ('FinTech Developer', 'FinTech', 'Build financial software', ['Java', 'Python', 'Blockchain', 'APIs'], 'Mid-level', 105000, 28.2, True),
    ('Data Engineer', 'Technology & IT', 'Build data pipelines', ['SQL', 'Python', 'ETL', 'Spark'], 'Mid-level', 110000, 21.5, True),
    ('Product Manager', 'Technology & IT', 'Define product strategy', ['Product Strategy', 'Agile', 'Communication'], 'Senior', 125000, 14.5, True),
    ('UX/UI Designer', 'Technology & IT', 'Design user experiences', ['Figma', 'User Research', 'Prototyping'], 'Mid-level', 88000, 13.5, True),
]

job_role_objects = []
for title, industry_name, desc, skills, exp_level, salary, growth, remote in job_roles_data:
    industry = industry_objects.get(industry_name)
    if industry:
        job_role = JobRole.objects.create(
            title=title,
            industry=industry,
            description=desc,
            required_skills=skills,
            preferred_skills=[],
            education_requirements=['Bachelor in Computer Science or related field'],
            experience_level=exp_level,
            remote_friendly=remote
        )
        job_role_objects.append((job_role, salary, growth))
        print(f"✓ Created: {title}")

print(f"\n✅ Total Job Roles: {JobRole.objects.count()}")

# ============================================================================
# PART 3: SALARY DATA
# ============================================================================
print("\n" + "=" * 70)
print("PART 3: Creating Salary Data")
print("=" * 70)

locations = [
    ('San Francisco', 'CA', 'USA', 1.35),
    ('New York', 'NY', 'USA', 1.30),
    ('Seattle', 'WA', 'USA', 1.25),
    ('Austin', 'TX', 'USA', 1.10),
    ('Boston', 'MA', 'USA', 1.20),
    ('Remote', '', 'USA', 1.15),
]

experience_levels = ['Entry-level', 'Mid-level', 'Senior']
exp_multipliers = {'Entry-level': 0.75, 'Mid-level': 1.0, 'Senior': 1.4}

salary_count = 0
for job_role, base_salary, growth in job_role_objects:
    for city, state, country, loc_mult in random.sample(locations, 3):
        for exp_level in random.sample(experience_levels, 2):
            exp_mult = exp_multipliers[exp_level]
            
            min_sal = int(base_salary * loc_mult * exp_mult * 0.85)
            max_sal = int(base_salary * loc_mult * exp_mult * 1.25)
            median_sal = int((min_sal + max_sal) / 2)
            avg_sal = median_sal
            
            SalaryData.objects.create(
                job_role=job_role,
                country=country,
                state=state,
                city=city,
                currency='USD',
                min_salary=Decimal(str(min_sal)),
                max_salary=Decimal(str(max_sal)),
                median_salary=Decimal(str(median_sal)),
                avg_salary=Decimal(str(avg_sal)),
                experience_level=exp_level,
                data_source='Market Survey 2025',
                last_updated=date.today(),
                sample_size=random.randint(100, 500)
            )
            salary_count += 1

print(f"✓ Created {salary_count} salary records")
print(f"✅ Total Salary Data: {SalaryData.objects.count()}")

# ============================================================================
# PART 4: JOB MARKET TRENDS
# ============================================================================
print("\n" + "=" * 70)
print("PART 4: Creating Job Market Trends")
print("=" * 70)

trend_count = 0
today = date.today()
for job_role, base_salary, growth_rate in job_role_objects[:10]:  # Create trends for first 10 roles
    JobMarketTrend.objects.create(
        job_role=job_role,
        trend_type='demand',
        period_start=date(2024, 1, 1),
        period_end=date(2025, 12, 31),
        trend_value=growth_rate,
        growth_rate=growth_rate,
        trend_direction='increasing' if growth_rate > 15 else 'stable',
        confidence_score=0.85,
        data_points=[],
        insights=f'{job_role.title} showing strong demand growth in 2025'
    )
    trend_count += 1

print(f"✓ Created {trend_count} job market trends")
print(f"✅ Total Trends: {JobMarketTrend.objects.count()}")

# ============================================================================
# PART 5: SKILL DEMAND
# ============================================================================
print("\n" + "=" * 70)
print("PART 5: Creating Skill Demand Data")
print("=" * 70)

skills_data = [
    ('Python', 'Programming Language', 125000, 25.5, 15000),
    ('JavaScript', 'Programming Language', 145000, 18.5, 12000),
    ('React', 'Framework', 98000, 22.5, 15000),
    ('AWS', 'Cloud Platform', 95000, 28.5, 25000),
    ('Docker', 'DevOps Tool', 72000, 26.5, 18000),
    ('Kubernetes', 'DevOps Tool', 58000, 35.5, 28000),
    ('Machine Learning', 'AI/ML', 68000, 42.5, 35000),
    ('SQL', 'Database', 165000, 12.5, 8000),
    ('Node.js', 'Framework', 75000, 19.5, 14000),
    ('TypeScript', 'Programming Language', 85000, 32.5, 18000),
]

for skill_name, category, postings, growth, premium in skills_data:
    SkillDemand.objects.create(
        skill_name=skill_name,
        category=category,
        job_postings_count=postings,
        growth_rate=growth,
        avg_salary_premium=Decimal(str(premium)),
        trending_rank=random.randint(1, 50),
        region='United States',
        last_updated=date.today()
    )
    print(f"✓ Created skill: {skill_name}")

print(f"\n✅ Total Skills: {SkillDemand.objects.count()}")

# ============================================================================
# PART 6: COMPANY INSIGHTS
# ============================================================================
print("\n" + "=" * 70)
print("PART 6: Creating Company Insights")
print("=" * 70)

companies = [
    ('Google', 'Technology & IT', 'enterprise', 'San Francisco, CA', 'increasing', 5200, ['Software Engineer', 'ML Engineer'], 4.5, 'hybrid'),
    ('Amazon', 'Technology & IT', 'enterprise', 'Seattle, WA', 'increasing', 8500, ['Software Developer', 'DevOps Engineer'], 3.8, 'office'),
    ('Microsoft', 'Technology & IT', 'enterprise', 'Redmond, WA', 'increasing', 6200, ['Software Engineer', 'Cloud Architect'], 4.3, 'hybrid'),
    ('Meta', 'Technology & IT', 'enterprise', 'Menlo Park, CA', 'stable', 3200, ['Software Engineer', 'Data Scientist'], 4.0, 'hybrid'),
    ('Stripe', 'FinTech', 'large', 'San Francisco, CA', 'increasing', 1500, ['Software Engineer', 'Product Manager'], 4.5, 'hybrid'),
    ('OpenAI', 'Artificial Intelligence & ML', 'medium', 'San Francisco, CA', 'increasing', 320, ['ML Engineer', 'AI Researcher'], 4.7, 'hybrid'),
]

for name, industry_name, size, location, trend, openings, roles, rating, policy in companies:
    industry = industry_objects.get(industry_name)
    if industry:
        CompanyInsight.objects.create(
            company_name=name,
            industry=industry,
            company_size=size,
            location=location,
            website=f'https://www.{name.lower()}.com',
            active_job_openings=openings,
            hiring_trend=trend,
            popular_roles=roles,
            employee_satisfaction=rating,
            growth_stage='Mature' if size == 'enterprise' else 'Growth'
        )
        print(f"✓ Created company: {name}")

print(f"\n✅ Total Companies: {CompanyInsight.objects.count()}")

# ============================================================================
# PART 7: EMERGING ROLES
# ============================================================================
print("\n" + "=" * 70)
print("PART 7: Creating Emerging Roles")
print("=" * 70)

emerging_roles = [
    ('AI Prompt Engineer', 'Artificial Intelligence & ML', 'Design prompts for LLMs', ['LLM', 'NLP', 'Python'], 4.5, 32.5, '90000-180000'),
    ('MLOps Engineer', 'Artificial Intelligence & ML', 'Build ML production pipelines', ['ML', 'DevOps', 'Kubernetes'], 4.7, 35.8, '120000-230000'),
    ('Web3 Developer', 'Technology & IT', 'Build decentralized applications', ['Solidity', 'Blockchain', 'Web3.js'], 4.2, 28.5, '110000-240000'),
    ('AI Ethics Specialist', 'Artificial Intelligence & ML', 'Ensure ethical AI development', ['AI', 'Ethics', 'Policy'], 4.3, 25.5, '95000-190000'),
    ('Climate Data Scientist', 'Technology & IT', 'Analyze climate and environmental data', ['Data Science', 'Python', 'ML'], 4.4, 22.5, '95000-180000'),
]

for title, industry_name, desc, skills, score, growth, salary_range in emerging_roles:
    industry = industry_objects.get(industry_name)
    if industry:
        EmergingRole.objects.create(
            title=title,
            industry=industry,
            description=desc,
            emergence_score=score,
            growth_projection=growth,
            required_skills=skills,
            avg_salary_range=salary_range
        )
        print(f"✓ Created emerging role: {title}")

print(f"\n✅ Total Emerging Roles: {EmergingRole.objects.count()}")

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n" + "=" * 70)
print("🎉 DATA POPULATION COMPLETE!")
print("=" * 70)
print(f"\n📊 Final Statistics:")
print(f"   Industries: {Industry.objects.count()}")
print(f"   Job Roles: {JobRole.objects.count()}")
print(f"   Salary Data: {SalaryData.objects.count()}")
print(f"   Job Market Trends: {JobMarketTrend.objects.count()}")
print(f"   Skills: {SkillDemand.objects.count()}")
print(f"   Companies: {CompanyInsight.objects.count()}")
print(f"   Emerging Roles: {EmergingRole.objects.count()}")
print("=" * 70)
print("\n🚀 Your Labor Market Intelligence backend is ready!")
print("   Start server: python manage.py runserver")
print("   API endpoint: http://127.0.0.1:8000/api/labor-market/")
print("=" * 70)
