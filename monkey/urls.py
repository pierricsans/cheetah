from django.urls import path

from monkey import views

urlpatterns = [
    path("", views.index, name="index"),
    path("script.js", views.script, name="script"),
    path("getInitialLevel", views.getInitialLevel, name="getInitialLevel"),
    path("style.css", views.getStyle, name="getStyle"),
]