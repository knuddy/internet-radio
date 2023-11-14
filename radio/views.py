from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login, logout
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.generic import TemplateView
from django_htmx.http import trigger_client_event


class IndexView(TemplateView):
    template_name = 'index.html'


class HtmxLoginView(LoginView):
    template_name = 'accounts/login.html'

    def form_valid(self, form):
        login(self.request, form.get_user())
        return trigger_client_event(HttpResponse(), 'Login')

    @method_decorator(sensitive_post_parameters())
    @method_decorator(csrf_protect)
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        if request.htmx:
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied()

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        if request.method.lower() == 'get':
            response = trigger_client_event(response, 'OpenModal')
        return response


class HtmxLogoutView(LogoutView):
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        if request.htmx:
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied()

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        logout(request)
        return trigger_client_event(HttpResponse(), 'Logout')


class ProfileView(TemplateView):
    template_name = 'accounts/profile.html'

