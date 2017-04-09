from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models

# Create your models here.

class Document(models.Model):
    title = models.CharField(max_length=256)
    author = models.ForeignKey(User, related_name="documents")
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def order_all_blocks(self):
        for i, c, in enumerate(self.content.all()):
            c.order = i
            c.save()

    class Meta:
        ordering = ('-updated', )

class ContentBlock(models.Model):
    order = models.PositiveIntegerField(default=0)
    document = models.ForeignKey('Document', related_name='content')
    column = models.PositiveIntegerField(default=1)
    content = models.TextField(blank=True)
    content_delta = models.TextField(blank=True)

    class Meta:
        ordering = ('order', )
