import os
from django.shortcuts import render
from server import main
from django import http


def index(request):
    return http.HttpResponse(main.RenderTable())

def getInitialLevel(request):
    initial_level = main.GetInitialLevel()
    return http.HttpResponse(initial_level.SerializeToString())

def script(request):
    with open('fe/bundle.js', 'r') as f:
        return http.HttpResponse(f.read(), content_type='text/javascript')
