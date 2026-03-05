class SaccoScopedQuerysetMixin:
    """
    Ensures users only access data belonging to their sacco.
    Platform admins bypass restriction.
    """

    sacco_filter_path = "sacco"

    def _resolve_filter_path(self):
        if getattr(self, "sacco_filter_path", None):
            return self.sacco_filter_path
        return "sacco"

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == "platform_admin":
            return queryset

        if not user.sacco_id:
            return queryset.none()

        filter_path = self._resolve_filter_path()
        return queryset.filter(**{filter_path: user.sacco})

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "platform_admin":
            serializer.save()
            return

        sacco_field = getattr(serializer.Meta.model, "sacco", None)
        if sacco_field is not None:
            serializer.save(sacco=user.sacco)
            return

        serializer.save()
