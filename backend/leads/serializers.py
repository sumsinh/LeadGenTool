
from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = "__all__"
        read_only_fields = ["score", "created_at"]

    def create(self, validated_data):
        lead = Lead(**validated_data)
        lead.score = lead.calculate_score()
        lead.save()
        return lead

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.score = instance.calculate_score()
        instance.save()
        return instance
