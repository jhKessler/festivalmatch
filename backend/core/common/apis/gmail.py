import os
import smtplib
import ssl
from email.message import EmailMessage

from loguru import logger
from config import settings, Mode

def send_mail(subject: str, message: str) -> None:
    if settings.mode != Mode.prod:
        logger.info("Skipping mail notification as we are not in production")
        return
    msg = EmailMessage()
    msg.set_content(message)
    msg["Subject"] = subject
    msg["From"] = settings.mail_sender
    msg["To"] = settings.mail_receiver 

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(settings.mail_sender, settings.mail_pw)
        smtp.send_message(msg, settings.mail_sender, settings.mail_receiver)
    logger.info(f"Successfully sent mail notification to {settings.mail_receiver} with subject {subject}")
