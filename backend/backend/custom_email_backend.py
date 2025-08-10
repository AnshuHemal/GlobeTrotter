from django.core.mail.backends.smtp import EmailBackend
import smtplib

class CustomEmailBackend(EmailBackend):
    def open(self):
        if self.connection:
            return False

        try:
            # Safe default if local_hostname isn't defined
            local_hostname = getattr(self, 'local_hostname', None)

            self.connection = smtplib.SMTP(
                self.host,
                self.port,
                timeout=self.timeout
            )

            if self.use_tls:
                self.connection.ehlo()
                self.connection.starttls()
                self.connection.ehlo()

            if self.username and self.password:
                self.connection.login(self.username, self.password)

            return True
        except Exception as e:
            if not self.fail_silently:
                raise
            return False
