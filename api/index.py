import os
import sys
from pathlib import Path

# Ensure backend directory is in Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / 'backend'

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

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

app = get_wsgi_application()
