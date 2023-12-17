import os
from django.shortcuts import render
from frontend.protos import level_pb2
from server import main
from django import http
from server import alternate_routes
from google.protobuf import json_format


def index(request):
    return http.HttpResponse(main.RenderTable())


def getInitialLevel(request):
    return http.HttpResponse(main.GetInitialLevel())


def getFilledLevel(request):
    level = json_format.Parse(request.GET.get('level'), level_pb2.Level())
    grid = alternate_routes.Grid(level)
    grid.GenerateInitialGrid()
    return http.HttpResponse(json_format.MessageToJson(level))


def getStyle(request):
    with open('monkey/style.css', 'r') as f:
        return http.HttpResponse(f.read(), content_type='text/css')


def script(request):
    with open('frontend/bundle.js', 'r') as f:
        return http.HttpResponse(f.read(), content_type='text/javascript')
