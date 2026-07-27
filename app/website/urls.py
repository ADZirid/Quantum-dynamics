from django.urls import path

from website import views

app_name = "website"

urlpatterns = [
    path("", views.home, name="home"),
    path("association/", views.association, name="association"),
    path("rejoindre/", views.rejoindre, name="rejoindre"),
    path(
        "politique-de-confidentialite/",
        views.politique_confidentialite,
        name="politique_confidentialite",
    ),
    path("cgu/", views.cgu, name="cgu"),
]
