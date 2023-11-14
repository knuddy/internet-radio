from django.urls import path
from radio import views
from django.contrib.auth import views as auth
from django.contrib.auth.decorators import login_required

urlpatterns = [
    path('', views.IndexView.as_view(), name="index"),

    # Accounts
    path('accounts/login', views.HtmxLoginView.as_view(), name='login'),
    path('accounts/profile', views.ProfileView.as_view(), name='profile'),
    path('accounts/logout', login_required(views.HtmxLogoutView.as_view()), name='logout'),
    path('accounts/request_password_reset', auth.PasswordResetView.as_view(template_name='accounts/request_password_reset.html'), name='reset_password'),
    path('accounts/request_password_reset/done', auth.PasswordResetDoneView.as_view(template_name='accounts/request_password_reset_done.html'), name='password_reset_done'),
    path('accounts/reset/<uidb64>/<token>/', auth.PasswordResetConfirmView.as_view(template_name='accounts/reset_password.html'), name='password_reset_confirm'),
    path('accounts/reset/done', auth.PasswordResetCompleteView.as_view(template_name='accounts/reset_password_done.html'), name='password_reset_complete'),
]
