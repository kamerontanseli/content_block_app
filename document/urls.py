from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from document.views import *

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'content_blocks', ContentBlockViewSet)

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^document/$', DocumentListView.as_view(), name="document_list"),
    url(r'^document/create/$', DocumentCreateView.as_view(), name="document_create"),
    url(r'^document/(?P<pk>\d+)/update/$', DocumentUpdateView.as_view(), name="document_update"),
    url(r'^document/(?P<pk>\d+)/update/test/$', DocumentUpdateTestView.as_view(), name="document_update_test"),
    url(r'^document/(?P<pk>\d+)/$', DocumentDetailView.as_view(), name="document_detail"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
