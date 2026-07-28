from django.urls import path

from accounts_app import views

app_name = "accounts_app"

urlpatterns = [
    path("espace-membres/", views.login_view, name="login"),
    path("deconnexion/", views.logout_view, name="logout"),
    path("admin/", views.dashboard, name="dashboard"),
    # Actions du tableau de bord (POST uniquement).
    path("admin/newsletters/nouvelle/", views.newsletter_create, name="newsletter_create"),
    path("admin/newsletters/<int:pk>/supprimer/", views.newsletter_delete, name="newsletter_delete"),
    path("admin/documents/nouveau/", views.document_create, name="document_create"),
    path("admin/documents/<int:pk>/modifier/", views.document_update, name="document_update"),
    path("admin/documents/<int:pk>/supprimer/", views.document_delete, name="document_delete"),
    path("admin/candidatures/<int:pk>/statut/", views.application_status, name="application_status"),
    path("admin/membres/nouveau/", views.member_create, name="member_create"),
    path("admin/membres/<int:pk>/modifier/", views.member_update, name="member_update"),
    path("admin/membres/<int:pk>/supprimer/", views.member_delete, name="member_delete"),
    path("admin/utilisateurs/nouveau/", views.user_create, name="user_create"),
    path("admin/utilisateurs/<int:pk>/supprimer/", views.user_delete, name="user_delete"),
    path("admin/utilisateurs/<int:pk>/reinitialiser-mot-de-passe/", views.user_reset_password, name="user_reset_password"),
    path("admin/securite/mot-de-passe/", views.password_change, name="password_change"),
]
