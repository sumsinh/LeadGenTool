
from django.db import models


class Lead(models.Model):
    STATUS_CHOICES = [
        ("New", "New"),
        ("Qualified", "Qualified"),
        ("Contacted", "Contacted"),
    ]

    company = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    company_size = models.CharField(max_length=50)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    score = models.PositiveSmallIntegerField(default=50)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="New",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-score", "company"]

    def calculate_score(self):
        score = 40

        # Industry relevance
        industry = self.industry.strip().lower()
        if industry == "technology":
            score += 20
        elif industry in {"finance", "education"}:
            score += 15
        else:
            score += 5

        # Company size
        size = self.company_size.replace(" ", "").lower()
        if size in {"51-200", "201-500", "501-1000", "1000+"}:
            score += 15
        elif size in {"11-50", "11–50"}:
            score += 10

        # Contact information
        if self.email.strip():
            score += 10
        if self.website.strip():
            score += 10

        return min(score, 100)

    def __str__(self):
        return self.company
