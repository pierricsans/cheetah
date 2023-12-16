import os
from django.shortcuts import render
from server import main
from django import http


def index(request):
    return http.HttpResponse(main.RenderTable())

def getInitialLevel(request):
    return http.HttpResponse(main.GetInitialLevel())

def getStyle(request):
    with open('monkey/style.css', 'r') as f:
        return http.HttpResponse(f.read(), content_type='text/css')

def script(request):
    with open('frontend/bundle.js', 'r') as f:
        return http.HttpResponse(f.read(), content_type='text/javascript')
