from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('SecureChama Info', {
            'fields': ('name', 'membership_number', 'phone_number', 'national_id', 'role')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('SecureChama Info', {
            'fields': ('name', 'membership_number', 'phone_number', 'national_id', 'role')
        }),
    )
