import logging
import os
from datetime import datetime
from dotenv import load_dotenv
from logging.handlers import TimedRotatingFileHandler

load_dotenv()  # Load environment variables at the top-level

class Logger:
    """
    Logger class to set up and manage logging configuration.
    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.setup_logger()

    def setup_logger(self):
        try:
            # Check if TimedRotatingFileHandler already exists
            if any(isinstance(handler, TimedRotatingFileHandler) for handler in self.logger.handlers):
                return

            log_directory = './log'
            if not os.path.exists(log_directory):
                os.makedirs(log_directory)

            log_level = os.getenv("LOG_LEVEL", "INFO").upper()
            log_level = getattr(logging, log_level, logging.INFO)

            # Configure the log file path using the current date
            current_date = datetime.now().strftime('%Y-%m-%d')
            log_file = os.path.join(log_directory, f'app.log.{current_date}')

            # Use TimedRotatingFileHandler for daily rotation with a limit of 10 days
            file_handler = TimedRotatingFileHandler(
                log_file,
                when="midnight",  # Rotate at midnight
                interval=1,  # Rotate every 1 day
                backupCount=10,  # Keep the last 10 logs
                encoding='utf-8'
            )
            file_handler.setLevel(log_level)
            formatter = logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s')
            file_handler.setFormatter(formatter)

            self.logger.setLevel(log_level)
            self.logger.addHandler(file_handler)

        except Exception as e:
            print(f"Error setting up logger: {e}")
            raise

    def get_logger(self) -> logging.Logger:
        return self.logger

logger = Logger().get_logger()