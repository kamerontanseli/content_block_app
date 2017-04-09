from django.test import TestCase
from django.contrib.auth.models import User
from document.models import *
# Create your tests here.

class DocumentTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="kameron")
        self.model = Document.objects.create(title="test", author=self.user)
        self.blocks = [
            ContentBlock.objects.create(document=self.model),
            ContentBlock.objects.create(document=self.model),
            ContentBlock.objects.create(document=self.model),
        ]
    def test_order_all_blocks(self):
        self.model.order_all_blocks()
        ordering = list(self.model.content.values_list("order", flat=True))
        self.assertEqual(ordering, [0,1,2])
