from django.urls import path

from library import views

app_name = "library"

urlpatterns = [
    path("newsletter/", views.newsletter_list, name="newsletter_list"),
    path("newsletter/<int:pk>/", views.newsletter_detail, name="newsletter_detail"),
    path("documents/", views.document_list, name="document_list"),
    path("documents/<int:pk>/", views.document_detail, name="document_detail"),
]
