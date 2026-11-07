import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import create_app

# Test SQLite in-memory database
TEST_DB_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def db_engine():
    """Create test in-memory database engine."""
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Provide clean database session for each test."""
    connection = db_engine.connect()
    transaction = connection.begin()
    SessionTest = sessionmaker(bind=connection, autocommit=False, autoflush=False)
    session = SessionTest()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Provide FastAPI test client with overridden database session."""
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
def test_brand(db_session):
    """Provide a seeded test brand."""
    from backend.app.db.models import Brand
    brand = Brand(
        name="The Taco Syndicate Test",
        industry="Dining",
        description="Fast-casual street taco establishment in Austin",
        target_audience="UT Austin college students",
        market_region="Austin, TX",
        brand_voice="Casual, witty",
        is_synthetic=True,
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)
    return brand

