from django.apps import AppConfig


class RiskcoreConfig(AppConfig):
    name = 'riskcore'

    def ready(self):
        import riskcore.signals