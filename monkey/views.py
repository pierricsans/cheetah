import os
from django.shortcuts import render
from server import main
from django import http


def index(request):
    return http.HttpResponse(main.RenderTable())

def script(request):
    with open('fe/simple/foo.js', 'r') as f:
        return http.HttpResponse(f.read(), content_type='text/javascript')
