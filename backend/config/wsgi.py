"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

# Ensure backend root directory is in sys.path for Vercel execution
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Hook PyMySQL as MySQLdb for compatibility
try:
    import MySQLdb
except ImportError:
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except ImportError:
        pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
app = application

# Run lightweight cold-start auto-migration if using SQLite on Vercel
try:
    from django.db import connection
    if connection.vendor == 'sqlite':
        tables = connection.introspection.table_names()
        if 'django_migrations' not in tables:
            from django.core.management import call_command
            call_command('migrate', interactive=False)
except Exception as e:
    print(f"Auto-migration warning: {e}")
