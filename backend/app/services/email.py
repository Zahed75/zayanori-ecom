"""
Email sending via Gmail SMTP using fastapi-mail
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import get_settings

settings = get_settings()

_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

_fm = FastMail(_conf)


async def send_verification_email(email: str, name: str, token: str) -> None:
    url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:40px 20px">
      <h1 style="color:#634C9F;font-size:28px;margin-bottom:8px">Verify your email 📬</h1>
      <p style="color:#374151;font-size:16px">Hi <strong>{name}</strong>,</p>
      <p style="color:#374151;font-size:15px;line-height:1.6">
        Welcome to <strong>Zayanori Store</strong>! Click the button below to verify your email address
        and activate your account.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="{url}"
           style="display:inline-block;background:#634C9F;color:white;padding:14px 40px;border-radius:12px;
                  text-decoration:none;font-weight:700;font-size:16px">
          Verify Email
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px">
        If you didn't create an account, you can safely ignore this email.<br>
        This link expires in 24 hours.
      </p>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0">
      <p style="color:#9ca3af;font-size:12px;text-align:center">
        &copy; 2026 Zayanori Store. All rights reserved.
      </p>
    </div>
    """
    msg = MessageSchema(
        subject="Verify your Zayanori account",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await _fm.send_message(msg)


async def send_password_reset_email(email: str, name: str, token: str) -> None:
    url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:40px 20px">
      <h1 style="color:#634C9F;font-size:28px;margin-bottom:8px">Reset your password 🔑</h1>
      <p style="color:#374151;font-size:16px">Hi <strong>{name}</strong>,</p>
      <p style="color:#374151;font-size:15px;line-height:1.6">
        We received a request to reset your Zayanori password. Click below to set a new one.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="{url}"
           style="display:inline-block;background:#634C9F;color:white;padding:14px 40px;border-radius:12px;
                  text-decoration:none;font-weight:700;font-size:16px">
          Reset Password
        </a>
      </div>
      <p style="color:#9ca3af;font-size:13px">
        If you didn't request a reset, you can safely ignore this email.<br>
        This link expires in 1 hour.
      </p>
    </div>
    """
    msg = MessageSchema(
        subject="Reset your Zayanori password",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await _fm.send_message(msg)


async def send_order_confirmation_email(email: str, name: str, order_id: int, total: float) -> None:
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:40px 20px">
      <h1 style="color:#634C9F;font-size:28px;margin-bottom:8px">Order Confirmed! 🎉</h1>
      <p style="color:#374151;font-size:16px">Hi <strong>{name}</strong>,</p>
      <p style="color:#374151;font-size:15px;line-height:1.6">
        Thank you for your order! Your order <strong>#{order_id}</strong> has been placed
        and will be delivered soon.
      </p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0">
        <p style="margin:0;font-size:15px;color:#374151">Order Total:
          <strong style="color:#634C9F;font-size:20px">${total:.2f}</strong>
        </p>
      </div>
      <a href="{settings.FRONTEND_URL}/account/orders"
         style="display:inline-block;background:#634C9F;color:white;padding:12px 32px;border-radius:12px;
                text-decoration:none;font-weight:700;font-size:14px">
        Track Your Order
      </a>
    </div>
    """
    msg = MessageSchema(
        subject=f"Order #{order_id} Confirmed — Zayanori Store",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )
    await _fm.send_message(msg)
