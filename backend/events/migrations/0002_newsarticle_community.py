from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='NewsArticle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=280)),
                ('summary', models.TextField(blank=True)),
                ('external_url', models.URLField(blank=True)),
                ('source', models.CharField(blank=True, max_length=120)),
                ('published_at', models.DateField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('sort_order', models.PositiveSmallIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'News articles',
                'ordering': ['sort_order', '-published_at', '-id'],
            },
        ),
        migrations.CreateModel(
            name='Community',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('external_url', models.URLField()),
                ('community_type', models.CharField(choices=[('telegram', 'Telegram'), ('discord', 'Discord'), ('facebook', 'Facebook'), ('linkedin', 'LinkedIn'), ('website', 'Website'), ('other', 'Other')], default='telegram', max_length=32)),
                ('is_active', models.BooleanField(default=True)),
                ('sort_order', models.PositiveSmallIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Communities',
                'ordering': ['sort_order', 'name'],
            },
        ),
    ]
