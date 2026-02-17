class SaccoScopedQuerysetMixin:
    """
    Ensures users only access data belonging to their Sacco.
    Platform admins bypass restriction.
    """

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == "platform_admin":
            return queryset

        return queryset.filter(sacco=user.sacco)

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "platform_admin":
            serializer.save(sacco=user.sacco)
        else:
            serializer.save()