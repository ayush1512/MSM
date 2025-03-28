from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGO_URI')
    DATABASE_NAME = 'MSM'
