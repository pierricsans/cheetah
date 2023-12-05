import os
from django.shortcuts import render
from server import main
from django import http


def index(request):
    return http.HttpResponse(main.RenderTable())

def script(request):
    with open('monkey/main.js', 'r') as f:
        script = f.read()
    return http.HttpResponse(script)
