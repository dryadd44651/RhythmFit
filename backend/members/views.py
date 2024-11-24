from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, RegisterSerializer, ExerciseSerializer, WorkoutSerializer
from .models import Exercise, Workout

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # 僅允許已登入的用戶訪問

class RegisterView(APIView):
    permission_classes = [AllowAny]  # 註冊不需要驗證

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExerciseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows exercises to be viewed, created, edited, or deleted.
    """
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get only the exercises that belong to the currently authenticated user.
        return Exercise.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign the authenticated user as the owner of the exercise.
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Update an exercise. Ensure the exercise belongs to the current user.
        """
        instance = self.get_object()
        if instance.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Delete an exercise. Ensure the exercise belongs to the current user.
        """
        instance = self.get_object()
        if instance.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class WorkoutViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows workout plans to be viewed, created, edited, or deleted.
    """
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the workout plan of the currently authenticated user.
        return Workout.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign the authenticated user as the owner of the workout.
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Update a workout. Ensure the workout belongs to the current user.
        """
        instance = self.get_object()
        if instance.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a workout. Ensure the workout belongs to the current user.
        """
        instance = self.get_object()
        if instance.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def current_workout(self, request):
        """
        Get the current user's workout information.
        """
        workout = Workout.objects.filter(user=request.user).first()
        if not workout:
            return Response({"detail": "No workout plan found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(workout)
        return Response(serializer.data)