from django.views.generic import ListView, DetailView, CreateView
from django.urls import reverse
from django.shortcuts import get_list_or_404, get_object_or_404
from rest_framework import viewsets
from braces.views import LoginRequiredMixin
from document.serializers import *
from document.models import *

import json

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

class ContentBlockViewSet(viewsets.ModelViewSet):
    queryset = ContentBlock.objects.all()
    serializer_class = ContentBlockSerializer
    def get_queryset(self):
        if "document" in self.request.GET:
            document = get_object_or_404(Document, pk=int(self.request.GET['document']))
            document.order_all_blocks()
            return document.content.all()
        else:
            return ContentBlock.objects.all()

class DocumentCreateView(LoginRequiredMixin, CreateView):
    model = Document
    login_url = '/admin/login/'
    fields = ['title']
    template_name = 'document/document/create.html'
    def form_valid(self, form):
        form.instance.author = self.request.user
        return super(DocumentCreateView, self).form_valid(form)
    def get_success_url(self):
        return reverse("document:document_update", kwargs={
            "pk": self.object.id
        })

class DocumentListView(ListView):
    model = Document
    template_name = 'document/document/list.html'

class DocumentDetailView(DetailView):
    model = Document
    template_name = 'document/document/detail.html'

class DocumentUpdateView(DetailView):
    model = Document
    template_name = 'document/document/edit.html'

class DocumentUpdateTestView(DocumentUpdateView):
    template_name = 'document/document/test_edit.html'
