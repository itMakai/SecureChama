from rest_framework.permissions import BasePermission


class IsPlatformAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "platform_admin"


class IsSaccoAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "sacco_admin"


class IsLoanOfficer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "loan_officer"


class IsMember(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "member"
