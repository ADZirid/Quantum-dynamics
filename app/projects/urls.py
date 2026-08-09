from django.urls import path

from projects import views

app_name = "projects"

urlpatterns = [
    path("projets/", views.project_list, name="project_list"),
    path("projets/<int:pk>/", views.project_detail, name="project_detail"),
    path(
        "projets/image/<str:kind>/<int:pk>/",
        views.project_image,
        name="project_image",
    ),
]
