"""
Management command to seed common medical specialties.
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from specialties.models import Specialty


SPECIALTIES = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'General Physician',
    'Gynecology',
    'Dentistry',
    'ENT',
]


class Command(BaseCommand):
    help = 'Seed the database with common medical specialties'

    def handle(self, *args, **options):
        created_count = 0
        for name in SPECIALTIES:
            _, created = Specialty.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created: {name}'))
            else:
                self.stdout.write(f'  Already exists: {name}')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. Created {created_count} new specialties.'
        ))
