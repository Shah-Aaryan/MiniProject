from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from prediction.models import UserModel


@csrf_exempt
def signup(request):
	if request.method != 'POST':
		return JsonResponse({'detail': 'Method not allowed'}, status=405)
	try:
		payload = json.loads(request.body.decode('utf-8') or '{}')
		name = payload.get('name') or ''
		email = (payload.get('email') or '').strip().lower()
		password = payload.get('password') or ''
		if not email or not password:
			return JsonResponse({'success': False, 'message': 'Email and password are required.'}, status=400)
		
		# Check both User and UserModel
		if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
			return JsonResponse({'success': False, 'message': 'A user with this email already exists.'}, status=400)
		if UserModel.objects.filter(email=email).exists():
			return JsonResponse({'success': False, 'message': 'A user with this email already exists.'}, status=400)
		
		first_name = name.split(' ')[0] if name else ''
		
		# Create both Django User and UserModel
		django_user = User.objects.create_user(username=email, email=email, password=password, first_name=first_name)
		
		# Create UserModel with a default age (can be updated later)
		user_model = UserModel.objects.create(
			name=name or first_name,
			age=25,  # Default age
			email=email,
			password=password  # Note: In production, this should be hashed
		)
		
		print(f"Created both users - Django User ID: {django_user.id}, UserModel ID: {user_model.id}")
		
		return JsonResponse({
			'success': True, 
			'user': {
				'id': user_model.id,  # Return UserModel ID for learning paths
				'email': user_model.email, 
				'name': user_model.name
			}
		}, status=201)
	except Exception as e:
		print(f"Signup error: {str(e)}")
		return JsonResponse({'success': False, 'message': str(e)}, status=500)


@csrf_exempt
def signin(request):
	if request.method != 'POST':
		return JsonResponse({'detail': 'Method not allowed'}, status=405)
	try:
		payload = json.loads(request.body.decode('utf-8') or '{}')
		email = (payload.get('email') or '').strip().lower()
		password = payload.get('password') or ''
		if not email or not password:
			return JsonResponse({'success': False, 'message': 'Email and password are required.'}, status=400)
		
		# Authenticate with Django User
		django_user = authenticate(request, username=email, password=password)
		if django_user is None:
			return JsonResponse({'success': False, 'message': 'Invalid credentials.'}, status=401)
		
		login(request, django_user)
		
		# Get or create corresponding UserModel
		user_model, created = UserModel.objects.get_or_create(
			email=email,
			defaults={
				'name': django_user.first_name or django_user.username,
				'age': 25,
				'password': password
			}
		)
		
		if created:
			print(f"Created UserModel for existing Django user: {user_model.id}")
		
		print(f"Signin successful - UserModel ID: {user_model.id}, Email: {user_model.email}")
		
		return JsonResponse({
			'success': True, 
			'user': {
				'id': user_model.id,  # Return UserModel ID for learning paths
				'email': user_model.email, 
				'name': user_model.name
			}
		}, status=200)
	except Exception as e:
		print(f"Signin error: {str(e)}")
		return JsonResponse({'success': False, 'message': str(e)}, status=500)


