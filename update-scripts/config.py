import os

from dotenv import load_dotenv

load_dotenv()

SEASON = os.getenv("SEASON", "2024")
ODDS_API_KEY = os.getenv("ODDS_API_KEY")
