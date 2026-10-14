
import csv

from django.db.models import Avg
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Lead
from .serializers import LeadSerializer


@api_view(["GET", "POST"])
def lead_list(request):
    if request.method == "GET":
        leads = Lead.objects.all()
        search = request.query_params.get("search", "").strip()
        industry = request.query_params.get("industry", "").strip()
        min_score = request.query_params.get("min_score", "").strip()

        if search:
            leads = leads.filter(company__icontains=search) | leads.filter(
                industry__icontains=search
            ) | leads.filter(email__icontains=search)

        if industry and industry != "All":
            leads = leads.filter(industry__iexact=industry)

        if min_score:
            try:
                leads = leads.filter(score__gte=int(min_score))
            except ValueError:
                return Response(
                    {"error": "min_score must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(LeadSerializer(leads, many=True).data)

    serializer = LeadSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def lead_stats(request):
    leads = Lead.objects.all()
    return Response({
        "total_leads": leads.count(),
        "qualified_leads": leads.filter(status="Qualified").count(),
        "average_score": leads.aggregate(avg=Avg("score"))["avg"] or 0,
    })

@api_view(["DELETE"])
def delete_lead(request, pk):
    try:
        lead = Lead.objects.get(pk=pk)
    except Lead.DoesNotExist:
        return Response(
            {"error": "Lead not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    lead.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["POST"])
def remove_duplicates(request):
    seen = set()
    removed = 0

    for lead in Lead.objects.order_by("id"):
        key = lead.company.strip().casefold()
        if key in seen:
            lead.delete()
            removed += 1
        else:
            seen.add(key)

    return Response({"removed": removed})


@api_view(["GET"])
def export_leads(request):
    leads = Lead.objects.all()
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="leads.csv"'

    writer = csv.writer(response)
    writer.writerow(["Company", "Industry", "Company Size", "Email", "Score", "Status"])

    for lead in leads:
        writer.writerow([
            lead.company,
            lead.industry,
            lead.company_size,
            lead.email,
            lead.score,
            lead.status,
        ])

    return response
