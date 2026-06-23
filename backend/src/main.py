from src.application import create_application
from src.common.dates import SystemClock
from src.config import Config

app = create_application(Config(), SystemClock())
