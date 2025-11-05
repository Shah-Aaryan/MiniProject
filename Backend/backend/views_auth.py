from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json


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
		if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
			return JsonResponse({'success': False, 'message': 'A user with this email already exists.'}, status=400)
		first_name = name.split(' ')[0] if name else ''
		user = User.objects.create_user(username=email, email=email, password=password, first_name=first_name)
		return JsonResponse({'success': True, 'user': {'id': user.id, 'email': user.email, 'name': user.first_name}}, status=201)
	except Exception as e:
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
		user = authenticate(request, username=email, password=password)
		if user is None:
			return JsonResponse({'success': False, 'message': 'Invalid credentials.'}, status=401)
		login(request, user)
		return JsonResponse({'success': True, 'user': {'id': user.id, 'email': user.email, 'name': user.first_name}}, status=200)
	except Exception as e:
		return JsonResponse({'success': False, 'message': str(e)}, status=500)


