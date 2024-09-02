import os

import psycopg2
import psycopg2.pool
from dotenv import load_dotenv

load_dotenv()

dbname = os.getenv("DB_DATABASE")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")


pool = psycopg2.pool.SimpleConnectionPool(
    1, 20, dbname=dbname, user=user, password=password, host=host, port=port
)
