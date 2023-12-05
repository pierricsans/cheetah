import os
from django.shortcuts import render
from server import main
from django import http


def index(request):
    return http.HttpResponse(main.RenderTable())

def script(request):
    print("hello")
    with open('monkey/main.js', 'r') as f:
        script = f.read()
        print(script)
    return http.HttpResponse(script)