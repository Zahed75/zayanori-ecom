from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps
from app.core import security
from app.services.email import send_verification_email, send_password_reset_email

router = APIRouter()


@router.post("/register", response_model=schemas.MessageResponse, status_code=201)
async def register(
    body: schemas.UserRegister,
    bg: BackgroundTasks,
    db: Session = Depends(deps.get_db),
):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(400, "Email already registered")

    token = security.generate_token()
    user = models.User(
        name=body.name,
        email=body.email,
        hashed_password=security.get_password_hash(body.password),
        email_verify_token=token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    bg.add_task(send_verification_email, user.email, user.name, token)
    return {"message": "Account created. Please check your email to verify.", "success": True}


@router.post("/login", response_model=schemas.DataResponse[schemas.TokenResponse])
def login(body: schemas.UserLogin, db: Session = Depends(deps.get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not security.verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    if not user.is_active:
        raise HTTPException(403, "Account is disabled")

    token = security.create_access_token(user.id, user.role.value)
    return {
        "success": True,
        "message": "Login successful",
        "data": {"access_token": token, "token_type": "bearer", "user": user}
    }


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(deps.get_db)):
    user = db.query(models.User).filter(models.User.email_verify_token == token).first()
    if not user:
        raise HTTPException(400, "Invalid or expired verification link")
    user.is_email_verified = True
    user.email_verify_token = None
    db.commit()
    return {"message": "Email verified successfully!", "success": True}


@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(
    body: schemas.ForgotPasswordRequest,
    bg: BackgroundTasks,
    db: Session = Depends(deps.get_db),
):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if user:
        token = security.generate_token()
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()
        bg.add_task(send_password_reset_email, user.email, user.name, token)
    # Always return success to avoid email enumeration
    return {"message": "If that email exists, a reset link has been sent.", "success": True}


@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(body: schemas.ResetPasswordRequest, db: Session = Depends(deps.get_db)):
    user = db.query(models.User).filter(models.User.reset_token == body.token).first()
    if not user or (user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc)):
        raise HTTPException(400, "Invalid or expired reset token")
    user.hashed_password = security.get_password_hash(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully.", "success": True}


@router.get("/me", response_model=schemas.DataResponse[schemas.UserOut])
def get_me(current: models.User = Depends(deps.get_current_user)):
    return {
        "success": True,
        "message": "User profile fetched",
        "data": current
    }


@router.put("/me", response_model=schemas.DataResponse[schemas.UserOut])
def update_me(
    body: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(current, field, val)
    db.commit()
    db.refresh(current)
    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": current
    }


@router.post("/change-password", response_model=schemas.MessageResponse)
def change_password(
    body: schemas.ChangePasswordRequest,
    db: Session = Depends(deps.get_db),
    current: models.User = Depends(deps.get_current_user),
):
    if not security.verify_password(body.current_password, current.hashed_password):
        raise HTTPException(400, "Current password is incorrect")
    current.hashed_password = security.get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password changed successfully.", "success": True}
