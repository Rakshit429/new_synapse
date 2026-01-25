from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Enum,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import RoleName,OrgName,OrgType
# =======================
# AuthRole Model
# =======================
class AuthRole(Base):
    __tablename__ = "auth_roles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    org_name = Column(String, nullable=False, index=True)
    role_name = Column(String, nullable=False)
    org_type = Column(String, nullable=False, index=True)
    user = relationship("User", back_populates="authorizations")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "org_name",
            "role_name",
            name="uq_user_org_role",
        ),
    )
