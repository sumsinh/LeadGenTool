
from django.urls import path
from . import views

urlpatterns = [
    path("", views.lead_list, name="lead-list"),
    path("stats/", views.lead_stats, name="lead-stats"),
    path("remove-duplicates/", views.remove_duplicates, name="remove-duplicates"),
    path("export/", views.export_leads, name="export-leads"),
    path("<int:pk>/", views.delete_lead, name="delete-lead"),
]
