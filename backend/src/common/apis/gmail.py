import os
import smtplib
import ssl
from email.message import EmailMessage

from loguru import logger


def send_mail(subject: str, message: str) -> None:
    if os.getenv("MODE") != "prod":
        logger.info("Skipping mail notification as we are not in production")
        return
    msg = EmailMessage()
    msg.set_content(message)
    msg["Subject"] = subject
    msg["From"] = os.environ["MAIL_SENDER"]
    msg["To"] = os.environ["MAIL_RECEIVER"]

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(os.environ["MAIL_SENDER"], os.environ["MAIL_PW"])
        smtp.send_message(msg, os.environ["MAIL_SENDER"], os.environ["MAIL_RECEIVER"])
    logger.info(f"Successfully sent mail notification to {os.environ['MAIL_RECEIVER']}")
