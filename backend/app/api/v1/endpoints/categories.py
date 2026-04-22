from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("", response_model=schemas.DataResponse[list[schemas.CategoryOut]])
def list_categories(db: Session = Depends(deps.get_db)):
    cats = db.query(models.Category).filter(models.Category.is_active == True).order_by(models.Category.sort_order).all()
    result = []
    for c in cats:
        count = db.query(func.count(models.Product.id)).filter(
            models.Product.category_id == c.id,
            models.Product.is_active == True,
        ).scalar() or 0
        out = schemas.CategoryOut.model_validate(c)
        out.product_count = count
        result.append(out)
    return {
        "success": True,
        "message": "Categories fetched successfully",
        "data": result
    }

@router.post("", response_model=schemas.DataResponse[schemas.CategoryOut], status_code=201)
def create_category(
    body: schemas.CategoryCreate,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    if db.query(models.Category).filter(models.Category.slug == body.slug).first():
        raise HTTPException(400, "Slug already exists")
    cat = models.Category(**body.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    out = schemas.CategoryOut.model_validate(cat)
    out.product_count = 0
    return {
        "success": True,
        "message": "Category created successfully",
        "data": out
    }

@router.put("/{cat_id}", response_model=schemas.DataResponse[schemas.CategoryOut])
def update_category(
    cat_id: int,
    body: schemas.CategoryUpdate,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    out = schemas.CategoryOut.model_validate(cat)
    out.product_count = db.query(func.count(models.Product.id)).filter(models.Product.category_id == cat_id).scalar() or 0
    return {
        "success": True,
        "message": "Category updated successfully",
        "data": out
    }

@router.delete("/{cat_id}", response_model=schemas.MessageResponse)
def delete_category(
    cat_id: int,
    db: Session = Depends(deps.get_db),
    _: models.User = Depends(deps.get_admin_user),
):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted", "success": True}
