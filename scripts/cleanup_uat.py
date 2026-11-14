"""Cleanup disposable UAT test accounts, brands, campaigns, and comparisons."""
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.db.session import SessionLocal
from backend.app.db.models import User, Brand


def cleanup_uat_records() -> int:
    db = SessionLocal()
    try:
        u_del = (
            db.query(User)
            .filter(
                (User.email.like("director_a_%@apexathletics.com"))
                | (User.email.like("analyst_b_%@rivalcorp.com"))
            )
            .all()
        )
        for u in u_del:
            db.delete(u)

        b_del = (
            db.query(Brand)
            .filter(
                Brand.is_synthetic == False,
                Brand.name.in_(["Apex Peak Athletics", "Zenith Hydro Systems"]),
            )
            .all()
        )
        for b in b_del:
            db.delete(b)

        db.commit()
        print(f"Cleaned {len(u_del)} UAT user(s) and {len(b_del)} UAT brand(s).")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(cleanup_uat_records())

