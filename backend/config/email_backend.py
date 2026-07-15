import sys
from django.core.mail.backends.console import EmailBackend as ConsoleEmailBackend

class SafeConsoleEmailBackend(ConsoleEmailBackend):
    """
    Subclass of Django's ConsoleEmailBackend that catches UnicodeEncodeErrors
    when writing emails to standard output (useful on Windows consoles where CP1252
    or similar non-UTF8 encodings are used and emojis cause crashes).
    """
    def write_message(self, message):
        try:
            self.stream.write(message.message().as_bytes().decode('utf-8'))
        except UnicodeEncodeError:
            encoding = getattr(self.stream, 'encoding', None) or 'utf-8'
            decoded = message.message().as_bytes().decode('utf-8', errors='replace')
            encoded = decoded.encode(encoding, errors='replace')
            self.stream.write(encoded.decode(encoding))
        self.stream.flush()
